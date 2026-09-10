import { Module } from "@nestjs/common";
import { BatchesController } from "./batches.controller";
import { EnrollmentsController } from "./enrollments.controller";
import { BatchesService } from "./batches.service";
import { EnrollmentsService } from "./enrollments.service";

/**
 * ERP module (Phase 1 — Institute Management System): Batches (scheduled
 * runs of a Program/Course at a branch) and Enrollments (Student <-> Batch).
 * Kept separate from CmsModule since this is operational/academic data,
 * not website content.
 */
@Module({
  controllers: [BatchesController, EnrollmentsController],
  providers: [BatchesService, EnrollmentsService],
})
export class ErpModule {}
