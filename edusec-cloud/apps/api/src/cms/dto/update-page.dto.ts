import { IsEnum, IsOptional, IsString, Matches } from "class-validator";
import { PageStatus } from "@edusec/db";

export class UpdatePageDto {
  @IsString()
  @Matches(/^[a-z0-9-]*$/, { message: "slug must be lowercase letters, numbers, and hyphens only" })
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  arTitle?: string;

  @IsString()
  @IsOptional()
  enTitle?: string;

  @IsEnum(PageStatus)
  @IsOptional()
  status?: PageStatus;
}
