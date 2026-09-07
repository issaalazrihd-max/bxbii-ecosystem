import { IsArray, IsString } from "class-validator";

/** Body: all of the tenant's course ids, in their new display order. */
export class ReorderCoursesDto {
  @IsArray()
  @IsString({ each: true })
  orderedCourseIds!: string[];
}
