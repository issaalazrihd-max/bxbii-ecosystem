import { IsBoolean, IsEnum, IsObject, IsOptional } from "class-validator";
import { PageSectionType } from "@edusec/db";

export class CreateSectionDto {
  @IsEnum(PageSectionType)
  sectionType!: PageSectionType;

  @IsObject()
  @IsOptional()
  arContent?: Record<string, unknown>;

  @IsObject()
  @IsOptional()
  enContent?: Record<string, unknown>;

  @IsBoolean()
  @IsOptional()
  isVisible?: boolean;
}
