import type { Metadata } from "next";
import { ProgramsPage } from "@/components/public/programs-page";

/**
 * Dedicated static route for /programs (Tuwaiq-inspired redesign, phase 1).
 *
 * Mirrors the /training route: sits as a literal sibling of the [slug]
 * catch-all so Next.js resolves an exact "/programs" request here instead
 * of falling through to the generic CMS page lookup. A CMS Page record
 * with slug "programs" still exists so it can be linked from the
 * dynamic navigation menu (brief Section 31) — this route wins over that
 * CMS page's own content for the actual rendered page, exactly like
 * /training does today.
 */
export const metadata: Metadata = {
  title: "البرامج التدريبية | bxbii",
  description:
    "استعرض برامج bxbii التدريبية في الأعمال والمالية والتقنية والقيادة — برامج عملية بالسرعة التي تناسبك، مع تدريب مؤسسي مخصص للفرق والمؤسسات.",
};

export default function Page() {
  return <ProgramsPage />;
}
