-- bxbii / VheTM-compatible training ERP extensions
-- Adds the operational modules visible in the VheTM reference:
-- inquiries/CRM, exam scheduling, procurement, configurable approvals and settings.
-- Existing bxbii tables continue to provide students, courses, batches,
-- attendance, assessments, certificates, employees, invoices and payments.

CREATE TABLE IF NOT EXISTS "vhetm_inquiries" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" TEXT NOT NULL,
  "branch_id" TEXT,
  "full_name" TEXT NOT NULL,
  "mobile" TEXT,
  "email" TEXT,
  "source" TEXT,
  "interested_course" TEXT,
  "status" TEXT NOT NULL DEFAULT 'NEW',
  "assigned_to" TEXT,
  "next_follow_up_at" TIMESTAMP(3),
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "vhetm_inquiries_tenant_status_idx" ON "vhetm_inquiries"("tenant_id","status");
CREATE INDEX IF NOT EXISTS "vhetm_inquiries_tenant_followup_idx" ON "vhetm_inquiries"("tenant_id","next_follow_up_at");

CREATE TABLE IF NOT EXISTS "vhetm_opportunities" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" TEXT NOT NULL,
  "inquiry_id" UUID,
  "name" TEXT NOT NULL,
  "stage" TEXT NOT NULL DEFAULT 'QUALIFIED',
  "estimated_value" NUMERIC(12,2) NOT NULL DEFAULT 0,
  "probability" NUMERIC(5,2) NOT NULL DEFAULT 0,
  "expected_close_date" DATE,
  "owner_id" TEXT,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "vhetm_opportunities_tenant_stage_idx" ON "vhetm_opportunities"("tenant_id","stage");

CREATE TABLE IF NOT EXISTS "vhetm_exam_schedules" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" TEXT NOT NULL,
  "branch_id" TEXT,
  "batch_id" TEXT NOT NULL,
  "room_id" UUID,
  "title" TEXT NOT NULL,
  "exam_type" TEXT NOT NULL DEFAULT 'FINAL',
  "exam_date" DATE NOT NULL,
  "start_time" TIME NOT NULL,
  "end_time" TIME NOT NULL,
  "max_score" NUMERIC(10,2) NOT NULL DEFAULT 100,
  "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
  "instructions" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "vhetm_exams_tenant_date_idx" ON "vhetm_exam_schedules"("tenant_id","exam_date");
CREATE INDEX IF NOT EXISTS "vhetm_exams_batch_idx" ON "vhetm_exam_schedules"("batch_id");

CREATE TABLE IF NOT EXISTS "vhetm_suppliers" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" TEXT NOT NULL,
  "supplier_code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "contact_name" TEXT,
  "email" TEXT,
  "phone" TEXT,
  "tax_number" TEXT,
  "address" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("tenant_id","supplier_code")
);
CREATE INDEX IF NOT EXISTS "vhetm_suppliers_tenant_status_idx" ON "vhetm_suppliers"("tenant_id","status");

CREATE TABLE IF NOT EXISTS "vhetm_purchase_orders" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" TEXT NOT NULL,
  "branch_id" TEXT,
  "supplier_id" UUID,
  "po_number" TEXT NOT NULL,
  "order_date" DATE NOT NULL DEFAULT CURRENT_DATE,
  "currency" TEXT NOT NULL DEFAULT 'OMR',
  "subtotal" NUMERIC(12,2) NOT NULL DEFAULT 0,
  "tax_amount" NUMERIC(12,2) NOT NULL DEFAULT 0,
  "total_amount" NUMERIC(12,2) NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "approval_status" TEXT NOT NULL DEFAULT 'NOT_REQUIRED',
  "notes" TEXT,
  "created_by" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("tenant_id","po_number")
);
CREATE INDEX IF NOT EXISTS "vhetm_po_tenant_status_idx" ON "vhetm_purchase_orders"("tenant_id","status");
CREATE INDEX IF NOT EXISTS "vhetm_po_tenant_approval_idx" ON "vhetm_purchase_orders"("tenant_id","approval_status");

CREATE TABLE IF NOT EXISTS "vhetm_purchase_order_items" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "purchase_order_id" UUID NOT NULL,
  "description" TEXT NOT NULL,
  "quantity" NUMERIC(12,2) NOT NULL DEFAULT 1,
  "unit_price" NUMERIC(12,2) NOT NULL DEFAULT 0,
  "amount" NUMERIC(12,2) NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "vhetm_po_items_po_idx" ON "vhetm_purchase_order_items"("purchase_order_id");

CREATE TABLE IF NOT EXISTS "vhetm_approval_workflows" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" TEXT NOT NULL,
  "module" TEXT NOT NULL,
  "document_type" TEXT NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT TRUE,
  "sequential" BOOLEAN NOT NULL DEFAULT TRUE,
  "allow_edit_resubmit" BOOLEAN NOT NULL DEFAULT FALSE,
  "notify_approvers" BOOLEAN NOT NULL DEFAULT TRUE,
  "notify_submitter" BOOLEAN NOT NULL DEFAULT TRUE,
  "amount_rule_enabled" BOOLEAN NOT NULL DEFAULT FALSE,
  "amount_threshold" NUMERIC(12,2),
  "date_rule_enabled" BOOLEAN NOT NULL DEFAULT FALSE,
  "within_days" INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("tenant_id","module","document_type")
);

CREATE TABLE IF NOT EXISTS "vhetm_approval_steps" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "workflow_id" UUID NOT NULL,
  "level" INTEGER NOT NULL,
  "priority" INTEGER NOT NULL DEFAULT 1,
  "required" BOOLEAN NOT NULL DEFAULT TRUE,
  "approver_type" TEXT NOT NULL DEFAULT 'USER',
  "approver_user_id" TEXT,
  "permission_code" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("workflow_id","level","priority")
);
CREATE INDEX IF NOT EXISTS "vhetm_approval_steps_workflow_idx" ON "vhetm_approval_steps"("workflow_id","level");

CREATE TABLE IF NOT EXISTS "vhetm_approval_requests" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" TEXT NOT NULL,
  "workflow_id" UUID NOT NULL,
  "document_type" TEXT NOT NULL,
  "document_id" TEXT NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 1,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "current_level" INTEGER NOT NULL DEFAULT 1,
  "submitted_by" TEXT,
  "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completed_at" TIMESTAMP(3),
  "edit_note" TEXT
);
CREATE INDEX IF NOT EXISTS "vhetm_approval_requests_document_idx" ON "vhetm_approval_requests"("tenant_id","document_type","document_id");

CREATE TABLE IF NOT EXISTS "vhetm_approval_actions" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "request_id" UUID NOT NULL,
  "level" INTEGER NOT NULL,
  "approver_user_id" TEXT,
  "action" TEXT NOT NULL,
  "comment" TEXT,
  "acted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "vhetm_approval_actions_request_idx" ON "vhetm_approval_actions"("request_id","level");

CREATE TABLE IF NOT EXISTS "vhetm_settings" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "setting_key" TEXT NOT NULL,
  "value_json" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "updated_by" TEXT,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("tenant_id","category","setting_key")
);
CREATE INDEX IF NOT EXISTS "vhetm_settings_tenant_category_idx" ON "vhetm_settings"("tenant_id","category");
