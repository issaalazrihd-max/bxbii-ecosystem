/**
 * The permission catalog for this foundation scaffold: one module.action
 * code per capability the API currently exposes (auth is implicit — every
 * authenticated route needs a valid JWT regardless of role).
 *
 * This mirrors the granularity of the legacy Yii "Rights" engine (Phase 1
 * Analysis, Section 2.7) — one entry per controller action — but unlike
 * that engine, this platform ships pre-built roles against this catalog
 * instead of leaving every install to build roles from a blank slate.
 *
 * As later phases add modules (Programs, Timetable, Finance, ...), extend
 * this list and re-run the seed — it is idempotent (upsert by code).
 */
export const PERMISSIONS: Array<{ module: string; action: string; code: string }> = [
  { module: "dashboard", action: "view", code: "dashboard.view" },

  { module: "branches", action: "list", code: "branches.list" },
  { module: "branches", action: "create", code: "branches.create" },

  { module: "students", action: "list", code: "students.list" },
  { module: "students", action: "view", code: "students.view" },
  { module: "students", action: "create", code: "students.create" },
  { module: "students", action: "transfer.request", code: "students.transfer.request" },
  { module: "students", action: "transfer.review", code: "students.transfer.review" },
  { module: "students", action: "transfer.approve", code: "students.transfer.approve" },

  // CMS & Page Builder (bxbii Ecosystem brief, Sections 29-31) — platform-
  // wide, not branch-scoped.
  { module: "cms", action: "pages.view", code: "cms.pages.view" },
  { module: "cms", action: "pages.create", code: "cms.pages.create" },
  { module: "cms", action: "pages.update", code: "cms.pages.update" },
  { module: "cms", action: "pages.delete", code: "cms.pages.delete" },
  { module: "cms", action: "navigation.view", code: "cms.navigation.view" },
  { module: "cms", action: "navigation.manage", code: "cms.navigation.manage" },
];
