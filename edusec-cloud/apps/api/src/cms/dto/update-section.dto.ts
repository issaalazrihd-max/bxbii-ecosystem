import { IsBoolean, IsObject, IsOptional } from "class-validator";

export class UpdateSectionDto {
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
