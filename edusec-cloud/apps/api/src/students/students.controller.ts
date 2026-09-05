import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { AccessTokenPayload } from "../auth/auth.service";
import { RequirePermissions } from "../rbac/permissions.decorator";
import { StudentsService } from "./students.service";
import { CreateStudentDto } from "./dto/create-student.dto";
import { SearchStudentsDto } from "./dto/search-students.dto";
import { CreateTransferRequestDto } from "./dto/create-transfer-request.dto";
import { ReceivingBranchReviewDto } from "./dto/receiving-branch-review.dto";

@Controller("students")
export class StudentsController {
  constructor(private readonly students: StudentsService) {}

  @Get()
  @RequirePermissions("students.list")
  search(@CurrentUser() user: AccessTokenPayload, @Query() query: SearchStudentsDto) {
    return this.students.search(user, query);
  }

  @Get(":id")
  @RequirePermissions("students.view")
  findOne(@CurrentUser() user: AccessTokenPayload, @Param("id") id: string) {
    return this.students.findOne(user, id);
  }

  @Post()
  @RequirePermissions("students.create")
  create(@CurrentUser() user: AccessTokenPayload, @Body() dto: CreateStudentDto) {
    return this.students.create(user, dto);
  }

  // -- Transfer workflow (Multi-Branch doc, Section 6) --------------------

  @Post(":id/transfers")
  @RequirePermissions("students.transfer.request")
  requestTransfer(
    @CurrentUser() user: AccessTokenPayload,
    @Param("id") id: string,
    @Body() dto: CreateTransferRequestDto,
  ) {
    return this.students.requestTransfer(user, id, dto);
  }

  @Post("transfers/:transferId/current-branch-review")
  @RequirePermissions("students.transfer.review")
  currentBranchReview(@CurrentUser() user: AccessTokenPayload, @Param("transferId") transferId: string) {
    return this.students.currentBranchReview(user, transferId);
  }

  @Post("transfers/:transferId/receiving-branch-review")
  @RequirePermissions("students.transfer.review")
  receivingBranchReview(
    @CurrentUser() user: AccessTokenPayload,
    @Param("transferId") transferId: string,
    @Body() dto: ReceivingBranchReviewDto,
  ) {
    return this.students.receivingBranchReview(user, transferId, dto);
  }

  @Post("transfers/:transferId/approve")
  @RequirePermissions("students.transfer.approve")
  approve(@CurrentUser() user: AccessTokenPayload, @Param("transferId") transferId: string) {
    return this.students.approve(user, transferId);
  }

  @Post("transfers/:transferId/complete")
  @RequirePermissions("students.transfer.approve")
  complete(@CurrentUser() user: AccessTokenPayload, @Param("transferId") transferId: string) {
    return this.students.complete(user, transferId);
  }

  @Post("transfers/:transferId/reject")
  @RequirePermissions("students.transfer.review")
  reject(
    @CurrentUser() user: AccessTokenPayload,
    @Param("transferId") transferId: string,
    @Body("reason") reason?: string,
  ) {
    return this.students.reject(user, transferId, reason);
  }
}
