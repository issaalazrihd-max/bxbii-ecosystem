import { Module } from "@nestjs/common";
import { PagesController } from "./pages.controller";
import { NavigationController } from "./navigation.controller";
import { ProgramsController } from "./programs.controller";
import { PublicSiteController } from "./public-site.controller";
import { PagesService } from "./pages.service";
import { NavigationService } from "./navigation.service";
import { ProgramsService } from "./programs.service";

@Module({
  controllers: [PagesController, NavigationController, ProgramsController, PublicSiteController],
  providers: [PagesService, NavigationService, ProgramsService],
})
export class CmsModule {}
