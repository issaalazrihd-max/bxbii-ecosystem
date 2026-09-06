import type { Metadata } from "next";
import { ProgramsPage } from "@/components/public/programs-page";
import { publicApi, type PublicProgram } from "@/lib/public-api";

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
 *
 * Task #44 (Programs module): the program cards used to be a hardcoded
 * array inside ProgramsPage. They now come from the CMS via
 * publicApi.getPrograms() — fetched here, server-side, the same pattern
 * PublicNav's items already follow — and mapped into ProgramsPage's
 * existing nested {en,ar} shape so that component's rendering logic (and
 * the page's visual output) didn't need to change at all.
 */
export const metadata: Metadata = {
  title: "البرامج التدريبية | bxbii",
  description:
    "استعرض برامج bxbii التدريبية في الأعمال والمالية والتقنية والقيادة — برامج عملية بالسرعة التي تناسبك، مع تدريب مؤسسي مخصص للفرق والمؤسسات.",
};

function toCardProgram(p: PublicProgram) {
  return {
    id: p.id,
    domain: { en: p.enDomain, ar: p.arDomain },
    name: { en: p.enName, ar: p.arName },
    description: { en: p.enDescription, ar: p.arDescription },
    duration: { en: p.enDuration, ar: p.arDuration },
    format: { en: p.enFormat, ar: p.arFormat },
    status: (p.status === "OPEN" ? "open" : "comingSoon") as "open" | "comingSoon",
    href: p.hrefOverride ?? undefined,
  };
}

export default async function Page() {
  const programs = await publicApi.getPrograms();
  return <ProgramsPage programs={(programs ?? []).map(toCardProgram)} />;
}
