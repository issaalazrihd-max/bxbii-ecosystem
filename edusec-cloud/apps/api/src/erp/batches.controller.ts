import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { AccessTokenPayload } from "../auth/auth.service";
import { RequirePermissions } from "../rbac/permissions.decorator";
import { BatchesService } from "./batches.service";
import { CreateBatchDto } from "./dto/create-batch.dto";
import { UpdateBatchDto } from "./dto/update-batch.dto";

/**
 * ERP Phase 1 — Batches admin API: scheduled runs of a Program or Course at
 * a branch. Branch access is enforced inside BatchesService (same pattern
 * as StudentsController/Service), so this controller only gates on the
 * flat erp.batches.view/manage permissions.
 */
@Controller("erp/batches")
export class BatchesController {
  constructor(private readonly batches: BatchesService) {}

  @Get()
  @RequirePermissions("erp.batches.view")
  list(@CurrentUser() user: AccessTokenPayload, @Query("branchId") branchId?: string) {
    return this.batches.list(user, branchId);
  }

  @Post()
  @RequirePermissions("erp.batches.manage")
  create(@CurrentUser() user: AccessTokenPayload, @Body() dto: CreateBatchDto) {
    return this.batches.create(user, dto);
  }

  @Patch(":batchId")
  @RequirePermissions("erp.batches.manage")
  update(
    @CurrentUser() user: AccessTokenPayload,
    @Param("batchId") batchId: string,
    @Body() dto: UpdateBatchDto,
  ) {
    return this.batches.update(user, batchId, dto);
  }

  @Delete(":batchId")
  @RequirePermissions("erp.batches.manage")
  remove(@CurrentUser() user: AccessTokenPayload, @Param("batchId") batchId: string) {
    return this.batches.remove(user, batchId);
  }
}
