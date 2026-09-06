import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { AccessTokenPayload } from "../auth/auth.service";
import { RequirePermissions } from "../rbac/permissions.decorator";
import { ProgramsService } from "./programs.service";
import { CreateProgramDto } from "./dto/create-program.dto";
import { UpdateProgramDto } from "./dto/update-program.dto";
import { ReorderProgramsDto } from "./dto/reorder-programs.dto";

/**
 * Programs catalog admin API (bxbii Ecosystem brief — Programs module),
 * backing the public /programs page. A flat list — no nested sub-resource
 * the way Pages has Sections — so this mirrors NavigationController's
 * view/manage permission split rather than Pages' four-way one.
 * Public, unauthenticated rendering lives in PublicSiteController.
 */
@Controller("cms/programs")
export class ProgramsController {
  constructor(private readonly programs: ProgramsService) {}

  @Get()
  @RequirePermissions("cms.programs.view")
  list(@CurrentUser() user: AccessTokenPayload) {
    return this.programs.list(user);
  }

  @Post()
  @RequirePermissions("cms.programs.manage")
  create(@CurrentUser() user: AccessTokenPayload, @Body() dto: CreateProgramDto) {
    return this.programs.create(user, dto);
  }

  @Patch(":programId")
  @RequirePermissions("cms.programs.manage")
  update(
    @CurrentUser() user: AccessTokenPayload,
    @Param("programId") programId: string,
    @Body() dto: UpdateProgramDto,
  ) {
    return this.programs.update(user, programId, dto);
  }

  @Delete(":programId")
  @RequirePermissions("cms.programs.manage")
  remove(@CurrentUser() user: AccessTokenPayload, @Param("programId") programId: string) {
    return this.programs.remove(user, programId);
  }

  @Post("reorder")
  @RequirePermissions("cms.programs.manage")
  reorder(@CurrentUser() user: AccessTokenPayload, @Body() dto: ReorderProgramsDto) {
    return this.programs.reorder(user, dto);
  }
}
