-- ERP — Institute Management, Phase 1: Batches & Enrollment.
--
-- Closes the concrete gap behind "how do I register students... need to add
-- batches, scheduled, and ability to edit the details of them all": Student,
-- Program, Course, Trainer, and Branch previously had zero relations linking
-- them. Batch is branch-scoped (batch_code + branch_id), same pattern as
-- students/employees/inventory_items; Enrollment links a Student to a Batch.

-- --- Types -------------------------------------------------------------
CREATE TYPE "BatchStatus" AS ENUM ('PLANNED', 'OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE "EnrollmentStatus" AS ENUM ('ENROLLED', 'WAITLISTED', 'COMPLETED', 'WITHDRAWN', 'CANCELLED');

-- --- Tables --------------------------------------------------------------
CREATE TABLE "batches" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "branch_id" TEXT NOT NULL,
    "program_id" TEXT,
    "course_id" TEXT,
    "trainer_id" TEXT,
    "batch_code" TEXT NOT NULL,
    "ar_label" TEXT,
    "en_label" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "schedule" TEXT,
    "capacity" INTEGER NOT NULL DEFAULT 0,
    "status" "BatchStatus" NOT NULL DEFAULT 'PLANNED',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "batches_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "batches_tenant_id_batch_code_key" ON "batches"("tenant_id", "batch_code");

CREATE INDEX "batches_tenant_id_branch_id_idx" ON "batches"("tenant_id", "branch_id");

CREATE TABLE "enrollments" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'ENROLLED',
    "enrollment_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "enrollments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "enrollments_student_id_batch_id_key" ON "enrollments"("student_id", "batch_id");

CREATE INDEX "enrollments_tenant_id_batch_id_idx" ON "enrollments"("tenant_id", "batch_id");

CREATE INDEX "enrollments_tenant_id_student_id_idx" ON "enrollments"("tenant_id", "student_id");

-- --- Foreign keys ----------------------------------------------------------
ALTER TABLE "batches" ADD CONSTRAINT "batches_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "batches" ADD CONSTRAINT "batches_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "batches" ADD CONSTRAINT "batches_program_id_fkey" FOREIGN KEY ("program_id") REFERENCES "programs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "batches" ADD CONSTRAINT "batches_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "batches" ADD CONSTRAINT "batches_trainer_id_fkey" FOREIGN KEY ("trainer_id") REFERENCES "trainers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "enrollments" ADD CONSTRAINT "enrollments_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
