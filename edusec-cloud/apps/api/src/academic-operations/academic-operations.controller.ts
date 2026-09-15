import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { AccessTokenPayload } from "../auth/auth.service";
import { RequirePermissions } from "../rbac/permissions.decorator";
import { AcademicOperationsService } from "./academic-operations.service";

@Controller("academic-operations")
export class AcademicOperationsController {
  constructor(private readonly service: AcademicOperationsService) {}
  @Get("overview") @RequirePermissions("erp.batches.view") overview(@CurrentUser() u:AccessTokenPayload){return this.service.overview(u)}
  @Get("rooms") @RequirePermissions("erp.batches.view") rooms(@CurrentUser() u:AccessTokenPayload){return this.service.listRooms(u)}
  @Post("rooms") @RequirePermissions("erp.batches.manage") createRoom(@CurrentUser() u:AccessTokenPayload,@Body() dto:any){return this.service.createRoom(u,dto)}
  @Get("sessions") @RequirePermissions("erp.batches.view") sessions(@CurrentUser() u:AccessTokenPayload,@Query("batchId") b?:string,@Query("date") d?:string){return this.service.listSessions(u,b,d)}
  @Post("sessions") @RequirePermissions("erp.batches.manage") createSession(@CurrentUser() u:AccessTokenPayload,@Body() dto:any){return this.service.createSession(u,dto)}
  @Get("attendance") @RequirePermissions("erp.batches.view") attendance(@CurrentUser() u:AccessTokenPayload,@Query("sessionId") s?:string){return this.service.listAttendance(u,s)}
  @Post("attendance") @RequirePermissions("erp.batches.manage") markAttendance(@CurrentUser() u:AccessTokenPayload,@Body() dto:any){return this.service.markAttendance(u,dto)}
  @Get("assessments") @RequirePermissions("erp.batches.view") assessments(@CurrentUser() u:AccessTokenPayload,@Query("batchId") b?:string){return this.service.listAssessments(u,b)}
  @Post("assessments") @RequirePermissions("erp.batches.manage") createAssessment(@CurrentUser() u:AccessTokenPayload,@Body() dto:any){return this.service.createAssessment(u,dto)}
  @Get("certificates") @RequirePermissions("erp.batches.view") certificates(@CurrentUser() u:AccessTokenPayload){return this.service.listCertificates(u)}
  @Post("certificates") @RequirePermissions("erp.batches.manage") issueCertificate(@CurrentUser() u:AccessTokenPayload,@Body() dto:any){return this.service.issueCertificate(u,dto)}
  @Get("certificates/verify/:token") verify(@Param("token") token:string){return this.service.verifyCertificate(token)}
  @Get("crm") @RequirePermissions("students.list") crm(@CurrentUser() u:AccessTokenPayload){return this.service.listCrm(u)}
  @Post("crm") @RequirePermissions("students.create") createCrm(@CurrentUser() u:AccessTokenPayload,@Body() dto:any){return this.service.createCrm(u,dto)}
}
