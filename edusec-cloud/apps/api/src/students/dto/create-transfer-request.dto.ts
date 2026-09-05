import { IsBoolean, IsEnum, IsOptional, IsString } from "class-validator";
import { FinancialTransferPolicy } from "@edusec/db";

export class CreateTransferRequestDto {
  @IsString()
  toBranchId!: string;

  @IsString()
  reason!: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsEnum(FinancialTransferPolicy)
  @IsOptional()
  financialPolicy?: FinancialTransferPolicy;

  // Section 6.2 — which record categories are in scope. Defaults to "all"
  // at the schema level; callers may narrow the selection explicitly.
  @IsBoolean() @IsOptional() transferProfile?: boolean;
  @IsBoolean() @IsOptional() transferDocuments?: boolean;
  @IsBoolean() @IsOptional() transferAcademicHistory?: boolean;
  @IsBoolean() @IsOptional() transferAttendanceHistory?: boolean;
  @IsBoolean() @IsOptional() transferCourseHistory?: boolean;
  @IsBoolean() @IsOptional() transferAssessmentResults?: boolean;
  @IsBoolean() @IsOptional() transferCertificates?: boolean;
  @IsBoolean() @IsOptional() transferFinancialHistory?: boolean;
}
