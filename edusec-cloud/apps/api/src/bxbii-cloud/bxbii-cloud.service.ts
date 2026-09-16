import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { PrismaService } from "../prisma/prisma.service";
import { AccessTokenPayload } from "../auth/auth.service";

@Injectable()
export class BxbiiCloudService {
  constructor(private readonly prisma: PrismaService) {}

  private q<T = any>(sql: string, ...args: any[]) {
    return this.prisma.$queryRawUnsafe<T[]>(sql, ...args);
  }

  async overview(user: AccessTokenPayload) {
    const t = user.tenantId;
    const [inquiries, opportunities, exams, suppliers, purchaseOrders, approvals, settings] = await Promise.all([
      this.q(`SELECT * FROM bxbii_cloud_inquiries WHERE tenant_id=$1 ORDER BY created_at DESC LIMIT 100`, t),
      this.q(`SELECT * FROM bxbii_cloud_opportunities WHERE tenant_id=$1 ORDER BY created_at DESC LIMIT 100`, t),
      this.q(`SELECT * FROM bxbii_cloud_exam_schedules WHERE tenant_id=$1 ORDER BY exam_date DESC,start_time DESC LIMIT 100`, t),
      this.q(`SELECT * FROM bxbii_cloud_suppliers WHERE tenant_id=$1 ORDER BY name`, t),
      this.q(`SELECT * FROM bxbii_cloud_purchase_orders WHERE tenant_id=$1 ORDER BY order_date DESC,created_at DESC LIMIT 100`, t),
      this.q(`SELECT * FROM bxbii_cloud_approval_requests WHERE tenant_id=$1 ORDER BY submitted_at DESC LIMIT 100`, t),
      this.q(`SELECT category,setting_key,value_json,updated_at FROM bxbii_cloud_settings WHERE tenant_id=$1 ORDER BY category,setting_key`, t),
    ]);
    return { inquiries, opportunities, exams, suppliers, purchaseOrders, approvals, settings };
  }

  listInquiries(user: AccessTokenPayload) { return this.q(`SELECT * FROM bxbii_cloud_inquiries WHERE tenant_id=$1 ORDER BY created_at DESC`, user.tenantId); }
  createInquiry(user: AccessTokenPayload, dto: any) {
    return this.q(`INSERT INTO bxbii_cloud_inquiries (id,tenant_id,branch_id,full_name,mobile,email,source,interested_course,status,assigned_to,next_follow_up_at,notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`, randomUUID(), user.tenantId, dto.branchId||null, dto.fullName, dto.mobile||null, dto.email||null, dto.source||null, dto.interestedCourse||null, dto.status||"NEW", dto.assignedTo||null, dto.nextFollowUpAt?new Date(dto.nextFollowUpAt):null, dto.notes||null);
  }

  listOpportunities(user: AccessTokenPayload) { return this.q(`SELECT * FROM bxbii_cloud_opportunities WHERE tenant_id=$1 ORDER BY created_at DESC`, user.tenantId); }
  createOpportunity(user: AccessTokenPayload, dto: any) {
    return this.q(`INSERT INTO bxbii_cloud_opportunities (id,tenant_id,inquiry_id,name,stage,estimated_value,probability,expected_close_date,owner_id,notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`, randomUUID(), user.tenantId, dto.inquiryId||null, dto.name, dto.stage||"QUALIFIED", Number(dto.estimatedValue||0), Number(dto.probability||0), dto.expectedCloseDate||null, dto.ownerId||null, dto.notes||null);
  }

  listExams(user: AccessTokenPayload) { return this.q(`SELECT * FROM bxbii_cloud_exam_schedules WHERE tenant_id=$1 ORDER BY exam_date,start_time`, user.tenantId); }
  createExam(user: AccessTokenPayload, dto: any) {
    return this.q(`INSERT INTO bxbii_cloud_exam_schedules (id,tenant_id,branch_id,batch_id,room_id,title,exam_type,exam_date,start_time,end_time,max_score,status,instructions) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`, randomUUID(), user.tenantId, dto.branchId||null, dto.batchId, dto.roomId||null, dto.title, dto.examType||"FINAL", dto.examDate, dto.startTime, dto.endTime, Number(dto.maxScore||100), dto.status||"SCHEDULED", dto.instructions||null);
  }

  listSuppliers(user: AccessTokenPayload) { return this.q(`SELECT * FROM bxbii_cloud_suppliers WHERE tenant_id=$1 ORDER BY name`, user.tenantId); }
  createSupplier(user: AccessTokenPayload, dto: any) {
    return this.q(`INSERT INTO bxbii_cloud_suppliers (id,tenant_id,supplier_code,name,contact_name,email,phone,tax_number,address,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`, randomUUID(), user.tenantId, dto.supplierCode, dto.name, dto.contactName||null, dto.email||null, dto.phone||null, dto.taxNumber||null, dto.address||null, dto.status||"ACTIVE");
  }

  listPurchaseOrders(user: AccessTokenPayload) { return this.q(`SELECT po.*, s.name AS supplier_name FROM bxbii_cloud_purchase_orders po LEFT JOIN bxbii_cloud_suppliers s ON s.id=po.supplier_id WHERE po.tenant_id=$1 ORDER BY po.order_date DESC,po.created_at DESC`, user.tenantId); }
  async createPurchaseOrder(user: AccessTokenPayload, dto: any) {
    const id = randomUUID();
    const items = Array.isArray(dto.items) ? dto.items : [];
    const subtotal = items.reduce((sum: number, item: any) => sum + Number(item.quantity||1) * Number(item.unitPrice||0), 0);
    const tax = Number(dto.taxAmount||0);
    const total = subtotal + tax;
    const poNumber = dto.poNumber || `PO-${new Date().getFullYear()}-${Math.random().toString(36).slice(2,8).toUpperCase()}`;
    await this.q(`INSERT INTO bxbii_cloud_purchase_orders (id,tenant_id,branch_id,supplier_id,po_number,order_date,currency,subtotal,tax_amount,total_amount,status,approval_status,notes,created_by) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`, id, user.tenantId, dto.branchId||null, dto.supplierId||null, poNumber, dto.orderDate||new Date(), dto.currency||"OMR", subtotal, tax, total, dto.status||"DRAFT", "NOT_REQUIRED", dto.notes||null, user.sub);
    for (const item of items) {
      const quantity = Number(item.quantity||1);
      const unitPrice = Number(item.unitPrice||0);
      await this.q(`INSERT INTO bxbii_cloud_purchase_order_items (id,purchase_order_id,description,quantity,unit_price,amount) VALUES ($1,$2,$3,$4,$5,$6)`, randomUUID(), id, item.description, quantity, unitPrice, quantity*unitPrice);
    }
    return this.q(`SELECT * FROM bxbii_cloud_purchase_orders WHERE id=$1`, id);
  }

  listApprovalWorkflows(user: AccessTokenPayload) { return this.q(`SELECT * FROM bxbii_cloud_approval_workflows WHERE tenant_id=$1 ORDER BY module,document_type`, user.tenantId); }
  async saveApprovalWorkflow(user: AccessTokenPayload, dto: any) {
    const id = dto.id || randomUUID();
    await this.q(`INSERT INTO bxbii_cloud_approval_workflows (id,tenant_id,module,document_type,enabled,sequential,allow_edit_resubmit,notify_approvers,notify_submitter,amount_rule_enabled,amount_threshold,date_rule_enabled,within_days) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) ON CONFLICT (tenant_id,module,document_type) DO UPDATE SET enabled=EXCLUDED.enabled,sequential=EXCLUDED.sequential,allow_edit_resubmit=EXCLUDED.allow_edit_resubmit,notify_approvers=EXCLUDED.notify_approvers,notify_submitter=EXCLUDED.notify_submitter,amount_rule_enabled=EXCLUDED.amount_rule_enabled,amount_threshold=EXCLUDED.amount_threshold,date_rule_enabled=EXCLUDED.date_rule_enabled,within_days=EXCLUDED.within_days,updated_at=CURRENT_TIMESTAMP`, id, user.tenantId, dto.module, dto.documentType, dto.enabled!==false, dto.sequential!==false, dto.allowEditResubmit===true, dto.notifyApprovers!==false, dto.notifySubmitter!==false, dto.amountRuleEnabled===true, dto.amountThreshold==null?null:Number(dto.amountThreshold), dto.dateRuleEnabled===true, dto.withinDays==null?null:Number(dto.withinDays));
    const workflow = await this.q(`SELECT id FROM bxbii_cloud_approval_workflows WHERE tenant_id=$1 AND module=$2 AND document_type=$3`, user.tenantId, dto.module, dto.documentType);
    const workflowId = (workflow as any[])[0]?.id;
    if (workflowId && Array.isArray(dto.steps)) {
      await this.q(`DELETE FROM bxbii_cloud_approval_steps WHERE workflow_id=$1`, workflowId);
      for (const step of dto.steps) {
        await this.q(`INSERT INTO bxbii_cloud_approval_steps (id,workflow_id,level,priority,required,approver_type,approver_user_id,permission_code) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`, randomUUID(), workflowId, Number(step.level||1), Number(step.priority||1), step.required!==false, step.approverType||"USER", step.approverUserId||null, step.permissionCode||null);
      }
    }
    return this.q(`SELECT * FROM bxbii_cloud_approval_workflows WHERE id=$1`, workflowId);
  }

  listApprovalRequests(user: AccessTokenPayload) { return this.q(`SELECT * FROM bxbii_cloud_approval_requests WHERE tenant_id=$1 ORDER BY submitted_at DESC`, user.tenantId); }
  async submitApproval(user: AccessTokenPayload, dto: any) {
    const workflowRows = await this.q(`SELECT * FROM bxbii_cloud_approval_workflows WHERE tenant_id=$1 AND module=$2 AND document_type=$3 AND enabled=true`, user.tenantId, dto.module, dto.documentType);
    const workflow:any = (workflowRows as any[])[0];
    if (!workflow) return { status: "NOT_REQUIRED", documentId: dto.documentId };
    const requestId = randomUUID();
    await this.q(`INSERT INTO bxbii_cloud_approval_requests (id,tenant_id,workflow_id,document_type,document_id,version,status,current_level,submitted_by,edit_note) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`, requestId, user.tenantId, workflow.id, dto.documentType, dto.documentId, Number(dto.version||1), "PENDING", 1, user.sub, dto.editNote||null);
    return this.q(`SELECT * FROM bxbii_cloud_approval_requests WHERE id=$1`, requestId);
  }

  actOnApproval(user: AccessTokenPayload, dto: any) {
    return this.q(`INSERT INTO bxbii_cloud_approval_actions (id,request_id,level,approver_user_id,action,comment) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`, randomUUID(), dto.requestId, Number(dto.level||1), user.sub, dto.action, dto.comment||null);
  }

  listSettings(user: AccessTokenPayload, category?: string) {
    if (category) return this.q(`SELECT * FROM bxbii_cloud_settings WHERE tenant_id=$1 AND category=$2 ORDER BY setting_key`, user.tenantId, category);
    return this.q(`SELECT * FROM bxbii_cloud_settings WHERE tenant_id=$1 ORDER BY category,setting_key`, user.tenantId);
  }
  saveSetting(user: AccessTokenPayload, dto: any) {
    return this.q(`INSERT INTO bxbii_cloud_settings (id,tenant_id,category,setting_key,value_json,updated_by) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (tenant_id,category,setting_key) DO UPDATE SET value_json=EXCLUDED.value_json,updated_by=EXCLUDED.updated_by,updated_at=CURRENT_TIMESTAMP RETURNING *`, randomUUID(), user.tenantId, dto.category, dto.settingKey, JSON.stringify(dto.value ?? {}), user.sub);
  }
}
