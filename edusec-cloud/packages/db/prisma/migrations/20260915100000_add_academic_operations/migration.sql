-- bxbii Cloud Academic Operations
CREATE TABLE IF NOT EXISTS "academic_rooms" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" TEXT NOT NULL,
  "branch_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "capacity" INTEGER NOT NULL DEFAULT 0,
  "room_type" TEXT NOT NULL DEFAULT 'CLASSROOM',
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "academic_rooms_tenant_branch_idx" ON "academic_rooms"("tenant_id","branch_id");

CREATE TABLE IF NOT EXISTS "academic_sessions" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" TEXT NOT NULL,
  "batch_id" TEXT NOT NULL,
  "trainer_id" TEXT,
  "room_id" UUID,
  "session_date" DATE NOT NULL,
  "start_time" TIME NOT NULL,
  "end_time" TIME NOT NULL,
  "topic" TEXT,
  "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "academic_sessions_batch_date_idx" ON "academic_sessions"("batch_id","session_date");
CREATE INDEX IF NOT EXISTS "academic_sessions_tenant_date_idx" ON "academic_sessions"("tenant_id","session_date");

CREATE TABLE IF NOT EXISTS "attendance_records" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" TEXT NOT NULL,
  "session_id" UUID NOT NULL,
  "student_id" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PRESENT',
  "check_in_at" TIMESTAMP(3),
  "excuse_status" TEXT NOT NULL DEFAULT 'NONE',
  "excuse_note" TEXT,
  "marked_by" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("session_id","student_id")
);
CREATE INDEX IF NOT EXISTS "attendance_tenant_student_idx" ON "attendance_records"("tenant_id","student_id");

CREATE TABLE IF NOT EXISTS "assessment_records" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" TEXT NOT NULL,
  "batch_id" TEXT NOT NULL,
  "student_id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "assessment_type" TEXT NOT NULL DEFAULT 'EXAM',
  "max_score" NUMERIC(10,2) NOT NULL DEFAULT 100,
  "score" NUMERIC(10,2),
  "grade" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "assessed_at" TIMESTAMP(3),
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "assessment_tenant_batch_idx" ON "assessment_records"("tenant_id","batch_id");
CREATE INDEX IF NOT EXISTS "assessment_tenant_student_idx" ON "assessment_records"("tenant_id","student_id");

CREATE TABLE IF NOT EXISTS "certificate_records" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" TEXT NOT NULL,
  "student_id" TEXT NOT NULL,
  "batch_id" TEXT,
  "certificate_no" TEXT NOT NULL,
  "certificate_type" TEXT NOT NULL DEFAULT 'COMPLETION',
  "title_ar" TEXT NOT NULL,
  "title_en" TEXT NOT NULL,
  "issue_date" DATE NOT NULL DEFAULT CURRENT_DATE,
  "status" TEXT NOT NULL DEFAULT 'ISSUED',
  "verification_token" TEXT NOT NULL,
  "pdf_url" TEXT,
  "issued_by" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("tenant_id","certificate_no"),
  UNIQUE("verification_token")
);
CREATE INDEX IF NOT EXISTS "certificate_tenant_student_idx" ON "certificate_records"("tenant_id","student_id");

CREATE TABLE IF NOT EXISTS "crm_activities" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenant_id" TEXT NOT NULL,
  "student_id" TEXT,
  "activity_type" TEXT NOT NULL DEFAULT 'NOTE',
  "subject" TEXT NOT NULL,
  "details" TEXT,
  "next_action_at" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "assigned_to" TEXT,
  "created_by" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "crm_tenant_next_action_idx" ON "crm_activities"("tenant_id","next_action_at");
