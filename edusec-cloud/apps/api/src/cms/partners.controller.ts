import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { AccessTokenPayload } from "../auth/auth.service";
import { RequirePermissions } from "../rbac/permissions.decorator";
import { PartnersService } from "./partners.service";
import { CreatePartnerDto } from "./dto/create-partner.dto";
import { UpdatePartnerDto } from "./dto/update-partner.dto";
import { ReorderPartnersDto } from "./dto/reorder-partners.dto";

/**
 * Partner logos admin API (bxbii Ecosystem brief — Partners module),
 * backing the PARTNERS page-builder block. A flat list — no nested
 * sub-resource the way Pages has Sections — so this mirrors
 * ProgramsController/NavigationController's view/manage permission split.
 * Public, unauthenticated rendering lives in PublicSiteController.
 */
@Controller("cms/partners")
export class PartnersController {
  constructor(private readonly partners: PartnersService) {}

  @Get()
  @RequirePermissions("cms.partners.view")
  list(@CurrentUser() user: AccessTokenPayload) {
    return this.partners.list(user);
  }

  @Post()
  @RequirePermissions("cms.partners.manage")
  create(@CurrentUser() user: AccessTokenPayload, @Body() dto: CreatePartnerDto) {
    return this.partners.create(user, dto);
  }

  @Patch(":partnerId")
  @RequirePermissions("cms.partners.manage")
  update(
    @CurrentUser() user: AccessTokenPayload,
    @Param("partnerId") partnerId: string,
    @Body() dto: UpdatePartnerDto,
  ) {
    return this.partners.update(user, partnerId, dto);
  }

  @Delete(":partnerId")
  @RequirePermissions("cms.partners.manage")
  remove(@CurrentUser() user: AccessTokenPayload, @Param("partnerId") partnerId: string) {
    return this.partners.remove(user, partnerId);
  }

  @Post("reorder")
  @RequirePermissions("cms.partners.manage")
  reorder(@CurrentUser() user: AccessTokenPayload, @Body() dto: ReorderPartnersDto) {
    return this.partners.reorder(user, dto);
  }
}
