import { IsEnum, IsOptional, IsString } from "class-validator";
import { EnrollmentStatus } from "@edusec/db";

export class UpdateEnrollmentDto {
  @IsEnum(EnrollmentStatus)
  @IsOptional()
  status?: EnrollmentStatus;

  @IsString()
  @IsOptional()
  notes?: string;
}
