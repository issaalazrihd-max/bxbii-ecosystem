import { Module } from "@nestjs/common";
import { PagesController } from "./pages.controller";
import { NavigationController } from "./navigation.controller";
import { PublicSiteController } from "./public-site.controller";
import { PagesService } from "./pages.service";
import { NavigationService } from "./navigation.service";

/**
 * CMS, Page Builder, and dynamic Navigation (bxbii Ecosystem brief, Sections
 * 28-31) — plus the unauthenticated public-site read model that the Next.js
 * front end renders from.
 */
@Module({
  controllers: [PagesController, NavigationController, PublicSiteController],
  providers: [PagesService, NavigationService],
})
export class CmsModule {}
