-- Contact submissions for the public /contact-us page's CONTACT_FORM block
-- (bxbii Ecosystem brief — Contact module). Platform-wide, shared data — not
-- branch-scoped, matching the Page/NavigationItem/Program tables this
-- follows (Section 9.1's classification of website content as
-- institute-wide). Unlike programs, this is an inbox of citizen-submitted
-- rows rather than editorial content, so there is no is_visible/position —
-- just a status lifecycle (NEW -> READ -> ARCHIVED) and recency ordering.

-- --- Enums -------------------------------------------------------------

CREATE TYPE "ContactSubmissionStatus" AS ENUM ('NEW', 'READ', 'ARCHIVED');

-- --- Tables --------------------------------------------------------------

CREATE TABLE "contact_submissions" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "subject" TEXT,
    "message" TEXT NOT NULL,
    "status" "ContactSubmissionStatus" NOT NULL DEFAULT 'NEW',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "contact_submissions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "contact_submissions_tenant_id_status_idx" ON "contact_submissions"("tenant_id", "status");

CREATE INDEX "contact_submissions_tenant_id_created_at_idx" ON "contact_submissions"("tenant_id", "created_at");

-- --- Foreign keys ----------------------------------------------------------

ALTER TABLE "contact_submissions" ADD CONSTRAINT "contact_submissions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
