-- Phase 1 demo scope: fictional Trainers + Employee.position (bxbii Institute
-- Management System). Full Trainer Management module (course assignments,
-- teaching-hours tracking, performance) lands in a later phase against this
-- same foundation.

-- --- Enums -------------------------------------------------------------

CREATE TYPE "TrainerStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- --- Employee: add position/title field ---------------------------------

ALTER TABLE "employees" ADD COLUMN "position" TEXT;

-- --- Trainers ------------------------------------------------------------

CREATE TABLE "trainers" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "trainer_code" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "specialization" TEXT,
    "email" TEXT,
    "mobile" TEXT,
    "teaching_hours" INTEGER NOT NULL DEFAULT 0,
    "status" "TrainerStatus" NOT NULL DEFAULT 'ACTIVE',
    "primary_branch_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "trainers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "trainers_tenant_id_trainer_code_key" ON "trainers"("tenant_id", "trainer_code");

ALTER TABLE "trainers" ADD CONSTRAINT "trainers_primary_branch_id_fkey" FOREIGN KEY ("primary_branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
