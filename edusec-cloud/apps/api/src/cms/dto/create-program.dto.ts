import { IsBoolean, IsEnum, IsOptional, IsString, Matches } from "class-validator";
import { ProgramStatus } from "@edusec/db";

export class CreateProgramDto {
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: "slug must be lowercase letters, numbers, and hyphens only" })
  slug!: string;

  @IsString()
  arDomain!: string;

  @IsString()
  enDomain!: string;

  @IsString()
  arName!: string;

  @IsString()
  enName!: string;

  @IsString()
  arDescription!: string;

  @IsString()
  enDescription!: string;

  @IsString()
  arDuration!: string;

  @IsString()
  enDuration!: string;

  @IsString()
  arFormat!: string;

  @IsString()
  enFormat!: string;

  @IsEnum(ProgramStatus)
  @IsOptional()
  status?: ProgramStatus;

  @IsString()
  @IsOptional()
  hrefOverride?: string;

  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;
}
