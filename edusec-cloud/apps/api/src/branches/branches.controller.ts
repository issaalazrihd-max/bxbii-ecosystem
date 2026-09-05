import { Body, Controller, Get, Post } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { AccessTokenPayload } from "../auth/auth.service";
import { RequirePermissions } from "../rbac/permissions.decorator";
import { BranchesService } from "./branches.service";
import { CreateBranchDto } from "./dto/create-branch.dto";

@Controller("branches")
export class BranchesController {
  constructor(private readonly branches: BranchesService) {}

  @Get()
  @RequirePermissions("branches.list")
  list(@CurrentUser() user: AccessTokenPayload) {
    return this.branches.list(user);
  }

  @Post()
  @RequirePermissions("branches.create")
  create(@CurrentUser() user: AccessTokenPayload, @Body() dto: CreateBranchDto) {
    return this.branches.create(user, dto);
  }
}
