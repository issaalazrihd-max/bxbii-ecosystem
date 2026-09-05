import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AccessTokenPayload } from "../auth/auth.service";

export type BranchAccessMode = "view" | "edit";

export interface EffectiveBranchAccess {
  isHeadOffice: boolean;
  /** Branch Private (default): the user's own branch. Always included unless Head Office. */
  ownBranchIds: string[];
  /** Own branch + every branch explicitly granted at least view access. */
  viewableBranchIds: string[];
  /** Own branch + every branch explicitly granted edit access. */
  editableBranchIds: string[];
}

/**
 * Resolves "does this user have branch access to this record's branch?" —
 * the second half of the effective-permission check (Multi-Branch doc,
 * Section 4.2-4.3). This is the API-layer half of the defense-in-depth
 * design; PostgreSQL Row-Level Security (see packages/db/prisma/migrations
 * .../rls.sql) is the second, independent layer.
 */
@Injectable()
export class BranchScopeService {
  constructor(private readonly prisma: PrismaService) {}

  async getEffectiveAccess(user: AccessTokenPayload, moduleScope?: string): Promise<EffectiveBranchAccess> {
    const grants = await this.prisma.userBranchAccess.findMany({
      where: {
        userId: user.sub,
        OR: [{ moduleScope: null }, ...(moduleScope ? [{ moduleScope }] : [])],
      },
    });

    const isHeadOffice = grants.some((g) => g.accessLevel === "HEAD_OFFICE");
    const ownBranchIds = user.primaryBranchId ? [user.primaryBranchId] : [];

    const viewGrantBranchIds = grants
      .filter((g) => g.branchId && (g.accessLevel === "CROSS_BRANCH_VIEW" || g.accessLevel === "CROSS_BRANCH_EDIT"))
      .map((g) => g.branchId!) as string[];

    const editGrantBranchIds = grants
      .filter((g) => g.branchId && g.accessLevel === "CROSS_BRANCH_EDIT")
      .map((g) => g.branchId!) as string[];

    return {
      isHeadOffice,
      ownBranchIds,
      viewableBranchIds: Array.from(new Set([...ownBranchIds, ...viewGrantBranchIds])),
      editableBranchIds: Array.from(new Set([...ownBranchIds, ...editGrantBranchIds])),
    };
  }

  /**
   * Returns a Prisma `where` fragment for a branch-scoped table's branchId
   * column: `undefined` means "no filter" (Head Office sees everything),
   * otherwise `{ in: [...] }` restricted to what the user may access.
   */
  async buildBranchFilter(user: AccessTokenPayload, mode: BranchAccessMode, moduleScope?: string) {
    const access = await this.getEffectiveAccess(user, moduleScope);
    if (access.isHeadOffice) return undefined;

    const allowed = mode === "edit" ? access.editableBranchIds : access.viewableBranchIds;
    return { in: allowed };
  }

  async assertCanAccessBranch(user: AccessTokenPayload, branchId: string, mode: BranchAccessMode, moduleScope?: string) {
    const access = await this.getEffectiveAccess(user, moduleScope);
    if (access.isHeadOffice) return;

    const allowed = mode === "edit" ? access.editableBranchIds : access.viewableBranchIds;
    if (!allowed.includes(branchId)) {
      throw new ForbiddenException(`You do not have ${mode} access to this branch.`);
    }
  }
}
