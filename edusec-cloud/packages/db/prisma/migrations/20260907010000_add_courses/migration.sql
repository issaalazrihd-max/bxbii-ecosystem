-- Courses (bxbii Ecosystem brief — Courses module) — individual course cards
-- shown on the COURSES page-builder block. Platform-wide like Page/
-- NavigationItem/Program above, not branch-scoped: the course catalog is one
-- shared list for the whole tenant. Modeled directly on Program's shape
-- (same OPEN/COMING_SOON two-tier status, position + isVisible ordering,
-- optional href_override to a dedicated page) minus Program's domain
-- grouping fields -- a Course is itself the flat, individual catalog item.
-- --- Types -----------------------------------------------------------------
CREATE TYPE "CourseStatus" AS ENUM ('OPEN', 'COMING_SOON');

-- --- Tables ------------------------------------------------------------
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "ar_title" TEXT NOT NULL,
    "en_title" TEXT NOT NULL,
    "ar_description" TEXT NOT NULL,
    "en_description" TEXT NOT NULL,
    "ar_duration" TEXT NOT NULL,
    "en_duration" TEXT NOT NULL,
    "ar_format" TEXT NOT NULL,
    "en_format" TEXT NOT NULL,
    "status" "CourseStatus" NOT NULL DEFAULT 'COMING_SOON',
    "href_override" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "courses_tenant_id_slug_key" ON "courses"("tenant_id", "slug");

CREATE INDEX "courses_tenant_id_position_idx" ON "courses"("tenant_id", "position");

-- --- Foreign keys ----------------------------------------------------------
ALTER TABLE "courses" ADD CONSTRAINT "courses_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
