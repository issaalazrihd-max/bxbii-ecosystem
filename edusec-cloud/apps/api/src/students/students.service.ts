import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { BranchScopeService } from "../branch-scope/branch-scope.service";
import { CrossBranchLogService } from "../branch-scope/cross-branch-log.service";
import { AuditService } from "../audit/audit.service";
import { AccessTokenPayload } from "../auth/auth.service";
import { CreateStudentDto } from "./dto/create-student.dto";
import { SearchStudentsDto } from "./dto/search-students.dto";
import { CreateTransferRequestDto } from "./dto/create-transfer-request.dto";
import { ReceivingBranchReviewDto } from "./dto/receiving-branch-review.dto";

const MODULE = "students";

@Injectable()
export class StudentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly branchScope: BranchScopeService,
    private readonly crossBranchLog: CrossBranchLogService,
    private readonly audit: AuditService,
  ) {}

  // -- Read -------------------------------------------------------------

  /** Global search (Multi-Branch doc, Section 5.2) — scoped to whatever branches the caller can view. */
  async search(user: AccessTokenPayload, dto: SearchStudentsDto) {
    const branchFilter = await this.branchScope.buildBranchFilter(user, "view", MODULE);

    if (dto.branchId) {
      await this.branchScope.assertCanAccessBranch(user, dto.branchId, "view", MODULE);
    }

    const students = await this.prisma.student.findMany({
      where: {
        tenantId: user.tenantId,
        currentBranchId: dto.branchId ?? branchFilter,
        ...(dto.query
          ? {
              OR: [
                { firstName: { contains: dto.query, mode: "insensitive" } },
                { lastName: { contains: dto.query, mode: "insensitive" } },
                { studentCode: { contains: dto.query, mode: "insensitive" } },
                { mobile: { contains: dto.query } },
                { email: { contains: dto.query, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: { currentBranch: true, primaryBranch: true },
      orderBy: { lastName: "asc" },
    });

    return students;
  }

  async findOne(user: AccessTokenPayload, id: string) {
    const student = await this.prisma.student.findFirst({
      where: { id, tenantId: user.tenantId },
      include: { currentBranch: true, primaryBranch: true, branchHistory: true },
    });
    if (!student) throw new NotFoundException("Student not found.");

    await this.branchScope.assertCanAccessBranch(user, student.currentBranchId, "view", MODULE);
    await this.crossBranchLog.record(user, "VIEW", student.currentBranchId, "Student", student.id);

    return student;
  }

  // -- Write --------------------------------------------------------------

  async create(user: AccessTokenPayload, dto: CreateStudentDto) {
    await this.branchScope.assertCanAccessBranch(user, dto.branchId, "edit", MODULE);

    const student = await this.prisma.$transaction(async (tx) => {
      const created = await tx.student.create({
        data: {
          tenantId: user.tenantId,
          studentCode: dto.studentCode,
          firstName: dto.firstName,
          middleName: dto.middleName,
          lastName: dto.lastName,
          email: dto.email,
          mobile: dto.mobile,
          primaryBranchId: dto.branchId,
          currentBranchId: dto.branchId,
        },
      });

      await tx.studentBranchHistory.create({
        data: { studentId: created.id, branchId: dto.branchId, startDate: new Date() },
      });

      return created;
    });

    await this.audit.record({
      tenantId: user.tenantId,
      actorId: user.sub,
      action: "student.create",
      entityType: "Student",
      entityId: student.id,
      after: student,
    });

    return student;
  }

  // -- Transfer workflow (Multi-Branch doc, Section 6) ---------------------

  async requestTransfer(user: AccessTokenPayload, studentId: string, dto: CreateTransferRequestDto) {
    const student = await this.prisma.student.findFirst({ where: { id: studentId, tenantId: user.tenantId } });
    if (!student) throw new NotFoundException("Student not found.");

    // Only someone with edit access to the CURRENT branch (or Head Office) may initiate.
    await this.branchScope.assertCanAccessBranch(user, student.currentBranchId, "edit", MODULE);

    if (dto.toBranchId === student.currentBranchId) {
      throw new BadRequestException("Destination branch must differ from the student's current branch.");
    }

    const transfer = await this.prisma.studentTransferRequest.create({
      data: {
        tenantId: user.tenantId,
        studentId: student.id,
        fromBranchId: student.currentBranchId,
        toBranchId: dto.toBranchId,
        reason: dto.reason,
        notes: dto.notes,
        financialPolicy: dto.financialPolicy,
        requestedById: user.sub,
        status: "REQUESTED",
        ...(dto.transferProfile !== undefined && { transferProfile: dto.transferProfile }),
        ...(dto.transferDocuments !== undefined && { transferDocuments: dto.transferDocuments }),
        ...(dto.transferAcademicHistory !== undefined && { transferAcademicHistory: dto.transferAcademicHistory }),
        ...(dto.transferAttendanceHistory !== undefined && { transferAttendanceHistory: dto.transferAttendanceHistory }),
        ...(dto.transferCourseHistory !== undefined && { transferCourseHistory: dto.transferCourseHistory }),
        ...(dto.transferAssessmentResults !== undefined && { transferAssessmentResults: dto.transferAssessmentResults }),
        ...(dto.transferCertificates !== undefined && { transferCertificates: dto.transferCertificates }),
        ...(dto.transferFinancialHistory !== undefined && { transferFinancialHistory: dto.transferFinancialHistory }),
      },
    });

    await this.crossBranchLog.record(user, "STUDENT_TRANSFER", dto.toBranchId, "StudentTransferRequest", transfer.id);
    return transfer;
  }

  private async getTransferOrThrow(user: AccessTokenPayload, transferId: string) {
    const transfer = await this.prisma.studentTransferRequest.findFirst({
      where: { id: transferId, tenantId: user.tenantId },
    });
    if (!transfer) throw new NotFoundException("Transfer request not found.");
    return transfer;
  }

  /** Step 2: current branch confirms no blocking obligations. */
  async currentBranchReview(user: AccessTokenPayload, transferId: string) {
    const transfer = await this.getTransferOrThrow(user, transferId);
    if (transfer.status !== "REQUESTED") {
      throw new BadRequestException(`Cannot review from status ${transfer.status}.`);
    }
    await this.branchScope.assertCanAccessBranch(user, transfer.fromBranchId, "edit", MODULE);

    return this.prisma.studentTransferRequest.update({
      where: { id: transferId },
      data: {
        status: "CURRENT_BRANCH_REVIEW",
        currentBranchReviewedById: user.sub,
        currentBranchReviewedAt: new Date(),
      },
    });
  }

  /** Step 3: receiving branch runs the academic validation checklist (Section 6.4). */
  async receivingBranchReview(user: AccessTokenPayload, transferId: string, dto: ReceivingBranchReviewDto) {
    const transfer = await this.getTransferOrThrow(user, transferId);
    if (transfer.status !== "CURRENT_BRANCH_REVIEW") {
      throw new BadRequestException(`Cannot review from status ${transfer.status}.`);
    }
    await this.branchScope.assertCanAccessBranch(user, transfer.toBranchId, "edit", MODULE);

    const allChecksPassed = Object.entries(dto)
      .filter(([key]) => key !== "notes")
      .every(([, value]) => value === true);

    return this.prisma.studentTransferRequest.update({
      where: { id: transferId },
      data: {
        status: allChecksPassed ? "RECEIVING_BRANCH_REVIEW" : "REJECTED",
        receivingBranchReviewedById: user.sub,
        receivingBranchReviewedAt: new Date(),
        academicValidation: dto as any,
      },
    });
  }

  /** Step 4: designated approver signs off — requires both reviews complete. */
  async approve(user: AccessTokenPayload, transferId: string) {
    const transfer = await this.getTransferOrThrow(user, transferId);
    if (transfer.status !== "RECEIVING_BRANCH_REVIEW") {
      throw new BadRequestException(`Cannot approve from status ${transfer.status}.`);
    }

    return this.prisma.studentTransferRequest.update({
      where: { id: transferId },
      data: { status: "APPROVED", approvedById: user.sub, approvedAt: new Date() },
    });
  }

  /** Step 5+6: apply the financial policy and move the student — atomic, and writes the permanent history record (Section 6.5). */
  async complete(user: AccessTokenPayload, transferId: string) {
    const transfer = await this.getTransferOrThrow(user, transferId);
    if (transfer.status !== "APPROVED") {
      throw new BadRequestException(`Cannot complete from status ${transfer.status}.`);
    }
    if (!transfer.financialPolicy) {
      throw new BadRequestException("A financial transfer policy must be set before completing the transfer (Section 6.3).");
    }

    const categoriesTransferred = {
      profile: transfer.transferProfile,
      documents: transfer.transferDocuments,
      academicHistory: transfer.transferAcademicHistory,
      attendanceHistory: transfer.transferAttendanceHistory,
      courseHistory: transfer.transferCourseHistory,
      assessmentResults: transfer.transferAssessmentResults,
      certificates: transfer.transferCertificates,
      financialHistory: transfer.transferFinancialHistory,
    };

    const result = await this.prisma.$transaction(async (tx) => {
      // Close out the old branch-history row and open a new one.
      await tx.studentBranchHistory.updateMany({
        where: { studentId: transfer.studentId, branchId: transfer.fromBranchId, endDate: null },
        data: { endDate: new Date() },
      });
      await tx.studentBranchHistory.create({
        data: { studentId: transfer.studentId, branchId: transfer.toBranchId, startDate: new Date() },
      });

      const student = await tx.student.update({
        where: { id: transfer.studentId },
        data: { currentBranchId: transfer.toBranchId },
      });

      const history = await tx.studentTransferHistory.create({
        data: {
          tenantId: transfer.tenantId,
          studentId: transfer.studentId,
          previousBranchId: transfer.fromBranchId,
          newBranchId: transfer.toBranchId,
          transferDate: new Date(),
          requestedById: transfer.requestedById,
          approvedById: transfer.approvedById!,
          reason: transfer.reason,
          notes: transfer.notes,
          academicStatus: "Validated", // Section 6.4 checklist passed to reach APPROVED
          financialStatus: transfer.financialPolicy,
          categoriesTransferred,
        },
      });

      await tx.studentTransferRequest.update({
        where: { id: transferId },
        data: { status: "COMPLETED", completedAt: new Date() },
      });

      return { student, history };
    });

    await this.audit.record({
      tenantId: user.tenantId,
      actorId: user.sub,
      action: "student.transfer.complete",
      entityType: "Student",
      entityId: transfer.studentId,
      before: { branchId: transfer.fromBranchId },
      after: { branchId: transfer.toBranchId },
    });

    return result;
  }

  async reject(user: AccessTokenPayload, transferId: string, reason?: string) {
    const transfer = await this.getTransferOrThrow(user, transferId);
    if (["COMPLETED", "REJECTED", "CANCELLED"].includes(transfer.status)) {
      throw new BadRequestException(`Cannot reject a transfer already in status ${transfer.status}.`);
    }

    return this.prisma.studentTransferRequest.update({
      where: { id: transferId },
      data: { status: "REJECTED", notes: reason ? `${transfer.notes ?? ""}\nRejected: ${reason}`.trim() : transfer.notes },
    });
  }
}
