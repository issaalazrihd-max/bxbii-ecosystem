import { IsBoolean, IsEnum, IsOptional, IsString, Matches } from "class-validator";
import { CourseStatus } from "@edusec/db";

export class CreateCourseDto {
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: "slug must be lowercase letters, numbers, and hyphens only" })
  slug!: string;

  @IsString()
  arTitle!: string;

  @IsString()
  enTitle!: string;

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

  @IsEnum(CourseStatus)
  @IsOptional()
  status?: CourseStatus;

  @IsString()
  @IsOptional()
  hrefOverride?: string;

  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;
}
