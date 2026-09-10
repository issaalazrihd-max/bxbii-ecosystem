import { IsDateString, IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";
import { BatchStatus } from "@edusec/db";

export class UpdateBatchDto {
  @IsString()
  @IsOptional()
  batchCode?: string;

  @IsString()
  @IsOptional()
  branchId?: string;

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
  @IsOptional()
  startDate?: string;

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
