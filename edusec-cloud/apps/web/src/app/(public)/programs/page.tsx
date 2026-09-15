import type { Metadata } from "next";
import { ProgramsPage } from "@/components/public/programs-page";
import { publicApi, type PublicProgram } from "@/lib/public-api";
import { catalogPrograms } from "@/lib/site-catalog";

export const metadata: Metadata = { title: "البرامج والمعسكرات | bxbii", description: "برامج ومعسكرات bxbii العملية في التقنية والبيانات والأعمال والمهارات الرقمية." };
function mapProgram(p: PublicProgram) { return { id: p.id, domain: { en: p.enDomain, ar: p.arDomain }, name: { en: p.enName, ar: p.arName }, description: { en: p.enDescription, ar: p.arDescription }, duration: { en: p.enDuration, ar: p.arDuration }, format: { en: p.enFormat, ar: p.arFormat }, status: (p.status === "OPEN" ? "open" : "comingSoon") as "open" | "comingSoon", href: p.hrefOverride ?? `/programs/${p.slug}` }; }
export default async function Page() {
  const cms = (await publicApi.getPrograms()).map(mapProgram);
  const catalog = catalogPrograms.map((p) => ({ id: `catalog-${p.slug}`, domain: p.domain, name: p.name, description: p.description, duration: p.duration, format: p.level, status: "open" as const, href: `/programs/${p.slug}` }));
  const seen = new Set(cms.map((p) => p.id));
  return <ProgramsPage programs={[...cms, ...catalog.filter((p) => !seen.has(p.id))]} />;
}
