import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { AccessTokenPayload } from "../auth/auth.service";
import { CreateCourseDto } from "./dto/create-course.dto";
import { UpdateCourseDto } from "./dto/update-course.dto";
import { ReorderCoursesDto } from "./dto/reorder-courses.dto";

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService) {}
  list(user: AccessTokenPayload) { return this.prisma.course.findMany({ where: { tenantId: user.tenantId }, orderBy: { position: "asc" } }); }
  async create(user: AccessTokenPayload, dto: CreateCourseDto) {
    const maxPosition = await this.prisma.course.aggregate({ where: { tenantId: user.tenantId }, _max: { position: true } });
    const course = await this.prisma.course.create({ data: { tenantId: user.tenantId, slug: dto.slug, arTitle: dto.arTitle, enTitle: dto.enTitle, arDescription: dto.arDescription, enDescription: dto.enDescription, arDuration: dto.arDuration, enDuration: dto.enDuration, arFormat: dto.enFormat, status: dto.status, hrefOverride: dto.hrefOverride, isVisible: dto.isVisible ?? true, position: (maxPosition._max.position ?? -1) + 1 } });
    await this.audit.record({ tenantId: user.tenantId, actorId: user.sub, action: "cms.course.create", entityType: "Course", entityId: course.id, after: course });
    return course;
  }
  async update(user: AccessTokenPayload, courseId: string, dto: UpdateCourseDto) {
    const before = await this.getOrThrow(user.tenantId, courseId);
    const course = await this.prisma.course.update({ where: { id: courseId }, data: { slug: dto.slug, arTitle: dto.arTitle, enTitle: dto.enTitle, arDescription: dto.arDescription, enDescription: dto.enDescription, arDuration: dto.arDuration, enDuration: dto.enDuration, arFormat: dto.arFormat, enFormat: dto.enFormat, status: dto.status, hrefOverride: dto.hrefOverride, isVisible: dto.isVisible, position: dto.position } });
    await this.audit.record({ tenantId: user.tenantId, actorId: user.sub, action: "cms.course.update", entityType: "Course", entityId: course.id, before, after: course });
    return course;
  }
  async remove(user: AccessTokenPayload, courseId: string) {
    const course = await this.getOrThrow(user.tenantId, courseId);
    await this.prisma.course.delete({ where: { id: courseId } });
    await this.audit.record({ tenantId: user.tenantId, actorId: user.sub, action: "cms.course.delete", entityType: "Course", entityId: courseId, before: course });
    return { id: courseId, deleted: true };
  }
  async reorder(user: AccessTokenPayload, dto: ReorderCoursesDto) {
    const existing = await this.prisma.course.findMany({ where: { tenantId: user.tenantId } });
    const known = new Set(existing.map((c) => c.id));
    if (dto.orderedCourseIds.length !== known.size || !dto.orderedCourseIds.every((id) => known.has(id))) throw new BadRequestException("orderedCourseIds must contain exactly this tenant's current courses");
    await this.prisma.$transaction(dto.orderedCourseIds.map((id, index) => this.prisma.course.update({ where: { id }, data: { position: index } })));
    return this.list(user);
  }
  private async getOrThrow(tenantId: string, courseId: string) {
    const course = await this.prisma.course.findFirst({ where: { id: courseId, tenantId } });
    if (!course) throw new NotFoundException("Course not found");
    return course;
  }
  async publicList() {
    const configuredTenantId = process.env.DEFAULT_TENANT_ID;
    const tenant = configuredTenantId
      ? await this.prisma.tenant.findUniqueOrThrow({ where: { id: configuredTenantId } })
      : await this.prisma.tenant.findFirstOrThrow();
    return this.prisma.course.findMany({ where: { tenantId: tenant.id, isVisible: true }, orderBy: { position: "asc" } });
  }
}
