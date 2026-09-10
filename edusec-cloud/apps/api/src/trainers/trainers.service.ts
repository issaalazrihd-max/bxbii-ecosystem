import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { AccessTokenPayload } from "../auth/auth.service";
import { CreateTrainerDto } from "./dto/create-trainer.dto";

/**
 * Trainers (Phase 1 demo scope — schema.prisma's Trainer model already
 * existed, but had no API module at all until now). List/create only, same
 * minimal shape as BranchesService: every authenticated user with
 * trainers.list may see the roster (it's needed to populate a dropdown
 * when scheduling an ERP Batch), trainers.create gates adding one. A full
 * Trainer Management module (profile editing, qualifications, availability)
 * is a later phase.
 */
@Injectable()
export class TrainersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  list(user: AccessTokenPayload) {
    return this.prisma.trainer.findMany({
      where: { tenantId: user.tenantId },
      include: { primaryBranch: true },
      orderBy: { fullName: "asc" },
    });
  }

  async create(user: AccessTokenPayload, dto: CreateTrainerDto) {
    const trainer = await this.prisma.trainer.create({
      data: {
        tenantId: user.tenantId,
        trainerCode: dto.trainerCode,
        fullName: dto.fullName,
        specialization: dto.specialization,
        email: dto.email,
        mobile: dto.mobile,
        teachingHours: dto.teachingHours ?? 0,
        primaryBranchId: dto.branchId,
      },
    });

    await this.audit.record({
      tenantId: user.tenantId,
      actorId: user.sub,
      action: "trainer.create",
      entityType: "Trainer",
      entityId: trainer.id,
      after: trainer,
    });

    return trainer;
  }
}
