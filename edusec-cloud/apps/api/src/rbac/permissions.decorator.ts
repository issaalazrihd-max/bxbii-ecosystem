import { SetMetadata } from "@nestjs/common";

export const PERMISSIONS_KEY = "requiredPermissions";

/**
 * Declares which module.action permission codes (see packages/db seed.ts)
 * a route requires. Mirrors the per-controller-action granularity of the
 * legacy Yii "Rights" engine (Phase 1 Analysis, Section 2.7), but checked
 * against roles that ship pre-seeded instead of an empty permission table.
 */
export const RequirePermissions = (...permissions: string[]) => SetMetadata(PERMISSIONS_KEY, permissions);
