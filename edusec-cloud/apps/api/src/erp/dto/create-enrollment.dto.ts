import { IsEnum, IsOptional, IsString } from "class-validator";
import { EnrollmentStatus } from "@edusec/db";

export class CreateEnrollmentDto {
  @IsString()
  studentId!: string;

  @IsString()
  batchId!: string;

  @IsEnum(EnrollmentStatus)
  @IsOptional()
  status?: EnrollmentStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}
