import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { AccessTokenPayload } from "../auth/auth.service";
import { RequirePermissions } from "../rbac/permissions.decorator";
import { PagesService } from "./pages.service";
import { CreatePageDto } from "./dto/create-page.dto";
import { UpdatePageDto } from "./dto/update-page.dto";
import { CreateSectionDto } from "./dto/create-section.dto";
import { UpdateSectionDto } from "./dto/update-section.dto";
import { ReorderSectionsDto } from "./dto/reorder-sections.dto";

/**
 * CMS / Page Builder admin API (bxbii Ecosystem brief, Sections 29-30).
 * Public, unauthenticated rendering of these same pages lives in
 * PublicSiteController, not here.
 */
@Controller("cms/pages")
export class PagesController {
  constructor(private readonly pages: PagesService) {}

  @Get()
  @RequirePermissions("cms.pages.view")
  list(@CurrentUser() user: AccessTokenPayload) {
    return this.pages.list(user);
  }

  @Get(":pageId")
  @RequirePermissions("cms.pages.view")
  findOne(@CurrentUser() user: AccessTokenPayload, @Param("pageId") pageId: string) {
    return this.pages.findOneOrThrow(user, pageId);
  }

  @Post()
  @RequirePermissions("cms.pages.create")
  create(@CurrentUser() user: AccessTokenPayload, @Body() dto: CreatePageDto) {
    return this.pages.create(user, dto);
  }

  @Patch(":pageId")
  @RequirePermissions("cms.pages.update")
  update(
    @CurrentUser() user: AccessTokenPayload,
    @Param("pageId") pageId: string,
    @Body() dto: UpdatePageDto,
  ) {
    return this.pages.update(user, pageId, dto);
  }

  @Delete(":pageId")
  @RequirePermissions("cms.pages.delete")
  remove(@CurrentUser() user: AccessTokenPayload, @Param("pageId") pageId: string) {
    return this.pages.remove(user, pageId);
  }

  // --- Sections (the Page Builder block palette) ---------------------------

  @Post(":pageId/sections")
  @RequirePermissions("cms.pages.update")
  addSection(
    @CurrentUser() user: AccessTokenPayload,
    @Param("pageId") pageId: string,
    @Body() dto: CreateSectionDto,
  ) {
    return this.pages.addSection(user, pageId, dto);
  }

  @Patch(":pageId/sections/:sectionId")
  @RequirePermissions("cms.pages.update")
  updateSection(
    @CurrentUser() user: AccessTokenPayload,
    @Param("pageId") pageId: string,
    @Param("sectionId") sectionId: string,
    @Body() dto: UpdateSectionDto,
  ) {
    return this.pages.updateSection(user, pageId, sectionId, dto);
  }

  @Delete(":pageId/sections/:sectionId")
  @RequirePermissions("cms.pages.update")
  removeSection(
    @CurrentUser() user: AccessTokenPayload,
    @Param("pageId") pageId: string,
    @Param("sectionId") sectionId: string,
  ) {
    return this.pages.removeSection(user, pageId, sectionId);
  }

  @Post(":pageId/sections/reorder")
  @RequirePermissions("cms.pages.update")
  reorderSections(
    @CurrentUser() user: AccessTokenPayload,
    @Param("pageId") pageId: string,
    @Body() dto: ReorderSectionsDto,
  ) {
    return this.pages.reorderSections(user, pageId, dto);
  }
}
