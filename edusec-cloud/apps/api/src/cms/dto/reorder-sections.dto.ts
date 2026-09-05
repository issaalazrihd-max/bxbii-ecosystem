import { IsArray, IsString } from "class-validator";

/** Body: the section ids for one page, in their new display order. */
export class ReorderSectionsDto {
  @IsArray()
  @IsString({ each: true })
  orderedSectionIds!: string[];
}
