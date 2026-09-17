import { Module } from "@nestjs/common";
import { PagesController } from "./pages.controller";
import { NavigationController } from "./navigation.controller";
import { ProgramsController } from "./programs.controller";
import { CoursesController } from "./courses.controller";
import { ContactController } from "./contact.controller";
import { PartnersController } from "./partners.controller";
import { PublicSiteController } from "./public-site.controller";
import { WhatsAppController } from "./whatsapp.controller";
import { PagesService } from "./pages.service";
import { NavigationService } from "./navigation.service";
import { ProgramsService } from "./programs.service";
import { CoursesService } from "./courses.service";
import { ContactService } from "./contact.service";
import { PartnersService } from "./partners.service";
import { WhatsAppService } from "./whatsapp.service";

@Module({
  controllers: [
    PagesController,
    NavigationController,
    ProgramsController,
    CoursesController,
    ContactController,
    PartnersController,
    PublicSiteController,
    WhatsAppController,
  ],
  providers: [PagesService, NavigationService, ProgramsService, CoursesService, ContactService, PartnersService, WhatsAppService],
})
export class CmsModule {}
