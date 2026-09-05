import { IsBoolean, IsOptional, IsString } from "class-validator";

/**
 * Academic validation checklist the receiving branch runs before approval
 * (Multi-Branch doc, Section 6.4). In this foundation scaffold the checks
 * are recorded as a signed-off checklist rather than derived automatically
 * from live program/course/capacity data — that wiring lands with the
 * Phase 4 Programs & Courses module.
 */
export class ReceivingBranchReviewDto {
  @IsBoolean() programAvailable!: boolean;
  @IsBoolean() courseSeatAvailable!: boolean;
  @IsBoolean() branchCapacityOk!: boolean;
  @IsBoolean() academicCompatible!: boolean;
  @IsBoolean() attendanceRecordComplete!: boolean;
  @IsBoolean() noOutstandingRequirements!: boolean;

  @IsString()
  @IsOptional()
  notes?: string;
}
