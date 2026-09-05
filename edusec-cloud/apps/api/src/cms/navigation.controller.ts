import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { AccessTokenPayload } from "../auth/auth.service";
import { RequirePermissions } from "../rbac/permissions.decorator";
import { NavigationService } from "./navigation.service";
import { CreateNavigationItemDto } from "./dto/create-navigation-item.dto";
import { UpdateNavigationItemDto } from "./dto/update-navigation-item.dto";
import { ReorderNavigationDto } from "./dto/reorder-navigation.dto";

/**
 * Dynamic Navigation admin API (bxbii Ecosystem brief, Section 31). Public,
 * unauthenticated tree reads for the live site live in PublicSiteController.
 */
@Controller("cms/navigation")
export class NavigationController {
  constructor(private readonly navigation: NavigationService) {}

  @Get()
  @RequirePermissions("cms.navigation.view")
  listTree(@CurrentUser() user: AccessTokenPayload, @Query("onlyVisible") onlyVisible?: string) {
    return this.navigation.listTree(user.tenantId, { onlyVisible: onlyVisible === "true" });
  }

  @Post()
  @RequirePermissions("cms.navigation.manage")
  create(@CurrentUser() user: AccessTokenPayload, @Body() dto: CreateNavigationItemDto) {
    return this.navigation.create(user, dto);
  }

  @Patch(":itemId")
  @RequirePermissions("cms.navigation.manage")
  update(
    @CurrentUser() user: AccessTokenPayload,
    @Param("itemId") itemId: string,
    @Body() dto: UpdateNavigationItemDto,
  ) {
    return this.navigation.update(user, itemId, dto);
  }

  @Delete(":itemId")
  @RequirePermissions("cms.navigation.manage")
  remove(@CurrentUser() user: AccessTokenPayload, @Param("itemId") itemId: string) {
    return this.navigation.remove(user, itemId);
  }

  @Post("reorder")
  @RequirePermissions("cms.navigation.manage")
  reorder(@CurrentUser() user: AccessTokenPayload, @Body() dto: ReorderNavigationDto) {
    return this.navigation.reorder(user, dto);
  }
}
