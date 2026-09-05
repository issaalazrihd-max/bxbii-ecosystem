# bxbii Digital Business Ecosystem (built on the EduSec Cloud foundation)

This repo is now the foundation of the **bxbii Digital Business Ecosystem** —
the unified platform update described in the bxbii Ecosystem brief (Home/CMS,
unified auth, Roles & Permissions, Institute Management, e-commerce Store,
Technology/Other Projects, full AR/EN bilingual support, a Page Builder CMS,
dynamic Navigation, and a central admin dashboard). Per the user's explicit
instruction, **bxbii** is the platform brand and **Miran Studio** stays the
brand specifically for Training — nothing here renames either. **EduSec
Cloud is not a separate product**: its multi-branch data model, auth, and
RBAC engine (documented below, unchanged) *are* this ecosystem's Institute
Management module — everything from "## Repo layout" through "## Multi-
tenant readiness" describes that foundation as originally built. The bxbii-
specific additions (public website, CMS/Page Builder, dynamic Navigation)
are documented in **"Phase 2 Extension — bxbii Public Website, CMS &
Navigation"** near the end of this file; read that section first if you're
looking for the ecosystem work rather than the institute-management
foundation it sits on.

Companion documents (produced earlier in this project):
- **EduSec Cloud — Phase 1 Analysis & Architecture Roadmap**
- **EduSec Cloud — Multi-Branch Data Architecture & Transfer Workflows**
- **bxbii Ecosystem — Phase 1 Analysis & Update, Don't Rebuild Plan**

Every design decision below cites the section of one of those documents it
implements.

## Repo layout

```
apps/
  api/            NestJS backend (auth, RBAC, branch scoping, branches, students, cms)
  web/            Next.js frontend: public bxbii site ("/", (public)/[slug]) +
                   admin dashboard shell (login, branches, students, cms/pages, cms/navigation)
packages/
  db/             Prisma schema, migrations, seed script, role/permission catalog
```

## How this was built and verified — please read this before running it

This scaffold was generated in a sandboxed session whose network policy
**blocked the npm registry, PyPI, and apt entirely** for that session (every
request came back `403 host_not_allowed` from the sandbox's own egress
proxy — not a registry-side problem). That meant `pnpm install` could not
run, so the Prisma CLI, NestJS, Next.js, and every other dependency could
not be installed or executed in that environment. This is disclosed here
rather than glossed over because it changes what "verified" means for this
delivery:

**What was NOT possible in that sandbox, and is still untested:**
- Running `pnpm install`, `nest start`, or `next dev`.
- Generating the actual Prisma Client or running `prisma migrate dev`.
- Booting the API or web app, or exercising the HTTP endpoints.

**What WAS actually done and verified, for real, against a live database:**
- A local PostgreSQL 16 server was started in the sandbox and the two
  migrations in `packages/db/prisma/migrations/` (hand-derived line-by-line
  from `schema.prisma`, since the Prisma CLI itself couldn't run) were
  applied with plain `psql` — they ran cleanly with no errors.
- The Row-Level Security policy on `students` was then tested with real
  queries under a non-superuser role (table owners bypass RLS by default,
  so a separate low-privilege role was created specifically to exercise it)
  and seeded data across four branches. **This caught a real bug**: the
  first version of the policy split tenant isolation and branch scoping
  into two separate `CREATE POLICY` statements. PostgreSQL combines multiple
  `PERMISSIVE` policies on the same table with `OR`, not `AND` — so a
  caller from the wrong tenant with `is_head_office=true` could see every
  tenant's rows, because the tenant-isolation policy alone wasn't enough to
  block them once the branch policy said yes. The fix (one policy, both
  conditions `AND`ed together) was written, re-applied, and re-tested:

  | Scenario | Expected | Before fix | After fix |
  |---|---|---|---|
  | Muscat branch-private user | sees only Muscat's 2 students | saw all 4 | **2** ✓ |
  | Head Office user | sees all 4 | saw all 4 | **4** ✓ |
  | Cross-branch grant for Muscat+Sohar only | sees 3 (not Salalah) | saw all 4 | **3** ✓ |
  | No session variables set at all | sees 0 (fail closed) | 0 | **0** ✓ |
  | Wrong tenant, `is_head_office=true` | sees 0 | saw all 4 | **0** ✓ |

  `packages/db/README.md` has the reusable policy template with this
  gotcha called out, so the same mistake doesn't get repeated on the next
  branch-scoped table.
- Every TypeScript file in `apps/api` and `apps/web` was run through `tsc`
  in syntax-checking mode. Since dependencies aren't installed, this
  reports many expected "cannot find module" errors — those were filtered
  out and the remaining output was inspected by hand; no real syntax errors
  turned up.

**Bottom line:** the data model and the single riskiest piece of the design
— branch-scoped Row-Level Security — are proven against a real database,
bug found and fixed in the process. The application code (NestJS/Next.js)
is complete and carefully written but has not been executed. Run it in an
environment with normal registry access and treat the first `pnpm install`
+ boot as the next verification step, not a formality.

## Getting it running (in an environment with network access)

```bash
cp .env.example .env          # then edit DATABASE_URL, JWT secrets, etc.
pnpm install
pnpm db:generate
pnpm db:migrate:deploy        # applies the two migrations described above
pnpm db:seed                  # seeds tenant, 4 branches, roles, permissions, super admin,
                               # the bxbii home page + 7 stub pages, and default navigation
pnpm dev:api                  # http://localhost:4000/api/v1
pnpm dev:web                  # http://localhost:3000 — the public bxbii site (staff sign in at /login)
```

Default super admin after seeding: `admin@edusec.local` / `ChangeMe123!` —
change this immediately in any real deployment; it exists only so there is
somewhere to log in from on a fresh install.

Or with Docker (`docker-compose.yml` starts Postgres + API + web):

```bash
docker compose up --build
```

## What's implemented

- **Auth** (`apps/api/src/auth`): email/password login, argon2id password
  hashing, short-lived JWT access tokens, opaque rotating refresh tokens
  (HMAC-SHA256'd before storage so a stolen database dump doesn't hand over
  usable tokens), logout/revocation. Matches the security architecture in
  Phase 1 Analysis, Section 4.5.
- **RBAC** (`apps/api/src/rbac`): a `@RequirePermissions(...)` decorator and
  guard checking module.action permission codes, backed by 13 pre-built
  role templates (`packages/db/src/roles.ts`) — Section 43 of the brief.
  Unlike the legacy Yii "Rights" engine analyzed in Phase 1 (Section 2.7),
  which shipped with zero seeded roles, these ship ready to use.
- **Branch scoping** (`apps/api/src/branch-scope`): `BranchScopeService`
  resolves a user's effective access (Branch Private / Cross-Branch View /
  Cross-Branch Edit / Head Office) and builds Prisma filters from it — the
  API-layer half of the defense-in-depth design in the Multi-Branch doc,
  Section 4.3. `CrossBranchLogService` logs every boundary crossing
  (Section 12).
- **Branches** (`apps/api/src/branches`): list/create — shared/global data
  per Section 9.1, visible to everyone, gated by permission for writes.
- **Students** (`apps/api/src/students`): the full vertical slice —
  - unified institute-wide identity with `primaryBranchId`/`currentBranchId`
    (Section 5.1, resolving the legacy `student_info`/`student_registration_info`
    duplication flagged in Phase 1 Analysis, Section 2.6)
  - global search scoped to the caller's branch access (Section 5.2)
  - the **complete transfer workflow**: request → current-branch review →
    receiving-branch review (with the Section 6.4 academic validation
    checklist) → approval → completion, which atomically moves the student,
    closes/opens `student_branch_history` rows, and writes the immutable
    `student_transfer_history` record (Section 6.5) — plus all three
    configurable financial transfer policies (Section 6.3).
- **Design system** (`apps/web/src/components/ui`, `tailwind.config.ts`):
  a small token set (brand navy, accent teal, status colors) and a handful
  of primitives (Button, Card, Badge) — deliberately minimal; extend as
  real screens demand it rather than building out a component library
  speculatively.
- **Frontend shell** (`apps/web/src/app`): login page wired to the API,
  collapsible sidebar + top nav with global search input (Section 3),
  a dashboard shell with placeholder widgets, a branches list, and a
  students search/list page.

## What's deliberately not here yet

Everything in Phases 4 through 8 of the roadmap: Admissions/CRM beyond the
transfer workflow, Programs & Courses, Timetable, Exams & Assessments,
Certificates, the full Accounting/GL, HR & Payroll, Inventory (the schema
and transfer-workflow *shape* exist — `InventoryItem`/`InventoryTransfer` —
but no API/UI yet), Procurement, Assets, Facilities & Hall Booking, Camera/
Security monitoring, and the offline/sync client. Building these against
this foundation — reusing `BranchScopeService`, the permission catalog, and
the RLS pattern — is the next phase of work.

## Multi-tenant readiness

Every tenant-scoped table already carries a `tenant_id`; it's fixed to one
value (`DEFAULT_TENANT_ID` in `.env`) for this v1. Turning on multi-tenant
SaaS later (Multi-Branch doc, Section 13) means allowing more than one
tenant value and adding a provisioning/billing layer — not touching a single
table's structure or the access-control code, which already filters by
tenant everywhere (including in the RLS policy, per the bug/fix above).

## Phase 2 Extension — bxbii Public Website, CMS & Navigation

This is the unified platform shell recommended in the bxbii Ecosystem Phase 1
Analysis's "Recommended Next Step": the existing EduSec Cloud monorepo above,
extended with a public website, a Shopify-style Page Builder CMS, and fully
dynamic Navigation — all still running on the same unified login and RBAC
already built (bxbii brief Sections 28-31).

### What was added

- **Data model** (`packages/db/prisma/schema.prisma`): `Page` (slug-addressed,
  `DRAFT`/`PUBLISHED`/`HIDDEN`, `isSystem` protects Home from deletion),
  `PageSection` (16-type block palette — Hero, Heading, Text, Image, Video,
  Button, Products, Courses, Projects, Gallery, Team, Partners, Contact Form,
  Files, PDF, Custom — with `position` ordering and an `isVisible` toggle),
  and `NavigationItem` (self-referencing `parentId` for one level of submenu,
  `linkType` of `PAGE`/`EXTERNAL_URL` wired now, `COURSE`/`PROJECT`/`PRODUCT`
  reserved for the Store/LMS/Projects modules). Every title/label/content
  field is bilingual — parallel `ar*`/`en*` fields, per Section 28, not one
  localized blob. Migration:
  `packages/db/prisma/migrations/20260201000000_add_cms_navigation/`.
- **Permissions & roles** (`packages/db/src/permissions.ts`, `roles.ts`): six
  new `cms.*` permission codes, granted to `SUPER_ADMIN` fully and to
  `INSTITUTE_ADMIN` as view-only; six new role templates matching the
  brief's role list (`PLATFORM_ADMIN`, `TRAINING_MANAGER`, `INSTRUCTOR`,
  `EMPLOYEE`, `PARTNER`, `CUSTOMER` — `INSTITUTE_ADMIN`, `BRANCH_MANAGER`,
  `ACADEMIC_MANAGER`, `FINANCE_OFFICER`, `ADMISSIONS_OFFICER`, `STUDENT` were
  already covered by the original EduSec role set).
- **API** (`apps/api/src/cms`): `PagesService`/`PagesController` (CRUD on
  pages and their sections, plus transactional section reordering) and
  `NavigationService`/`NavigationController` (CRUD, reorder, tree assembly)
  behind the new `cms.pages.*`/`cms.navigation.*` permissions — and a
  `PublicSiteController` with three `@Public()` routes
  (`/public/pages/home`, `/public/pages/:slug`, `/public/navigation`) that
  the website itself reads from with no auth, exactly like `/auth/login`.
  Multi-tenancy is fixed to one row in v1 (see the `Tenant` model comment),
  so these public routes resolve "the" tenant directly rather than reading
  it from a request that has no logged-in user to carry one.
- **Public website** (`apps/web/src/app/page.tsx`, `(public)/[slug]/page.tsx`,
  `components/public/*`): the root `/` route is now the dynamic, CMS-driven
  bxbii home page — it no longer redirects to `/login`. Any page created in
  the admin Page Builder is automatically reachable at `/<slug>`, no route
  code to add. A `SectionRenderer` renders all 16 block types from the
  palette; Products/Courses/Projects render an honest "coming soon" panel
  until the Store/LMS/Projects modules exist to back them with real data,
  rather than faking content. Navigation is 100% data-driven from
  `/public/navigation` — nothing is hard-coded. A `LanguageProvider` gives
  the whole public site an AR/EN toggle with RTL/LTR switching (Section 33);
  it's a foundation-level implementation (parallel content fields + a
  client-side toggle), not the final full i18n system.
- **Admin UI** (`apps/web/src/app/(dashboard)/cms/*`): a Pages list + editor
  (page metadata, add/reorder/hide/delete sections, per-block-type bilingual
  content forms — the four list-shaped blocks, Gallery/Team/Partners/Files,
  use a JSON editor rather than a hand-built repeater UI, a deliberate Phase
  2 scope cut) and a Navigation manager (add/edit/delete/reorder, one level
  of submenu, link to a page or an external URL).
- **Seed data** (`packages/db/src/seed.ts`): the Home page (Hero + intro
  Text), seven stub pages (About Us, Contact Us, Training — kept under the
  **Miran Studio** name per the user's explicit instruction, Study, Store,
  Technology Projects, Other Projects), and a matching nine-item navigation
  tree with Technology/Other Projects grouped under a "Projects" submenu —
  so `pnpm db:seed` leaves a live, navigable (if placeholder-content) site
  rather than an empty shell.

### How this piece was verified

The same sandbox network restriction described above still applied (no
registry access, so no `@prisma/client`, no Next.js/React packages
installed), so verification followed the same pivot as the original Phase 2
build, extended with one more technique:

- The new migration SQL was hand-derived and applied with plain `psql`
  against a live local PostgreSQL 16 instance — clean, no errors (verified
  via `\d pages`, `\d page_sections`, `\d navigation_items`).
- Every new/changed TypeScript file (API and web) was run through `tsc` in
  syntax-checking mode. This surfaced one real bug — a JSDoc comment
  containing `*/` mid-sentence, which prematurely closed the comment block
  in `apps/web/src/lib/i18n.ts` and cascaded into dozens of parse errors —
  caught and fixed before delivery. Every other diagnostic traced to the
  environment (unresolvable `@edusec/db`/`class-validator`/`react`/`next`
  imports, and their cascading "implicitly has an `any` type" / "Property
  does not exist" / missing-`JSX.IntrinsicElements` follow-on errors); the
  same categories appear identically on untouched, previously-working files
  in this repo, confirming they're environmental rather than introduced
  here.
- **New for this piece**: since the actual Prisma Client can't run in this
  sandbox, `seed.ts`'s new CMS-seeding logic was translated into equivalent
  raw SQL and executed inside a rolled-back transaction against the live
  Postgres instance above. This confirmed the home page's sections come
  back in position order, the nav tree's parent/child grouping and
  ordering match what `NavigationService.buildTree` expects, the
  `tenant_id + slug` uniqueness constraint holds across all 8 seeded pages,
  and every `navigation_items.target_page_id` resolves to a real page (zero
  orphaned foreign keys) — then rolled back, leaving the database
  untouched.

**Still genuinely untested, same as the original Phase 2 build:** actually
running `pnpm install`, generating the Prisma Client, booting the API and
Next.js dev servers, and clicking through the admin CMS/Navigation UI and
the resulting public pages in a browser. Treat that as the next
verification step in an environment with normal network access, not a
formality — this is application code that has been carefully written and
checked for internal consistency, not code that has been run.

### What's deliberately not here yet (this piece)

- A working Contact Form submission endpoint (the block renders a real form
  UI; submitting it shows a client-side confirmation only — there's no
  backend Contact/Lead API yet).
- Proper repeater UIs for Gallery/Team/Partners/Files (JSON editor instead,
  see above).
- Everything the Products/Courses/Projects blocks are placeholders for: the
  e-commerce Store, the LMS/Courses module, and a real Projects module —
  each is its own phase per the bxbii Ecosystem Phase 1 Analysis's roadmap.
- Deeper-than-one-level navigation nesting (the schema's self-referencing
  `parentId` would technically allow it; the admin UI and public nav both
  intentionally cap at one level of submenu, matching what actually renders).
