-- Programs catalog for the public /programs page (bxbii Ecosystem brief —
-- Programs module). Platform-wide, shared data — not branch-scoped, matching
-- the Page/NavigationItem tables this follows (Section 9.1's classification
-- of website content as institute-wide).

-- --- Enums -------------------------------------------------------------

CREATE TYPE "ProgramStatus" AS ENUM ('OPEN', 'COMING_SOON');

-- --- Tables --------------------------------------------------------------

CREATE TABLE "programs" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "ar_domain" TEXT NOT NULL,
    "en_domain" TEXT NOT NULL,
    "ar_name" TEXT NOT NULL,
    "en_name" TEXT NOT NULL,
    "ar_description" TEXT NOT NULL,
    "en_description" TEXT NOT NULL,
    "ar_duration" TEXT NOT NULL,
    "en_duration" TEXT NOT NULL,
    "ar_format" TEXT NOT NULL,
    "en_format" TEXT NOT NULL,
    "status" "ProgramStatus" NOT NULL DEFAULT 'COMING_SOON',
    "href_override" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "programs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "programs_tenant_id_slug_key" ON "programs"("tenant_id", "slug");

CREATE INDEX "programs_tenant_id_position_idx" ON "programs"("tenant_id", "position");

-- --- Foreign keys ----------------------------------------------------------

ALTER TABLE "programs" ADD CONSTRAINT "programs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
