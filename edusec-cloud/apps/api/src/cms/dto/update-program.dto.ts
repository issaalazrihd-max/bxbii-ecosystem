import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Matches } from "class-validator";
import { ProgramStatus } from "@edusec/db";

export class UpdateProgramDto {
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: "slug must be lowercase letters, numbers, and hyphens only" })
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  arDomain?: string;

  @IsString()
  @IsOptional()
  enDomain?: string;

  @IsString()
  @IsOptional()
  arName?: string;

  @IsString()
  @IsOptional()
  enName?: string;

  @IsString()
  @IsOptional()
  arDescription?: string;

  @IsString()
  @IsOptional()
  enDescription?: string;

  @IsString()
  @IsOptional()
  arDuration?: string;

  @IsString()
  @IsOptional()
  enDuration?: string;

  @IsString()
  @IsOptional()
  arFormat?: string;

  @IsString()
  @IsOptional()
  enFormat?: string;

  @IsEnum(ProgramStatus)
  @IsOptional()
  status?: ProgramStatus;

  @IsString()
  @IsOptional()
  hrefOverride?: string;

  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;

  @IsInt()
  @IsOptional()
  position?: number;
}
