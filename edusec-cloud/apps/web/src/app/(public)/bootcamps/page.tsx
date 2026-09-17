import type { Metadata } from "next";
import { ProgramsPage } from "@/components/public/programs-page";
import { publicApi } from "@/lib/public-api";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "المعسكرات | BXBII",
  description: "معسكرات BXBII المكثفة في الذكاء الاصطناعي الفيزيائي وتصميم وتغليف أشباه الموصلات.",
};

export default async function Page() {
  const remote = (await publicApi.getPrograms()) ?? [];
  const bootcamps = remote.filter((p) => /bootcamp|معسكر/i.test(`${p.enFormat} ${p.arFormat}`));
  const programs = bootcamps.map((p) => ({
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
