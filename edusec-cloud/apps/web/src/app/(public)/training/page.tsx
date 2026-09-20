import type { Metadata } from "next";
import { ProgramsPage } from "@/components/public/programs-page";
import { publicApi } from "@/lib/public-api";

export const metadata: Metadata = {
  title: "Training | bxbii",
  description: "Professional training programs and practical learning opportunities from bxbii.",
};

export default async function TrainingPage() {
  const remote = (await publicApi.getPrograms()) ?? [];
  const programs = remote.map((p) => ({
    id: p.id,
    domain: { en: p.enDomain, ar: p.arDomain },
    name: { en: p.enName, ar: p.arName },
    description: { en: p.enDescription, ar: p.arDescription },
    duration: { en: p.enDuration, ar: p.arDuration },
    format: { en: p.enFormat, ar: p.arFormat },
    status: (p.status === "OPEN" ? "open" : "comingSoon") as "open" | "comingSoon",
    href: p.hrefOverride ?? `/programs/${p.slug}`,
  }));

  return <ProgramsPage programs={programs} />;
}
