import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { AccessTokenPayload } from "../auth/auth.service";
import { CreatePartnerDto } from "./dto/create-partner.dto";
import { UpdatePartnerDto } from "./dto/update-partner.dto";
import { ReorderPartnersDto } from "./dto/reorder-partners.dto";

/**
 * Partner logos (bxbii Ecosystem brief — Partners module), backing the
 * PARTNERS page-builder block. Platform-wide, not branch-scoped — same as
 * Pages/NavigationItem/Program, since the partner list is one shared roster
 * for the whole tenant.
 */
@Injectable()
export class PartnersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  list(user: AccessTokenPayload) {
    return this.prisma.partner.findMany({
      where: { tenantId: user.tenantId },
      orderBy: { position: "asc" },
    });
  }

  async create(user: AccessTokenPayload, dto: CreatePartnerDto) {
    const maxPosition = await this.prisma.partner.aggregate({
      where: { tenantId: user.tenantId },
      _max: { position: true },
    });
    const partner = await this.prisma.partner.create({
      data: {
        tenantId: user.tenantId,
        name: dto.name,
        logoUrl: dto.logoUrl,
        websiteUrl: dto.websiteUrl,
        isVisible: dto.isVisible ?? true,
        position: (maxPosition._max.position ?? -1) + 1,
      },
    });
    await this.audit.record({
      tenantId: user.tenantId,
      actorId: user.sub,
      action: "cms.partner.create",
      entityType: "Partner",
      entityId: partner.id,
      after: partner,
    });
    return partner;
  }

  async update(user: AccessTokenPayload, partnerId: string, dto: UpdatePartnerDto) {
    const before = await this.getOrThrow(user.tenantId, partnerId);
    const partner = await this.prisma.partner.update({
      where: { id: partnerId },
      data: {
        name: dto.name,
        logoUrl: dto.logoUrl,
        websiteUrl: dto.websiteUrl,
        isVisible: dto.isVisible,
        position: dto.position,
      },
    });
    await this.audit.record({
      tenantId: user.tenantId,
      actorId: user.sub,
      action: "cms.partner.update",
      entityType: "Partner",
      entityId: partner.id,
      before,
      after: partner,
    });
    return partner;
  }

  async remove(user: AccessTokenPayload, partnerId: string) {
    const partner = await this.getOrThrow(user.tenantId, partnerId);
    await this.prisma.partner.delete({ where: { id: partnerId } });
    await this.audit.record({
      tenantId: user.tenantId,
      actorId: user.sub,
      action: "cms.partner.delete",
      entityType: "Partner",
      entityId: partnerId,
      before: partner,
    });
    return { id: partnerId, deleted: true };
  }

  async reorder(user: AccessTokenPayload, dto: ReorderPartnersDto) {
    const existing = await this.prisma.partner.findMany({ where: { tenantId: user.tenantId } });
    const known = new Set(existing.map((p) => p.id));
    if (dto.orderedPartnerIds.length !== known.size || !dto.orderedPartnerIds.every((id) => known.has(id))) {
      throw new BadRequestException("orderedPartnerIds must contain exactly this tenant's current partners");
    }
    await this.prisma.$transaction(
      dto.orderedPartnerIds.map((id, index) =>
        this.prisma.partner.update({ where: { id }, data: { position: index } }),
      ),
    );
    return this.list(user);
  }

  private async getOrThrow(tenantId: string, partnerId: string) {
    const partner = await this.prisma.partner.findFirst({ where: { id: partnerId, tenantId } });
    if (!partner) throw new NotFoundException("Partner not found");
    return partner;
  }

  // --- Public read model (for the website itself, no auth) ----------------

  async publicList() {
    const tenant = await this.prisma.tenant.findFirstOrThrow();
    return this.prisma.partner.findMany({
      where: { tenantId: tenant.id, isVisible: true },
      orderBy: { position: "asc" },
    });
  }
}
