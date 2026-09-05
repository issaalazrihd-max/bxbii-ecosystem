-- CMS & Page Builder + dynamic Navigation (bxbii Ecosystem brief, Sections
-- 2, 29-31). Platform-wide, shared data — not branch-scoped, matching
-- Section 9.1's classification of website content as institute-wide.

-- --- Enums -------------------------------------------------------------

CREATE TYPE "PageStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'HIDDEN');

CREATE TYPE "PageSectionType" AS ENUM (
  'HERO', 'HEADING', 'TEXT', 'IMAGE', 'VIDEO', 'BUTTON',
  'PRODUCTS', 'COURSES', 'PROJECTS', 'GALLERY', 'TEAM', 'PARTNERS',
  'CONTACT_FORM', 'FILES', 'PDF', 'CUSTOM'
);

CREATE TYPE "NavigationLinkType" AS ENUM ('PAGE', 'EXTERNAL_URL', 'COURSE', 'PROJECT', 'PRODUCT');

-- --- Tables --------------------------------------------------------------

CREATE TABLE "pages" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "ar_title" TEXT NOT NULL,
    "en_title" TEXT NOT NULL,
    "status" "PageStatus" NOT NULL DEFAULT 'DRAFT',
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "pages_tenant_id_slug_key" ON "pages"("tenant_id", "slug");

CREATE TABLE "page_sections" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "page_id" TEXT NOT NULL,
    "section_type" "PageSectionType" NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "ar_content" JSONB NOT NULL DEFAULT '{}',
    "en_content" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "page_sections_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "page_sections_page_id_position_idx" ON "page_sections"("page_id", "position");

CREATE TABLE "navigation_items" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "ar_label" TEXT NOT NULL,
    "en_label" TEXT NOT NULL,
    "link_type" "NavigationLinkType" NOT NULL,
    "target_page_id" TEXT,
    "external_url" TEXT,
    "open_in_new_tab" BOOLEAN NOT NULL DEFAULT false,
    "parent_id" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "navigation_items_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "navigation_items_tenant_id_parent_id_position_idx" ON "navigation_items"("tenant_id", "parent_id", "position");

-- --- Foreign keys ----------------------------------------------------------

ALTER TABLE "pages" ADD CONSTRAINT "pages_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "pages" ADD CONSTRAINT "pages_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "page_sections" ADD CONSTRAINT "page_sections_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "navigation_items" ADD CONSTRAINT "navigation_items_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "navigation_items" ADD CONSTRAINT "navigation_items_target_page_id_fkey" FOREIGN KEY ("target_page_id") REFERENCES "pages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "navigation_items" ADD CONSTRAINT "navigation_items_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "navigation_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;
