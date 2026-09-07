-- Partners (bxbii Ecosystem brief — Partners module) — logos shown on the
-- PARTNERS page-builder block. Platform-wide like Page/NavigationItem/
-- Program above, not branch-scoped: the partner roster is one shared list
-- for the whole tenant. Modeled directly on Program's admin shape (position
-- + isVisible, same ordering/visibility semantics) since a partner has no
-- bilingual content of its own -- just a name, a logo, and an optional link.
-- --- Tables --------------------------------------------------------------
CREATE TABLE "partners" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo_url" TEXT NOT NULL,
    "website_url" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partners_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "partners_tenant_id_position_idx" ON "partners"("tenant_id", "position");

-- --- Foreign keys ----------------------------------------------------------
ALTER TABLE "partners" ADD CONSTRAINT "partners_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
