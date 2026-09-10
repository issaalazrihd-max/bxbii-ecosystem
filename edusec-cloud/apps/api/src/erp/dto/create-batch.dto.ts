import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";
import { BatchStatus } from "@edusec/db";

export class CreateBatchDto {
  @IsString()
  batchCode!: string;

  /** Which branch this scheduled class runs at. */
  @IsString()
  branchId!: string;

  /** Exactly one of programId/courseId is expected — validated in the service. */
  @IsString()
  @IsOptional()
  programId?: string;

  @IsString()
  @IsOptional()
  courseId?: string;

  @IsString()
  @IsOptional()
  trainerId?: string;

  @IsString()
  @IsOptional()
  arLabel?: string;

  @IsString()
  @IsOptional()
  enLabel?: string;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  schedule?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  capacity?: number;

  @IsEnum(BatchStatus)
  @IsOptional()
  status?: BatchStatus;
}
