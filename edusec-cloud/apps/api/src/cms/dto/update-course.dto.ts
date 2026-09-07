import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Matches } from "class-validator";
import { CourseStatus } from "@edusec/db";

export class UpdateCourseDto {
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: "slug must be lowercase letters, numbers, and hyphens only" })
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  arTitle?: string;

  @IsString()
  @IsOptional()
  enTitle?: string;

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

  @IsEnum(CourseStatus)
  @IsOptional()
  status?: CourseStatus;

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
