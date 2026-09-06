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
   * Unauthenticated create from the public contact form. No audit record
   * here — audit.record() ties every entry to an actorId, and there is no
   * actor: this is a citizen submission, not an admin action.
   */
  async publicCreate(dto: CreateContactSubmissionDto) {
    const tenant = await this.prisma.tenant.findFirstOrThrow();
    await this.prisma.contactSubmission.create({
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
    return { success: true };
  }
}
