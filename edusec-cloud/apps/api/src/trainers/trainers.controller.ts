import { Body, Controller, Get, Post } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { AccessTokenPayload } from "../auth/auth.service";
import { RequirePermissions } from "../rbac/permissions.decorator";
import { TrainersService } from "./trainers.service";
import { CreateTrainerDto } from "./dto/create-trainer.dto";

@Controller("trainers")
export class TrainersController {
  constructor(private readonly trainers: TrainersService) {}

  @Get()
  @RequirePermissions("trainers.list")
  list(@CurrentUser() user: AccessTokenPayload) {
    return this.trainers.list(user);
  }

  @Post()
  @RequirePermissions("trainers.create")
  create(@CurrentUser() user: AccessTokenPayload, @Body() dto: CreateTrainerDto) {
    return this.trainers.create(user, dto);
  }
}
