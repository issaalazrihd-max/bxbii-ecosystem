import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { PrismaService } from "../prisma/prisma.service";
import { AccessTokenPayload } from "../auth/auth.service";

@Injectable()
export class AcademicOperationsService {
  constructor(private readonly prisma: PrismaService) {}

  async overview(user: AccessTokenPayload) {
    const t = user.tenantId;
    const [rooms, sessions, attendance, assessments, certificates, crm] = await Promise.all([
      this.prisma.$queryRawUnsafe<any[]>(`SELECT * FROM academic_rooms WHERE tenant_id=$1 ORDER BY name`, t),
      this.prisma.$queryRawUnsafe<any[]>(`SELECT * FROM academic_sessions WHERE tenant_id=$1 ORDER BY session_date DESC,start_time DESC LIMIT 100`, t),
      this.prisma.$queryRawUnsafe<any[]>(`SELECT * FROM attendance_records WHERE tenant_id=$1 ORDER BY created_at DESC LIMIT 200`, t),
      this.prisma.$queryRawUnsafe<any[]>(`SELECT * FROM assessment_records WHERE tenant_id=$1 ORDER BY created_at DESC LIMIT 200`, t),
      this.prisma.$queryRawUnsafe<any[]>(`SELECT * FROM certificate_records WHERE tenant_id=$1 ORDER BY issue_date DESC LIMIT 100`, t),
      this.prisma.$queryRawUnsafe<any[]>(`SELECT * FROM crm_activities WHERE tenant_id=$1 ORDER BY COALESCE(next_action_at,created_at) DESC LIMIT 100`, t),
    ]);
    return { rooms, sessions, attendance, assessments, certificates, crm };
  }

  listRooms(user: AccessTokenPayload) { return this.prisma.$queryRawUnsafe(`SELECT * FROM academic_rooms WHERE tenant_id=$1 ORDER BY name`, user.tenantId); }
  createRoom(user: AccessTokenPayload, dto: any) {
    return this.prisma.$queryRawUnsafe(`INSERT INTO academic_rooms (id,tenant_id,branch_id,name,capacity,room_type) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`, randomUUID(), user.tenantId, dto.branchId, dto.name, Number(dto.capacity||0), dto.roomType||"CLASSROOM");
  }

  listSessions(user: AccessTokenPayload, batchId?: string, date?: string) {
    const clauses = ["tenant_id=$1"]; const args: any[]=[user.tenantId];
    if(batchId){ clauses.push(`batch_id=$${args.length+1}`); args.push(batchId); }
    if(date){ clauses.push(`session_date=$${args.length+1}`); args.push(date); }
    return this.prisma.$queryRawUnsafe(`SELECT * FROM academic_sessions WHERE ${clauses.join(" AND ")} ORDER BY session_date,start_time`, ...args);
  }
  createSession(user: AccessTokenPayload, dto:any) {
    return this.prisma.$queryRawUnsafe(`INSERT INTO academic_sessions (id,tenant_id,batch_id,trainer_id,room_id,session_date,start_time,end_time,topic,status,notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`, randomUUID(),user.tenantId,dto.batchId,dto.trainerId||null,dto.roomId||null,dto.sessionDate,dto.startTime,dto.endTime,dto.topic||null,dto.status||"SCHEDULED",dto.notes||null);
  }

  listAttendance(user: AccessTokenPayload, sessionId?: string) {
    const args:any[]=[user.tenantId]; const clause=sessionId?`tenant_id=$1 AND session_id=$2`:`tenant_id=$1`; if(sessionId)args.push(sessionId);
    return this.prisma.$queryRawUnsafe(`SELECT * FROM attendance_records WHERE ${clause} ORDER BY created_at DESC`,...args);
  }
  markAttendance(user: AccessTokenPayload, dto:any) {
    return this.prisma.$queryRawUnsafe(`INSERT INTO attendance_records (id,tenant_id,session_id,student_id,status,check_in_at,excuse_status,excuse_note,marked_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (session_id,student_id) DO UPDATE SET status=EXCLUDED.status,check_in_at=EXCLUDED.check_in_at,excuse_status=EXCLUDED.excuse_status,excuse_note=EXCLUDED.excuse_note,marked_by=EXCLUDED.marked_by,updated_at=CURRENT_TIMESTAMP RETURNING *`, randomUUID(),user.tenantId,dto.sessionId,dto.studentId,dto.status||"PRESENT",dto.checkInAt?new Date(dto.checkInAt):null,dto.excuseStatus||"NONE",dto.excuseNote||null,user.sub);
  }

  listAssessments(user: AccessTokenPayload, batchId?: string) {
    const args:any[]=[user.tenantId]; const clause=batchId?`tenant_id=$1 AND batch_id=$2`:`tenant_id=$1`; if(batchId)args.push(batchId);
    return this.prisma.$queryRawUnsafe(`SELECT * FROM assessment_records WHERE ${clause} ORDER BY created_at DESC`,...args);
  }
  createAssessment(user: AccessTokenPayload,dto:any) {
    return this.prisma.$queryRawUnsafe(`INSERT INTO assessment_records (id,tenant_id,batch_id,student_id,title,assessment_type,max_score,score,grade,status,assessed_at,notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,randomUUID(),user.tenantId,dto.batchId,dto.studentId,dto.title,dto.assessmentType||"EXAM",Number(dto.maxScore||100),dto.score==null?null:Number(dto.score),dto.grade||null,dto.status||"PENDING",dto.assessedAt?new Date(dto.assessedAt):null,dto.notes||null);
  }

  listCertificates(user: AccessTokenPayload) { return this.prisma.$queryRawUnsafe(`SELECT * FROM certificate_records WHERE tenant_id=$1 ORDER BY issue_date DESC`,user.tenantId); }
  issueCertificate(user: AccessTokenPayload,dto:any) {
    const number=dto.certificateNo || `BX-${new Date().getFullYear()}-${Math.random().toString(36).slice(2,8).toUpperCase()}`;
    return this.prisma.$queryRawUnsafe(`INSERT INTO certificate_records (id,tenant_id,student_id,batch_id,certificate_no,certificate_type,title_ar,title_en,issue_date,status,verification_token,issued_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,randomUUID(),user.tenantId,dto.studentId,dto.batchId||null,number,dto.certificateType||"COMPLETION",dto.titleAr||"شهادة إتمام",dto.titleEn||"Certificate of Completion",dto.issueDate||new Date(),"ISSUED",randomUUID(),user.sub);
  }
  verifyCertificate(token:string) { return this.prisma.$queryRawUnsafe(`SELECT certificate_no,title_ar,title_en,issue_date,status FROM certificate_records WHERE verification_token=$1`,token); }

  listCrm(user:AccessTokenPayload) { return this.prisma.$queryRawUnsafe(`SELECT * FROM crm_activities WHERE tenant_id=$1 ORDER BY COALESCE(next_action_at,created_at) DESC`,user.tenantId); }
  createCrm(user:AccessTokenPayload,dto:any) { return this.prisma.$queryRawUnsafe(`INSERT INTO crm_activities (id,tenant_id,student_id,activity_type,subject,details,next_action_at,status,assigned_to,created_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,randomUUID(),user.tenantId,dto.studentId||null,dto.activityType||"NOTE",dto.subject,dto.details||null,dto.nextActionAt?new Date(dto.nextActionAt):null,dto.status||"OPEN",dto.assignedTo||null,user.sub); }
}
