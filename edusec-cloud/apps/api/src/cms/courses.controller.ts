import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { AccessTokenPayload } from "../auth/auth.service";
import { RequirePermissions } from "../rbac/permissions.decorator";
import { CoursesService } from "./courses.service";
import { CreateCourseDto } from "./dto/create-course.dto";
import { UpdateCourseDto } from "./dto/update-course.dto";
import { ReorderCoursesDto } from "./dto/reorder-courses.dto";

/**
 * Courses catalog admin API (bxbii Ecosystem brief — Courses module),
 * backing the COURSES page-builder block. A flat list — no nested
 * sub-resource — so this mirrors ProgramsController's view/manage
 * permission split. Public, unauthenticated rendering lives in
 * PublicSiteController.
 */
@Controller("cms/courses")
export class CoursesController {
  constructor(private readonly courses: CoursesService) {}

  @Get()
  @RequirePermissions("cms.courses.view")
  list(@CurrentUser() user: AccessTokenPayload) {
    return this.courses.list(user);
  }

  @Post()
  @RequirePermissions("cms.courses.manage")
  create(@CurrentUser() user: AccessTokenPayload, @Body() dto: CreateCourseDto) {
    return this.courses.create(user, dto);
  }

  @Patch(":courseId")
  @RequirePermissions("cms.courses.manage")
  update(
    @CurrentUser() user: AccessTokenPayload,
    @Param("courseId") courseId: string,
    @Body() dto: UpdateCourseDto,
  ) {
    return this.courses.update(user, courseId, dto);
  }

  @Delete(":courseId")
  @RequirePermissions("cms.courses.manage")
  remove(@CurrentUser() user: AccessTokenPayload, @Param("courseId") courseId: string) {
    return this.courses.remove(user, courseId);
  }

  @Post("reorder")
  @RequirePermissions("cms.courses.manage")
  reorder(@CurrentUser() user: AccessTokenPayload, @Body() dto: ReorderCoursesDto) {
    return this.courses.reorder(user, dto);
  }
}
