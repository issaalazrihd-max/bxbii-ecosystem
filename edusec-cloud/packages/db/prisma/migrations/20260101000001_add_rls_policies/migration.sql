-- EduSec Cloud — Row-Level Security (defense in depth).
--
-- Multi-Branch Architecture doc, Section 4.3: branch scoping is enforced
-- TWICE — once by the NestJS API layer (BranchScopeService, apps/api/src/
-- branch-scope/branch-scope.service.ts) and independently here, in the
-- database itself, so a bug in application code cannot leak another
-- branch's data.
--
-- The API sets three session variables (via `SET LOCAL`, inside the same
-- transaction as the query) before touching a branch-scoped table:
--   app.tenant_id        — the caller's tenant (always required)
--   app.branch_ids       — comma-separated branch ids the caller may see
--   app.is_head_office    — 'true' bypasses the branch_ids check entirely
--
-- This migration demonstrates the pattern on `students`, the module built
-- out in this scaffold (see packages/db/README.md "Applying this pattern to
-- new tables" for the two-line template every future branch-scoped table
-- follows — inventory_items, employees, and everything Phase 4+ adds).

ALTER TABLE "students" ENABLE ROW LEVEL SECURITY;

-- IMPORTANT: this must be ONE policy, not two. Multiple PERMISSIVE policies
-- on the same table+command are combined with OR (not AND) — an earlier
-- draft of this migration split tenant isolation and branch scoping into
-- separate CREATE POLICY statements and, when tested live against Postgres
-- (see packages/db/README.md), that OR-combination let a caller with the
-- WRONG tenant_id but is_head_office=true see every tenant's rows, because
-- the tenant check alone was enough to satisfy the OR. Keeping both
-- conditions in a single USING clause (AND'd together) is what makes tenant
-- isolation unconditional regardless of branch/head-office status.
CREATE POLICY "students_tenant_and_branch_scope" ON "students"
  USING (
    "tenant_id" = current_setting('app.tenant_id', true)
    AND (
      current_setting('app.is_head_office', true) = 'true'
      OR "current_branch_id" = ANY (
        string_to_array(current_setting('app.branch_ids', true), ',')
      )
    )
  );

-- Fail-closed by construction: current_setting(..., true) returns NULL when
-- a caller forgets to SET LOCAL app.tenant_id / app.branch_ids, and
-- "column = NULL" evaluates to NULL (not true) in the USING clause — so a
-- missing session variable denies every row rather than silently allowing
-- one. No extra default policy is needed to get that behavior.
