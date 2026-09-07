import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { Public } from "../auth/decorators/public.decorator";
import { PagesService } from "./pages.service";
import { NavigationService } from "./navigation.service";
import { ProgramsService } from "./programs.service";
import { ContactService } from "./contact.service";
import { PartnersService } from "./partners.service";
import { CreateContactSubmissionDto } from "./dto/create-contact-submission.dto";

/**
 * Unauthenticated read model for the public bxbii website itself — the
 * Next.js site fetches from here to render the Home page, any CMS page by
 * slug, the site-wide navigation tree, the Programs catalog (bxbii
 * Ecosystem brief, Sections 28-31 + Programs module), the Partners roster
 * (Partners module), and to accept submissions from the /contact-us page's
 * form (Contact module). No @RequirePermissions here on purpose: this is
 * the front door.
 */
@Controller("public")
export class PublicSiteController {
  constructor(
    private readonly pages: PagesService,
    private readonly navigation: NavigationService,
    private readonly programs: ProgramsService,
    private readonly contact: ContactService,
    private readonly partners: PartnersService,
  ) {}

  @Public()
  @Get("pages/home")
  home() {
    // The home page is the system page whose slug is the empty string.
    return this.pages.publicFindBySlugForTenant("");
  }

  @Public()
  @Get("pages/:slug")
  bySlug(@Param("slug") slug: string) {
    return this.pages.publicFindBySlugForTenant(slug);
  }

  @Public()
  @Get("navigation")
  navigationTree() {
    return this.navigation.publicListTree();
  }

  @Public()
  @Get("programs")
  programsList() {
    return this.programs.publicList();
  }

  @Public()
  @Get("partners")
  partnersList() {
    return this.partners.publicList();
  }

  @Public()
  @Post("contact")
  submitContact(@Body() dto: CreateContactSubmissionDto) {
    return this.contact.publicCreate(dto);
  }
}
