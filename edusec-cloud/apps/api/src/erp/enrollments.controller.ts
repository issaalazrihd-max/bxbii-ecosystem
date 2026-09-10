import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { AccessTokenPayload } from "../auth/auth.service";
import { RequirePermissions } from "../rbac/permissions.decorator";
import { EnrollmentsService } from "./enrollments.service";
import { CreateEnrollmentDto } from "./dto/create-enrollment.dto";
import { UpdateEnrollmentDto } from "./dto/update-enrollment.dto";

/**
 * ERP Phase 1 — Enrollments admin API: links a Student to a Batch. Branch
 * access is enforced inside EnrollmentsService (transitively through the
 * Batch's branch), so this controller only gates on the flat
 * erp.enrollments.view/manage permissions.
 */
@Controller("erp/enrollments")
export class EnrollmentsController {
  constructor(private readonly enrollments: EnrollmentsService) {}

  @Get()
  @RequirePermissions("erp.enrollments.view")
  list(
    @CurrentUser() user: AccessTokenPayload,
    @Query("batchId") batchId?: string,
    @Query("studentId") studentId?: string,
  ) {
    return this.enrollments.list(user, { batchId, studentId });
  }

  @Post()
  @RequirePermissions("erp.enrollments.manage")
  create(@CurrentUser() user: AccessTokenPayload, @Body() dto: CreateEnrollmentDto) {
    return this.enrollments.create(user, dto);
  }

  @Patch(":enrollmentId")
  @RequirePermissions("erp.enrollments.manage")
  update(
    @CurrentUser() user: AccessTokenPayload,
    @Param("enrollmentId") enrollmentId: string,
    @Body() dto: UpdateEnrollmentDto,
  ) {
    return this.enrollments.update(user, enrollmentId, dto);
  }

  @Delete(":enrollmentId")
  @RequirePermissions("erp.enrollments.manage")
  remove(@CurrentUser() user: AccessTokenPayload, @Param("enrollmentId") enrollmentId: string) {
    return this.enrollments.remove(user, enrollmentId);
  }
}
