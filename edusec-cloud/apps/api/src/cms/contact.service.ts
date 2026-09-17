import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { AccessTokenPayload } from "../auth/auth.service";
import { CreateContactSubmissionDto } from "./dto/create-contact-submission.dto";
import { UpdateContactSubmissionStatusDto } from "./dto/update-contact-submission-status.dto";

/**
 * Contact submissions inbox (bxbii Ecosystem brief — Contact module),
 * fed by the public /contact-us page's CONTACT_FORM block. Platform-wide,
 * not branch-scoped — same as Pages/NavigationItem/Program, since the
 * inbox is one shared list for the whole tenant.
 */
@Injectable()
export class ContactService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  list(user: AccessTokenPayload) {
    return this.prisma.contactSubmission.findMany({
      where: { tenantId: user.tenantId },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateStatus(user: AccessTokenPayload, submissionId: string, dto: UpdateContactSubmissionStatusDto) {
    const before = await this.getOrThrow(user.tenantId, submissionId);
    const submission = await this.prisma.contactSubmission.update({
      where: { id: submissionId },
      data: { status: dto.status },
    });
    await this.audit.record({
      tenantId: user.tenantId,
      actorId: user.sub,
      action: "cms.contact.updateStatus",
      entityType: "ContactSubmission",
      entityId: submission.id,
      before,
      after: submission,
    });
    return submission;
  }

  async remove(user: AccessTokenPayload, submissionId: string) {
    const submission = await this.getOrThrow(user.tenantId, submissionId);
    await this.prisma.contactSubmission.delete({ where: { id: submissionId } });
    await this.audit.record({
      tenantId: user.tenantId,
      actorId: user.sub,
      action: "cms.contact.delete",
      entityType: "ContactSubmission",
      entityId: submissionId,
      before: submission,
    });
    return { id: submissionId, deleted: true };
  }

  private async getOrThrow(tenantId: string, submissionId: string) {
    const submission = await this.prisma.contactSubmission.findFirst({
      where: { id: submissionId, tenantId },
    });
    if (!submission) throw new NotFoundException("Contact submission not found");
    return submission;
  }

  // --- Public write model (for the website itself, no auth) ---------------

  /**
   * Store the website enquiry in the existing contact inbox first. If the
   * optional bxbii Cloud sales table exists in the connected database, also
   * mirror the lead there. The optional mirror must never make the public
   * contact form fail when that table has not been migrated yet.
   */
  async publicCreate(dto: CreateContactSubmissionDto) {
    const tenant = await this.prisma.tenant.findFirstOrThrow();
    const submission = await this.prisma.contactSubmission.create({
      data: {
        tenantId: tenant.id,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        subject: dto.subject,
        message: dto.message,
        status: "NEW",
      },
    });

    const table = await this.prisma.$queryRawUnsafe<Array<{ table_name: string | null }>>(
      `SELECT to_regclass('public.bxbii_cloud_inquiries')::text AS table_name`,
    );

    if (table[0]?.table_name) {
      await this.prisma.$executeRawUnsafe(
        `INSERT INTO bxbii_cloud_inquiries
          (id, tenant_id, branch_id, full_name, mobile, email, source, interested_course, status, assigned_to, next_follow_up_at, notes)
         VALUES ($1,$2,NULL,$3,$4,$5,$6,$7,'NEW',NULL,NULL,$8)`,
        submission.id,
        tenant.id,
        dto.name,
        dto.phone ?? null,
        dto.email,
        "website",
        dto.subject ?? null,
        dto.message,
      );
    }

    return { success: true };
  }
}
