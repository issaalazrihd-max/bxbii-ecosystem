import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { AccessTokenPayload } from "../auth/auth.service";
import { RequirePermissions } from "../rbac/permissions.decorator";
import { VheTMService } from "./vhetm.service";

@Controller("vhetm")
export class VheTMController {
  constructor(private readonly service: VheTMService) {}

  @Get("overview")
  @RequirePermissions("erp.batches.view")
  overview(@CurrentUser() u: AccessTokenPayload) { return this.service.overview(u); }

  @Get("inquiries")
  @RequirePermissions("students.list")
  inquiries(@CurrentUser() u: AccessTokenPayload) { return this.service.listInquiries(u); }

  @Post("inquiries")
  @RequirePermissions("students.create")
  createInquiry(@CurrentUser() u: AccessTokenPayload, @Body() dto: any) { return this.service.createInquiry(u, dto); }

  @Get("opportunities")
  @RequirePermissions("students.list")
  opportunities(@CurrentUser() u: AccessTokenPayload) { return this.service.listOpportunities(u); }

  @Post("opportunities")
  @RequirePermissions("students.create")
  createOpportunity(@CurrentUser() u: AccessTokenPayload, @Body() dto: any) { return this.service.createOpportunity(u, dto); }

  @Get("exams")
  @RequirePermissions("erp.batches.view")
  exams(@CurrentUser() u: AccessTokenPayload) { return this.service.listExams(u); }

  @Post("exams")
  @RequirePermissions("erp.batches.manage")
  createExam(@CurrentUser() u: AccessTokenPayload, @Body() dto: any) { return this.service.createExam(u, dto); }

  @Get("suppliers")
  @RequirePermissions("erp.batches.view")
  suppliers(@CurrentUser() u: AccessTokenPayload) { return this.service.listSuppliers(u); }

  @Post("suppliers")
  @RequirePermissions("erp.batches.manage")
  createSupplier(@CurrentUser() u: AccessTokenPayload, @Body() dto: any) { return this.service.createSupplier(u, dto); }

  @Get("purchase-orders")
  @RequirePermissions("erp.batches.view")
  purchaseOrders(@CurrentUser() u: AccessTokenPayload) { return this.service.listPurchaseOrders(u); }

  @Post("purchase-orders")
  @RequirePermissions("erp.batches.manage")
  createPurchaseOrder(@CurrentUser() u: AccessTokenPayload, @Body() dto: any) { return this.service.createPurchaseOrder(u, dto); }

  @Get("approval-workflows")
  @RequirePermissions("erp.batches.view")
  approvalWorkflows(@CurrentUser() u: AccessTokenPayload) { return this.service.listApprovalWorkflows(u); }

  @Post("approval-workflows")
  @RequirePermissions("erp.batches.manage")
  saveApprovalWorkflow(@CurrentUser() u: AccessTokenPayload, @Body() dto: any) { return this.service.saveApprovalWorkflow(u, dto); }

  @Get("approval-requests")
  @RequirePermissions("erp.batches.view")
  approvalRequests(@CurrentUser() u: AccessTokenPayload) { return this.service.listApprovalRequests(u); }

  @Post("approval-requests/submit")
  @RequirePermissions("erp.batches.manage")
  submitApproval(@CurrentUser() u: AccessTokenPayload, @Body() dto: any) { return this.service.submitApproval(u, dto); }

  @Post("approval-requests/action")
  @RequirePermissions("erp.batches.manage")
  actOnApproval(@CurrentUser() u: AccessTokenPayload, @Body() dto: any) { return this.service.actOnApproval(u, dto); }

  @Get("settings")
  @RequirePermissions("erp.batches.view")
  settings(@CurrentUser() u: AccessTokenPayload, @Query("category") category?: string) { return this.service.listSettings(u, category); }

  @Post("settings")
  @RequirePermissions("erp.batches.manage")
  saveSetting(@CurrentUser() u: AccessTokenPayload, @Body() dto: any) { return this.service.saveSetting(u, dto); }
}
