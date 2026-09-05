import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { BranchScopeService } from "../branch-scope/branch-scope.service";
import { AuditService } from "../audit/audit.service";
import { AccessTokenPayload } from "../auth/auth.service";
import { CreateBranchDto } from "./dto/create-branch.dto";

@Injectable()
export class BranchesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly branchScope: BranchScopeService,
    private readonly audit: AuditService,
  ) {}

  /** Branches is shared/global data (Multi-Branch doc, Section 9.1) — every
   * authenticated user may list branches; branch-scoping restricts
   * operational records (students, inventory, ...), not the branch registry
   * itself. Head Office / branch admin permissions still gate create/update.
   */
  async list(user: AccessTokenPayload) {
    return this.prisma.branch.findMany({
      where: { tenantId: user.tenantId },
      orderBy: { branchCode: "asc" },
    });
  }

  async create(user: AccessTokenPayload, dto: CreateBranchDto) {
    const branch = await this.prisma.branch.create({
      data: {
        tenantId: user.tenantId,
        branchCode: dto.branchCode,
        branchName: dto.branchName,
        branchType: dto.branchType,
        parentBranchId: dto.parentBranchId,
        city: dto.city,
        country: dto.country,
      },
    });

    await this.audit.record({
      tenantId: user.tenantId,
      actorId: user.sub,
      action: "branch.create",
      entityType: "Branch",
      entityId: branch.id,
      after: branch,
    });

    return branch;
  }
}
