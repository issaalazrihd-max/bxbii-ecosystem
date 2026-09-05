import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { AccessTokenPayload } from "../auth/auth.service";
import { CreateNavigationItemDto } from "./dto/create-navigation-item.dto";
import { UpdateNavigationItemDto } from "./dto/update-navigation-item.dto";
import { ReorderNavigationDto } from "./dto/reorder-navigation.dto";

/**
 * Fully dynamic Navigation Management (bxbii Ecosystem brief, Section 31) —
 * no menu item is hard-coded into the frontend. Items are stored flat with a
 * self-referencing parentId for one level of submenu, then assembled into a
 * tree for both the admin UI and the public site.
 */
@Injectable()
export class NavigationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async listTree(tenantId: string, opts: { onlyVisible: boolean }) {
    const items = await this.prisma.navigationItem.findMany({
      where: { tenantId, ...(opts.onlyVisible ? { isVisible: true } : {}) },
      include: { targetPage: { select: { slug: true, status: true } } },
      orderBy: { position: "asc" },
    });
    return buildTree(items, opts.onlyVisible);
  }

  async create(user: AccessTokenPayload, dto: CreateNavigationItemDto) {
    const maxPosition = await this.prisma.navigationItem.aggregate({
      where: { tenantId: user.tenantId, parentId: dto.parentId ?? null },
      _max: { position: true },
    });
    const item = await this.prisma.navigationItem.create({
      data: {
        tenantId: user.tenantId,
        arLabel: dto.arLabel,
        enLabel: dto.enLabel,
        linkType: dto.linkType,
        targetPageId: dto.linkType === "PAGE" ? dto.targetPageId : undefined,
        externalUrl: dto.linkType === "EXTERNAL_URL" ? dto.externalUrl : undefined,
        openInNewTab: dto.openInNewTab ?? false,
        parentId: dto.parentId,
        position: (maxPosition._max.position ?? -1) + 1,
      },
    });
    await this.audit.record({
      tenantId: user.tenantId,
      actorId: user.sub,
      action: "cms.navigation.create",
      entityType: "NavigationItem",
      entityId: item.id,
      after: item,
    });
    return item;
  }

  async update(user: AccessTokenPayload, itemId: string, dto: UpdateNavigationItemDto) {
    const before = await this.getOrThrow(user.tenantId, itemId);
    const item = await this.prisma.navigationItem.update({
      where: { id: itemId },
      data: {
        arLabel: dto.arLabel,
        enLabel: dto.enLabel,
        linkType: dto.linkType,
        targetPageId: dto.targetPageId,
        externalUrl: dto.externalUrl,
        openInNewTab: dto.openInNewTab,
        parentId: dto.parentId,
        isVisible: dto.isVisible,
      },
    });
    await this.audit.record({
      tenantId: user.tenantId,
      actorId: user.sub,
      action: "cms.navigation.update",
      entityType: "NavigationItem",
      entityId: item.id,
      before,
      after: item,
    });
    return item;
  }

  async remove(user: AccessTokenPayload, itemId: string) {
    const item = await this.getOrThrow(user.tenantId, itemId);
    // Children lose their parent rather than cascade-deleting (Section 31 —
    // reorganizing a menu shouldn't silently destroy submenu items).
    await this.prisma.navigationItem.updateMany({ where: { parentId: itemId }, data: { parentId: null } });
    await this.prisma.navigationItem.delete({ where: { id: itemId } });
    await this.audit.record({
      tenantId: user.tenantId,
      actorId: user.sub,
      action: "cms.navigation.delete",
      entityType: "NavigationItem",
      entityId: itemId,
      before: item,
    });
    return { id: itemId, deleted: true };
  }

  async reorder(user: AccessTokenPayload, dto: ReorderNavigationDto) {
    await this.prisma.$transaction(
      dto.items.map((entry, index) =>
        this.prisma.navigationItem.update({
          where: { id: entry.id },
          data: { position: index, parentId: entry.parentId ?? null },
        }),
      ),
    );
    return this.listTree(user.tenantId, { onlyVisible: false });
  }

  private async getOrThrow(tenantId: string, itemId: string) {
    const item = await this.prisma.navigationItem.findFirst({ where: { id: itemId, tenantId } });
    if (!item) throw new NotFoundException("Navigation item not found");
    return item;
  }

  /**
   * Same as listTree(tenantId, {onlyVisible: true}), but resolves the
   * tenant itself first — see the matching note on
   * PagesService.publicFindBySlugForTenant for why this is safe while
   * multi-tenancy is fixed to one row.
   */
  async publicListTree() {
    const tenant = await this.prisma.tenant.findFirstOrThrow();
    return this.listTree(tenant.id, { onlyVisible: true });
  }
}

type NavRow = {
  id: string;
  parentId: string | null;
  arLabel: string;
  enLabel: string;
  linkType: string;
  externalUrl: string | null;
  openInNewTab: boolean;
  isVisible: boolean;
  position: number;
  targetPage: { slug: string; status: string } | null;
};

function resolveHref(row: NavRow): string | null {
  if (row.linkType === "EXTERNAL_URL") return row.externalUrl;
  if (row.linkType === "PAGE" && row.targetPage) return row.targetPage.slug === "" ? "/" : `/${row.targetPage.slug}`;
  return null; // COURSE / PROJECT / PRODUCT — reserved until those modules exist
}

function buildTree(rows: NavRow[], onlyVisible: boolean) {
  const byId = new Map(rows.map((r) => [r.id, { ...r, href: resolveHref(r), children: [] as unknown[] }]));
  const roots: ReturnType<typeof byId.get>[] = [];
  for (const row of byId.values()) {
    if (row.parentId && byId.has(row.parentId)) {
      (byId.get(row.parentId)!.children as unknown[]).push(row);
    } else if (!onlyVisible || !row.parentId) {
      roots.push(row);
    }
  }
  return roots;
}
