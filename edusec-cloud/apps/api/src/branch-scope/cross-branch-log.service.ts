import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AccessTokenPayload } from "../auth/auth.service";

type CrossBranchEventType =
  | "VIEW"
  | "EDIT"
  | "STUDENT_TRANSFER"
  | "INVENTORY_TRANSFER"
  | "FINANCIAL_TRANSFER"
  | "PERMISSION_GRANT";

/**
 * Every cross-branch boundary crossing is logged (Multi-Branch doc,
 * Section 12) — a tagged subset of the main audit log, not a parallel
 * system. Only called when the acting user's own branch differs from the
 * record's branch; same-branch activity goes through the ordinary
 * AuditService instead.
 */
@Injectable()
export class CrossBranchLogService {
  constructor(private readonly prisma: PrismaService) {}

  async record(
    user: AccessTokenPayload,
    eventType: CrossBranchEventType,
    targetBranchId: string,
    entityType: string,
    entityId: string,
  ) {
    if (user.primaryBranchId === targetBranchId) return; // not a cross-branch event

    await this.prisma.crossBranchAccessLog.create({
      data: {
        tenantId: user.tenantId,
        actorId: user.sub,
        eventType,
        targetBranchId,
        entityType,
        entityId,
      },
    });
  }
}
