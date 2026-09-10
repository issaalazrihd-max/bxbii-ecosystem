import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { BranchScopeService } from "../branch-scope/branch-scope.service";
import { AuditService } from "../audit/audit.service";
import { AccessTokenPayload } from "../auth/auth.service";
import { CreateBatchDto } from "./dto/create-batch.dto";
import { UpdateBatchDto } from "./dto/update-batch.dto";

const MODULE = "erp.batches";

/**
 * Batches (ERP Phase 1 — Institute Management System): a scheduled run of a
 * Program or Course at one branch, with an optional trainer, dates, and
 * capacity. Branch-scoped exactly like Students (same BranchScopeService,
 * same view/edit split) since a batch is a real class happening at one
 * physical branch — no new authorization mechanism introduced.
 */
@Injectable()
export class BatchesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly branchScope: BranchScopeService,
    private readonly audit: AuditService,
  ) {}

  async list(user: AccessTokenPayload, branchId?: string) {
    const branchFilter = await this.branchScope.buildBranchFilter(user, "view", MODULE);

    if (branchId) {
      await this.branchScope.assertCanAccessBranch(user, branchId, "view", MODULE);
    }

    return this.prisma.batch.findMany({
      where: {
        tenantId: user.tenantId,
        branchId: branchId ?? branchFilter,
      },
      include: {
        branch: true,
        program: true,
        course: true,
        trainer: true,
        _count: { select: { enrollments: true } },
      },
      orderBy: { startDate: "desc" },
    });
  }

  async create(user: AccessTokenPayload, dto: CreateBatchDto) {
    await this.branchScope.assertCanAccessBranch(user, dto.branchId, "edit", MODULE);
    this.assertExactlyOneOffering(dto.programId, dto.courseId);

    const batch = await this.prisma.batch.create({
      data: {
        tenantId: user.tenantId,
        branchId: dto.branchId,
        programId: dto.programId,
        courseId: dto.courseId,
        trainerId: dto.trainerId,
        batchCode: dto.batchCode,
        arLabel: dto.arLabel,
        enLabel: dto.enLabel,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        schedule: dto.schedule,
        capacity: dto.capacity ?? 0,
        status: dto.status,
      },
    });

    await this.audit.record({
      tenantId: user.tenantId,
      actorId: user.sub,
      action: "erp.batch.create",
      entityType: "Batch",
      entityId: batch.id,
      after: batch,
    });

    return batch;
  }

  async update(user: AccessTokenPayload, batchId: string, dto: UpdateBatchDto) {
    const before = await this.getOrThrow(user.tenantId, batchId);
    await this.branchScope.assertCanAccessBranch(user, before.branchId, "edit", MODULE);

    if (dto.branchId && dto.branchId !== before.branchId) {
      await this.branchScope.assertCanAccessBranch(user, dto.branchId, "edit", MODULE);
    }

    const nextProgramId = dto.programId !== undefined ? dto.programId : before.programId;
    const nextCourseId = dto.courseId !== undefined ? dto.courseId : before.courseId;
    this.assertExactlyOneOffering(nextProgramId ?? undefined, nextCourseId ?? undefined);

    const batch = await this.prisma.batch.update({
      where: { id: batchId },
      data: {
        batchCode: dto.batchCode,
        branchId: dto.branchId,
        programId: dto.programId,
        courseId: dto.courseId,
        trainerId: dto.trainerId,
        arLabel: dto.arLabel,
        enLabel: dto.enLabel,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
        schedule: dto.schedule,
        capacity: dto.capacity,
        status: dto.status,
      },
    });

    await this.audit.record({
      tenantId: user.tenantId,
      actorId: user.sub,
      action: "erp.batch.update",
      entityType: "Batch",
      entityId: batch.id,
      before,
      after: batch,
    });

    return batch;
  }

  async remove(user: AccessTokenPayload, batchId: string) {
    const batch = await this.getOrThrow(user.tenantId, batchId);
    await this.branchScope.assertCanAccessBranch(user, batch.branchId, "edit", MODULE);

    const enrollmentCount = await this.prisma.enrollment.count({ where: { batchId } });
    if (enrollmentCount > 0) {
      throw new BadRequestException(
        "Cannot delete a batch with existing enrollments — withdraw or reassign students first.",
      );
    }

    await this.prisma.batch.delete({ where: { id: batchId } });

    await this.audit.record({
      tenantId: user.tenantId,
      actorId: user.sub,
      action: "erp.batch.delete",
      entityType: "Batch",
      entityId: batchId,
      before: batch,
    });

    return { id: batchId, deleted: true };
  }

  private assertExactlyOneOffering(programId?: string | null, courseId?: string | null) {
    const hasProgram = !!programId;
    const hasCourse = !!courseId;
    if (hasProgram === hasCourse) {
      throw new BadRequestException("A batch must be linked to exactly one of programId or courseId.");
    }
  }

  private async getOrThrow(tenantId: string, batchId: string) {
    const batch = await this.prisma.batch.findFirst({ where: { id: batchId, tenantId } });
    if (!batch) throw new NotFoundException("Batch not found");
    return batch;
  }
}
