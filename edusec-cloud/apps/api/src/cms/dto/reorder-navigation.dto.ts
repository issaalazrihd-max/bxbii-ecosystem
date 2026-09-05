import { Type } from "class-transformer";
import { IsArray, IsOptional, IsString, ValidateNested } from "class-validator";

class ReorderNavigationEntryDto {
  @IsString()
  id!: string;

  @IsString()
  @IsOptional()
  parentId?: string | null;
}

/** Body: every top-level and nested item's new position (array order = display order) and parent. */
export class ReorderNavigationDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderNavigationEntryDto)
  items!: ReorderNavigationEntryDto[];
}
