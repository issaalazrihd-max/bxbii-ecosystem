import { Body, Controller, Delete, Get, Param, Patch } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { AccessTokenPayload } from "../auth/auth.service";
import { RequirePermissions } from "../rbac/permissions.decorator";
import { ContactService } from "./contact.service";
import { UpdateContactSubmissionStatusDto } from "./dto/update-contact-submission-status.dto";

/**
 * Contact submissions inbox admin API (bxbii Ecosystem brief — Contact
 * module), reading the messages visitors send from the public /contact-us
 * page's CONTACT_FORM block. A flat list with no nested sub-resource — same
 * view/manage permission split as Programs/Navigation, since a submission
 * has nothing analogous to a Page's Sections. Public, unauthenticated
 * creation lives in PublicSiteController.
 */
@Controller("cms/contact")
export class ContactController {
  constructor(private readonly contact: ContactService) {}

  @Get()
  @RequirePermissions("cms.contact.view")
  list(@CurrentUser() user: AccessTokenPayload) {
    return this.contact.list(user);
  }

  @Patch(":submissionId")
  @RequirePermissions("cms.contact.manage")
  updateStatus(
    @CurrentUser() user: AccessTokenPayload,
    @Param("submissionId") submissionId: string,
    @Body() dto: UpdateContactSubmissionStatusDto,
  ) {
    return this.contact.updateStatus(user, submissionId, dto);
  }

  @Delete(":submissionId")
  @RequirePermissions("cms.contact.manage")
  remove(@CurrentUser() user: AccessTokenPayload, @Param("submissionId") submissionId: string) {
    return this.contact.remove(user, submissionId);
  }
}
