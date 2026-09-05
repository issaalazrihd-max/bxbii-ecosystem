import { IsEnum, IsOptional, IsString, Matches } from "class-validator";
import { PageStatus } from "@edusec/db";

export class CreatePageDto {
  @IsString()
  @Matches(/^[a-z0-9-]*$/, { message: "slug must be lowercase letters, numbers, and hyphens only (empty string reserved for the home page)" })
  slug!: string;

  @IsString()
  arTitle!: string;

  @IsString()
  enTitle!: string;

  @IsEnum(PageStatus)
  @IsOptional()
  status?: PageStatus;
}
