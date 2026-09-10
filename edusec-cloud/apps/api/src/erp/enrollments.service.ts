import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@edusec/db";
import { PrismaService } from "../prisma/prisma.service";
import { BranchScopeService } from "../branch-scope/branch-scope.service";
import { AuditService } from "../audit/audit.service";
import { AccessTokenPayload } from "../auth/auth.service";
import { CreateEnrollmentDto } from "./dto/create-enrollment.dto";
import { UpdateEnrollmentDto } from "./dto/update-enrollment.dto";

const MODULE = "erp.enrollments";

/**
 * Enrollments (ERP Phase 1) — links a Student to a Batch, the previously
 * missing piece behind "how do I register students into a scheduled
 * class". Enrollment carries no branch_id of its own; branch scoping is
 * enforced transitively through its Batch's branch, same access rules as
 * Batches (BranchScopeService).
 */
@Injectable()
export class EnrollmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly branchScope: BranchScopeService,
    private readonly audit: AuditService,
  ) {}

  async list(user: AccessTokenPayload, filters: { batchId?: string; studentId?: string }) {
    const branchFilter = await this.branchScope.buildBranchFilter(user, "view", MODULE);

    return this.prisma.enrollment.findMany({
      where: {
        tenantId: user.tenantId,
        batchId: filters.batchId,
        studentId: filters.studentId,
        batch: branchFilter ? { branchId: branchFilter } : undefined,
      },
      include: {
        student: true,
        batch: { include: { branch: true, program: true, course: true, trainer: true } },
      },
      orderBy: { enrollmentDate: "desc" },
    });
  }

  async create(user: AccessTokenPayload, dto: CreateEnrollmentDto) {
    const batch = await this.prisma.batch.findFirst({
      where: { id: dto.batchId, tenantId: user.tenantId },
      include: { _count: { select: { enrollments: { where: { status: { in: ["ENROLLED", "WAITLISTED"] } } } } } },
    });
    if (!batch) throw new NotFoundException("Batch not found");
    await this.branchScope.assertCanAccessBranch(user, batch.branchId, "edit", MODULE);

    const student = await this.prisma.student.findFirst({ where: { id: dto.studentId, tenantId: user.tenantId } });
    if (!student) throw new NotFoundException("Student not found");

    let status = dto.status ?? "ENROLLED";
    if (status === "ENROLLED" && batch.capacity > 0) {
      const activeCount = await this.prisma.enrollment.count({
        where: { batchId: batch.id, status: { in: ["ENROLLED", "COMPLETED"] } },
      });
      if (activeCount >= batch.capacity) {
        status = "WAITLISTED";
      }
    }

    let enrollment;
    try {
      enrollment = await this.prisma.enrollment.create({
        data: {
          tenantId: user.tenantId,
          studentId: dto.studentId,
          batchId: dto.batchId,
          status,
          notes: dto.notes,
        },
      });
    } catch (err) {
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        throw new BadRequestException("This student is already enrolled in this batch.");
      }
      throw err;
    }

    await this.audit.record({
      tenantId: user.tenantId,
      actorId: user.sub,
      action: "erp.enrollment.create",
      entityType: "Enrollment",
      entityId: enrollment.id,
      after: enrollment,
    });

    return enrollment;
  }

  async update(user: AccessTokenPayload, enrollmentId: string, dto: UpdateEnrollmentDto) {
    const before = await this.getOrThrow(user.tenantId, enrollmentId);
    await this.branchScope.assertCanAccessBranch(user, before.batch.branchId, "edit", MODULE);

    const enrollment = await this.prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { status: dto.status, notes: dto.notes },
    });

    await this.audit.record({
      tenantId: user.tenantId,
      actorId: user.sub,
      action: "erp.enrollment.update",
      entityType: "Enrollment",
      entityId: enrollment.id,
      before,
      after: enrollment,
    });

    return enrollment;
  }

  async remove(user: AccessTokenPayload, enrollmentId: string) {
    const enrollment = await this.getOrThrow(user.tenantId, enrollmentId);
    await this.branchScope.assertCanAccessBranch(user, enrollment.batch.branchId, "edit", MODULE);

    await this.prisma.enrollment.delete({ where: { id: enrollmentId } });

    await this.audit.record({
      tenantId: user.tenantId,
      actorId: user.sub,
      action: "erp.enrollment.delete",
      entityType: "Enrollment",
      entityId: enrollmentId,
      before: enrollment,
    });

    return { id: enrollmentId, deleted: true };
  }

  private async getOrThrow(tenantId: string, enrollmentId: string) {
    const enrollment = await this.prisma.enrollment.findFirst({
      where: { id: enrollmentId, tenantId },
      include: { batch: true },
    });
    if (!enrollment) throw new NotFoundException("Enrollment not found");
    return enrollment;
  }
}
