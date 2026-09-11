-- ERP — Institute Management, Phase 2: Invoices & Payments (financial and
-- operational management module).
--
-- Closes the concrete gap behind "ابدا ERP واربطها مع سترايب اذا متوفر في
-- منطقتي او اربطها مع بي تابس" (start the ERP and connect it to Stripe if
-- available in Oman, else PayTabs — Thawani also suggested for Omani
-- payments): Invoice bills a Student (optionally for a specific
-- Enrollment) from one Branch; Payment records one attempt to settle an
-- Invoice, either MANUAL (cash/bank transfer recorded by staff) or through
-- a real gateway (PAYTABS/THAWANI). Same branch-scoping pattern as Batch
-- (direct branch_id column, not transitive) since a finance officer issues
-- an invoice from a specific branch and an invoice can exist with no
-- enrollment at all (a one-off charge).

-- --- Types -------------------------------------------------------------
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'SENT', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED');
CREATE TYPE "PaymentGateway" AS ENUM ('MANUAL', 'PAYTABS', 'THAWANI');
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED');

-- --- Tables --------------------------------------------------------------
CREATE TABLE "invoices" (
"id" TEXT NOT NULL,
"tenant_id" TEXT NOT NULL,
"branch_id" TEXT NOT NULL,
"student_id" TEXT NOT NULL,
"enrollment_id" TEXT,
"invoice_number" TEXT NOT NULL,
"currency" TEXT NOT NULL DEFAULT 'OMR',
"line_items" JSONB NOT NULL,
"subtotal" DECIMAL(10,2) NOT NULL,
"discount_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
"tax_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
"total_amount" DECIMAL(10,2) NOT NULL,
"status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
"issue_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
"due_date" TIMESTAMP(3),
"notes" TEXT,
"created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
"updated_at" TIMESTAMP(3) NOT NULL,

CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "invoices_tenant_id_invoice_number_key" ON "invoices"("tenant_id", "invoice_number");

CREATE INDEX "invoices_tenant_id_branch_id_idx" ON "invoices"("tenant_id", "branch_id");

CREATE INDEX "invoices_tenant_id_student_id_idx" ON "invoices"("tenant_id", "student_id");

CREATE INDEX "invoices_tenant_id_enrollment_id_idx" ON "invoices"("tenant_id", "enrollment_id");

CREATE TABLE "payments" (
"id" TEXT NOT NULL,
"tenant_id" TEXT NOT NULL,
"invoice_id" TEXT NOT NULL,
"amount" DECIMAL(10,2) NOT NULL,
"currency" TEXT NOT NULL DEFAULT 'OMR',
"gateway" "PaymentGateway" NOT NULL DEFAULT 'MANUAL',
"gateway_session_id" TEXT,
"gateway_txn_ref" TEXT,
"status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
"paid_at" TIMESTAMP(3),
"notes" TEXT,
"created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
"updated_at" TIMESTAMP(3) NOT NULL,

CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "payments_tenant_id_invoice_id_idx" ON "payments"("tenant_id", "invoice_id");

-- --- Foreign keys ----------------------------------------------------------
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_enrollment_id_fkey" FOREIGN KEY ("enrollment_id") REFERENCES "enrollments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "payments" ADD CONSTRAINT "payments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
