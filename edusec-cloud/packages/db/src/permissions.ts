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
 * As later phases add modules (Timetable, Finance, ...), extend this list
 * and re-run the seed — it is idempotent (upsert by code).
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

  // Programs catalog (bxbii Ecosystem brief — Programs module), backing the
  // public /programs page. Same view/manage split as Navigation, since a
  // Program has no nested sub-resource the way a Page has Sections.
  { module: "cms", action: "programs.view", code: "cms.programs.view" },
  { module: "cms", action: "programs.manage", code: "cms.programs.manage" },

  // Courses catalog (bxbii Ecosystem brief — Courses module), backing the
  // COURSES page-builder block. Same view/manage split as Programs — a
  // Course has no nested sub-resource either.
  { module: "cms", action: "courses.view", code: "cms.courses.view" },
  { module: "cms", action: "courses.manage", code: "cms.courses.manage" },

  // Contact submissions inbox (bxbii Ecosystem brief — Contact module),
  // fed by the public /contact-us page's form. Same view/manage split as
  // Programs/Navigation — a submission has no nested sub-resource either.
  { module: "cms", action: "contact.view", code: "cms.contact.view" },
  { module: "cms", action: "contact.manage", code: "cms.contact.manage" },

  // Partner logos (bxbii Ecosystem brief — Partners module), backing the
  // PARTNERS page-builder block. Same view/manage split as Programs/
  // Navigation/Contact — a partner has no nested sub-resource either.
  { module: "cms", action: "partners.view", code: "cms.partners.view" },
  { module: "cms", action: "partners.manage", code: "cms.partners.manage" },
];
