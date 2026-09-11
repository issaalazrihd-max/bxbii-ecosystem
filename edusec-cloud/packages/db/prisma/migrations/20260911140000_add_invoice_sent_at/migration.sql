-- Adds Invoice.sentAt: records the last time an invoice was actually
-- emailed to its student as a payment notice (user request: invoices sent
-- via email with a PDF copy, and downloadable as PDF on demand). Purely
-- additive/nullable — no backfill needed, existing invoices simply have
-- never been emailed (sent_at IS NULL) until the feature is used.
ALTER TABLE "invoices" ADD COLUMN "sent_at" TIMESTAMP(3);
