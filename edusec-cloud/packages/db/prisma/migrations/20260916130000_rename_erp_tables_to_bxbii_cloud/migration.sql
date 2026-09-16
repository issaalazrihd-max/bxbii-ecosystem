-- Rename the ERP extension tables to the product namespace.
-- The application module is branded bxbii Cloud; no external product name is used by the runtime.

ALTER TABLE IF EXISTS "vhetm_inquiries" RENAME TO "bxbii_cloud_inquiries";
ALTER TABLE IF EXISTS "vhetm_opportunities" RENAME TO "bxbii_cloud_opportunities";
ALTER TABLE IF EXISTS "vhetm_exam_schedules" RENAME TO "bxbii_cloud_exam_schedules";
ALTER TABLE IF EXISTS "vhetm_suppliers" RENAME TO "bxbii_cloud_suppliers";
ALTER TABLE IF EXISTS "vhetm_purchase_orders" RENAME TO "bxbii_cloud_purchase_orders";
ALTER TABLE IF EXISTS "vhetm_purchase_order_items" RENAME TO "bxbii_cloud_purchase_order_items";
ALTER TABLE IF EXISTS "vhetm_approval_workflows" RENAME TO "bxbii_cloud_approval_workflows";
ALTER TABLE IF EXISTS "vhetm_approval_steps" RENAME TO "bxbii_cloud_approval_steps";
ALTER TABLE IF EXISTS "vhetm_approval_requests" RENAME TO "bxbii_cloud_approval_requests";
ALTER TABLE IF EXISTS "vhetm_approval_actions" RENAME TO "bxbii_cloud_approval_actions";
ALTER TABLE IF EXISTS "vhetm_settings" RENAME TO "bxbii_cloud_settings";
