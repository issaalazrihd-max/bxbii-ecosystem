import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PERMISSIONS_KEY } from "./permissions.decorator";
import { AccessTokenPayload } from "../auth/auth.service";

/**
 * "Can this role do this action on this module?" — the first half of the
 * effective-permission check described in the Multi-Branch Architecture
 * doc, Section 4.2. The second half (branch access) is enforced separately
 * by BranchScopeService inside each module's service, because it depends
 * on the specific record being accessed, not just the route.
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!required || required.length === 0) {
      return true; // route did not declare a permission requirement
    }

    const request = context.switchToHttp().getRequest();
    const user: AccessTokenPayload | undefined = request.user;

    if (!user) {
      // JwtAuthGuard should already have rejected this; fail closed regardless.
      throw new ForbiddenException("Not authenticated.");
    }

    const hasAll = required.every((code) => user.permissions.includes(code));
    if (!hasAll) {
      throw new ForbiddenException(`Missing required permission(s): ${required.join(", ")}`);
    }

    return true;
  }
}
