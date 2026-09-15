import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { AccessTokenPayload } from "../auth/auth.service";
import { AcademicOperationsService } from "./academic-operations.service";

@Controller("academic-operations")
export class AcademicOperationsController {
  constructor(private readonly service: AcademicOperationsService) {}

  @Get("overview") overview(@CurrentUser() u:AccessTokenPayload){ return this.service.overview(u); }
  @Get("rooms") rooms(@CurrentUser() u:AccessTokenPayload){ return this.service.listRooms(u); }
  @Post("rooms") createRoom(@CurrentUser() u:AccessTokenPayload,@Body() dto:any){ return this.service.createRoom(u,dto); }
  @Get("sessions") sessions(@CurrentUser() u:AccessTokenPayload,@Query("batchId") batchId?:string,@Query("date") date?:string){ return this.service.listSessions(u,batchId,date); }
  @Post("sessions") createSession(@CurrentUser() u:AccessTokenPayload,@Body() dto:any){ return this.service.createSession(u,dto); }
  @Get("attendance") attendance(@CurrentUser() u:AccessTokenPayload,@Query("sessionId") sessionId?:string){ return this.service.listAttendance(u,sessionId); }
  @Post("attendance") markAttendance(@CurrentUser() u:AccessTokenPayload,@Body() dto:any){ return this.service.markAttendance(u,dto); }
  @Get("assessments") assessments(@CurrentUser() u:AccessTokenPayload,@Query("batchId") batchId?:string){ return this.service.listAssessments(u,batchId); }
  @Post("assessments") createAssessment(@CurrentUser() u:AccessTokenPayload,@Body() dto:any){ return this.service.createAssessment(u,dto); }
  @Get("certificates") certificates(@CurrentUser() u:AccessTokenPayload){ return this.service.listCertificates(u); }
  @Post("certificates") issueCertificate(@CurrentUser() u:AccessTokenPayload,@Body() dto:any){ return this.service.issueCertificate(u,dto); }
  @Get("certificates/verify/:token") verify(@Param("token") token:string){ return this.service.verifyCertificate(token); }
  @Get("crm") crm(@CurrentUser() u:AccessTokenPayload){ return this.service.listCrm(u); }
  @Post("crm") createCrm(@CurrentUser() u:AccessTokenPayload,@Body() dto:any){ return this.service.createCrm(u,dto); }
}
