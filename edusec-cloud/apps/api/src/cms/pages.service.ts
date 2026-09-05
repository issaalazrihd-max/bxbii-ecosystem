import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { AccessTokenPayload } from "../auth/auth.service";
import { CreatePageDto } from "./dto/create-page.dto";
import { UpdatePageDto } from "./dto/update-page.dto";
import { CreateSectionDto } from "./dto/create-section.dto";
import { UpdateSectionDto } from "./dto/update-section.dto";
import { ReorderSectionsDto } from "./dto/reorder-sections.dto";

/**
 * CMS & Page Builder (bxbii Ecosystem brief, Sections 29-30). Pages and their
 * sections are platform-wide (not branch-scoped) — the public website is one
 * front door for the whole tenant. "isSystem" pages (e.g. Home) can still be
 * edited freely but are protected from deletion, since navigation and the
 * public site assume they exist.
 */
@Injectable()
export class PagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  list(user: AccessTokenPayload) {
    return this.prisma.page.findMany({
      where: { tenantId: user.tenantId },
      orderBy: { createdAt: "asc" },
    });
  }

  async findOneOrThrow(user: AccessTokenPayload, pageId: string) {
    const page = await this.prisma.page.findFirst({
      where: { id: pageId, tenantId: user.tenantId },
      include: { sections: { orderBy: { position: "asc" } } },
    });
    if (!page) throw new NotFoundException("Page not found");
    return page;
  }

  async create(user: AccessTokenPayload, dto: CreatePageDto) {
    const page = await this.prisma.page.create({
      data: {
        tenantId: user.tenantId,
        slug: dto.slug,
        arTitle: dto.arTitle,
        enTitle: dto.enTitle,
        status: dto.status,
        createdById: user.sub,
      },
    });
    await this.audit.record({
      tenantId: user.tenantId,
      actorId: user.sub,
      action: "cms.page.create",
      entityType: "Page",
      entityId: page.id,
      after: page,
    });
    return page;
  }

  async update(user: AccessTokenPayload, pageId: string, dto: UpdatePageDto) {
    const before = await this.findOneOrThrow(user, pageId);
    const page = await this.prisma.page.update({
      where: { id: pageId },
      data: {
        slug: dto.slug,
        arTitle: dto.arTitle,
        enTitle: dto.enTitle,
        status: dto.status,
      },
    });
    await this.audit.record({
      tenantId: user.tenantId,
      actorId: user.sub,
      action: "cms.page.update",
      entityType: "Page",
      entityId: page.id,
      before,
      after: page,
    });
    return page;
  }

  async remove(user: AccessTokenPayload, pageId: string) {
    const page = await this.findOneOrThrow(user, pageId);
    if (page.isSystem) {
      throw new ForbiddenException("This page is used by the platform itself and can't be deleted.");
    }
    await this.prisma.page.delete({ where: { id: pageId } });
    await this.audit.record({
      tenantId: user.tenantId,
      actorId: user.sub,
      action: "cms.page.delete",
      entityType: "Page",
      entityId: pageId,
      before: page,
    });
    return { id: pageId, deleted: true };
  }

  // --- Sections (Section 30 — the Page Builder block palette) -------------

  async addSection(user: AccessTokenPayload, pageId: string, dto: CreateSectionDto) {
    const page = await this.findOneOrThrow(user, pageId);
    const maxPosition = page.sections.reduce((max, s) => Math.max(max, s.position), -1);
    const section = await this.prisma.pageSection.create({
      data: {
        tenantId: user.tenantId,
        pageId,
        sectionType: dto.sectionType,
        arContent: dto.arContent ?? {},
        enContent: dto.enContent ?? {},
        isVisible: dto.isVisible ?? true,
        position: maxPosition + 1,
      },
    });
    await this.audit.record({
      tenantId: user.tenantId,
      actorId: user.sub,
      action: "cms.section.create",
      entityType: "PageSection",
      entityId: section.id,
      after: section,
    });
    return section;
  }

  async updateSection(user: AccessTokenPayload, pageId: string, sectionId: string, dto: UpdateSectionDto) {
    const section = await this.getSectionOrThrow(user, pageId, sectionId);
    const updated = await this.prisma.pageSection.update({
      where: { id: sectionId },
      data: {
        arContent: dto.arContent,
        enContent: dto.enContent,
        isVisible: dto.isVisible,
      },
    });
    await this.audit.record({
      tenantId: user.tenantId,
      actorId: user.sub,
      action: "cms.section.update",
      entityType: "PageSection",
      entityId: sectionId,
      before: section,
      after: updated,
    });
    return updated;
  }

  async removeSection(user: AccessTokenPayload, pageId: string, sectionId: string) {
    const section = await this.getSectionOrThrow(user, pageId, sectionId);
    await this.prisma.pageSection.delete({ where: { id: sectionId } });
    await this.audit.record({
      tenantId: user.tenantId,
      actorId: user.sub,
      action: "cms.section.delete",
      entityType: "PageSection",
      entityId: sectionId,
      before: section,
    });
    return { id: sectionId, deleted: true };
  }

  async reorderSections(user: AccessTokenPayload, pageId: string, dto: ReorderSectionsDto) {
    const page = await this.findOneOrThrow(user, pageId);
    const known = new Set(page.sections.map((s) => s.id));
    if (dto.orderedSectionIds.length !== known.size || !dto.orderedSectionIds.every((id) => known.has(id))) {
      throw new BadRequestException("orderedSectionIds must contain exactly this page's current sections");
    }
    await this.prisma.$transaction(
      dto.orderedSectionIds.map((id, index) =>
        this.prisma.pageSection.update({ where: { id }, data: { position: index } }),
      ),
    );
    return this.findOneOrThrow(user, pageId);
  }

  private async getSectionOrThrow(user: AccessTokenPayload, pageId: string, sectionId: string) {
    const section = await this.prisma.pageSection.findFirst({
      where: { id: sectionId, pageId, tenantId: user.tenantId },
    });
    if (!section) throw new NotFoundException("Section not found");
    return section;
  }

  // --- Public read model (for the website itself, no auth) ----------------

  async publicFindBySlug(tenantId: string, slug: string) {
    const page = await this.prisma.page.findFirst({
      where: { tenantId, slug, status: "PUBLISHED" },
      include: { sections: { where: { isVisible: true }, orderBy: { position: "asc" } } },
    });
    if (!page) throw new NotFoundException("Page not found");
    return page;
  }

  /**
   * Same as publicFindBySlug, but resolves the tenant itself first. Multi-
   * tenancy is fixed to one row in v1 (see schema.prisma comment on Tenant),
   * so the unauthenticated public site — which has no @CurrentUser to read a
   * tenantId from — can safely look up "the" tenant here. When true
   * multi-institute support lands (brief Section 43), this is the one place
   * that will need to resolve the tenant from the request's host/domain
   * instead.
   */
  async publicFindBySlugForTenant(slug: string) {
    const tenant = await this.prisma.tenant.findFirstOrThrow();
    return this.publicFindBySlug(tenant.id, slug);
  }
}
