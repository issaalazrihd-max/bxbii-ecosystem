import { IsArray, IsString } from "class-validator";

/** Body: all of the tenant's program ids, in their new display order. */
export class ReorderProgramsDto {
  @IsArray()
  @IsString({ each: true })
  orderedProgramIds!: string[];
}
