import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { AccessTokenPayload } from "../auth/auth.service";
import { CreateProgramDto } from "./dto/create-program.dto";
import { UpdateProgramDto } from "./dto/update-program.dto";
import { ReorderProgramsDto } from "./dto/reorder-programs.dto";

@Injectable()
export class ProgramsService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}

  list(user: AccessTokenPayload) {
    return this.prisma.program.findMany({ where: { tenantId: user.tenantId }, orderBy: { position: "asc" } });
  }

  async create(user: AccessTokenPayload, dto: CreateProgramDto) {
    const maxPosition = await this.prisma.program.aggregate({ where: { tenantId: user.tenantId }, _max: { position: true } });
    const program = await this.prisma.program.create({ data: { tenantId: user.tenantId, slug: dto.slug, arDomain: dto.arDomain, enDomain: dto.enDomain, arName: dto.arName, enName: dto.enName, arDescription: dto.arDescription, enDescription: dto.enDescription, arDuration: dto.arDuration, enDuration: dto.enDuration, arFormat: dto.arFormat, enFormat: dto.enFormat, status: dto.status, hrefOverride: dto.hrefOverride, isVisible: dto.isVisible ?? true, position: (maxPosition._max.position ?? -1) + 1 } });
    await this.audit.record({ tenantId: user.tenantId, actorId: user.sub, action: "cms.program.create", entityType: "Program", entityId: program.id, after: program });
    return program;
  }

  async update(user: AccessTokenPayload, programId: string, dto: UpdateProgramDto) {
    const before = await this.getOrThrow(user.tenantId, programId);
    const program = await this.prisma.program.update({ where: { id: programId }, data: { slug: dto.slug, arDomain: dto.arDomain, enDomain: dto.enDomain, arName: dto.arName, enName: dto.enName, arDescription: dto.arDescription, enDescription: dto.enDescription, arDuration: dto.arDuration, enDuration: dto.enDuration, arFormat: dto.arFormat, enFormat: dto.enFormat, status: dto.status, hrefOverride: dto.hrefOverride, isVisible: dto.isVisible, position: dto.position } });
    await this.audit.record({ tenantId: user.tenantId, actorId: user.sub, action: "cms.program.update", entityType: "Program", entityId: program.id, before, after: program });
    return program;
  }

  async remove(user: AccessTokenPayload, programId: string) {
    const program = await this.getOrThrow(user.tenantId, programId);
    await this.prisma.program.delete({ where: { id: programId } });
    await this.audit.record({ tenantId: user.tenantId, actorId: user.sub, action: "cms.program.delete", entityType: "Program", entityId: programId, before: program });
    return { id: programId, deleted: true };
  }

  async reorder(user: AccessTokenPayload, dto: ReorderProgramsDto) {
    const existing = await this.prisma.program.findMany({ where: { tenantId: user.tenantId } });
    const known = new Set(existing.map((p) => p.id));
    if (dto.orderedProgramIds.length !== known.size || !dto.orderedProgramIds.every((id) => known.has(id))) throw new BadRequestException("orderedProgramIds must contain exactly this tenant's current programs");
    await this.prisma.$transaction(dto.orderedProgramIds.map((id, index) => this.prisma.program.update({ where: { id }, data: { position: index } })));
    return this.list(user);
  }

  private async getOrThrow(tenantId: string, programId: string) {
    const program = await this.prisma.program.findFirst({ where: { id: programId, tenantId } });
    if (!program) throw new NotFoundException("Program not found");
    return program;
  }

  async publicList() {
    const configuredTenantId = process.env.DEFAULT_TENANT_ID;
    const tenant = configuredTenantId
      ? await this.prisma.tenant.findUniqueOrThrow({ where: { id: configuredTenantId } })
      : await this.prisma.tenant.findFirstOrThrow();
    return this.prisma.program.findMany({ where: { tenantId: tenant.id, isVisible: true }, orderBy: { position: "asc" } });
  }
}
