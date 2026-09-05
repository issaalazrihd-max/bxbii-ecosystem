import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { APP_GUARD } from "@nestjs/core";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtAccessStrategy } from "./strategies/jwt-access.strategy";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { PermissionsGuard } from "../rbac/permissions.guard";
import { BranchScopeModule } from "../branch-scope/branch-scope.module";

@Module({
  imports: [PassportModule, JwtModule.register({}), BranchScopeModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtAccessStrategy,
    // Global guard order matters: authenticate first, then check module
    // permissions, then (per-route) check branch scope.
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
  exports: [AuthService],
})
export class AuthModule {}
