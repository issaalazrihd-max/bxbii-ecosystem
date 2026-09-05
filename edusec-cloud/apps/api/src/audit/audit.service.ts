import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

/**
 * Institute-wide audit trail (Phase 1 Architecture, Section 4.5): actor,
 * action, entity, before/after — a cross-cutting concern, not a per-module
 * bolt-on. CrossBranchLogService (branch-scope module) records the subset
 * of these events that cross a branch boundary.
 */
@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async record(params: {
    tenantId: string;
    actorId?: string;
    action: string;
    entityType: string;
    entityId: string;
    before?: unknown;
    after?: unknown;
  }) {
    await this.prisma.auditLog.create({
      data: {
        tenantId: params.tenantId,
        actorId: params.actorId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        beforeData: params.before as any,
        afterData: params.after as any,
      },
    });
  }
}
