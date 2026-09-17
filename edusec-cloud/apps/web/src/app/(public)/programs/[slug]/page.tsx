import { notFound } from "next/navigation";
import Link from "next/link";
import { publicApi } from "@/lib/public-api";
import { catalogPrograms } from "@/lib/site-catalog";

export async function generateStaticParams() {
  const remote = (await publicApi.getPrograms()) ?? [];
  const remoteSlugs = remote.map((p) => p.slug);
  const localSlugs = catalogPrograms.map((p) => p.slug);
  return [...new Set([...remoteSlugs, ...localSlugs])].map((slug) => ({ slug }));
}

export const dynamicParams = true;

export default async function Page({ params }: { params: { slug: string } }) {
  const remote = (await publicApi.getPrograms()) ?? [];
  const remoteProgram = remote.find((x) => x.slug === params.slug);
  const localProgram = catalogPrograms.find((x) => x.slug === params.slug);

  if (!remoteProgram && !localProgram) notFound();

  const nameEn = remoteProgram?.enName ?? localProgram!.name.en;
  const nameAr = remoteProgram?.arName ?? localProgram!.name.ar;
  const descriptionEn = remoteProgram?.enDescription ?? localProgram!.description.en;
  const descriptionAr = remoteProgram?.arDescription ?? localProgram!.description.ar;
  const durationEn = remoteProgram?.enDuration ?? localProgram!.duration.en;
  const durationAr = remoteProgram?.arDuration ?? localProgram!.duration.ar;
  const formatEn = remoteProgram?.enFormat ?? localProgram!.type.en;
  const formatAr = remoteProgram?.arFormat ?? localProgram!.type.ar;
  const domainEn = remoteProgram?.enDomain ?? localProgram!.domain.en;
  const domainAr = remoteProgram?.arDomain ?? localProgram!.domain.ar;
  const isOpen = remoteProgram ? remoteProgram.status === "OPEN" : true;

  return (
    <main className="bg-white">
      <section className="bg-[#08172e] py-24 text-white">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <Link href="/programs" className="text-sm font-bold text-blue-300 hover:text-white">
            ← Programs / البرامج
          </Link>
          <span className="mt-10 block text-xs font-black uppercase tracking-[.18em] text-blue-300">
            {domainEn} / {domainAr}
          </span>
          <h1 className="mt-4 text-5xl font-black tracking-tight">{nameEn}</h1>
          <h2 className="mt-3 text-2xl font-bold text-white/80" dir="rtl">{nameAr}</h2>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/65">{descriptionEn}</p>
          <p className="mt-2 max-w-3xl text-lg leading-8 text-white/65" dir="rtl">{descriptionAr}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <span className="rounded-full bg-white/10 px-4 py-2 text-sm">{durationEn} / {durationAr}</span>
            <span className="rounded-full bg-white/10 px-4 py-2 text-sm">{formatEn} / {formatAr}</span>
            <span className="rounded-full bg-white/10 px-4 py-2 text-sm">{isOpen ? "Open / متاح" : "Coming soon / قريبًا"}</span>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="grid gap-5 md:grid-cols-3">
            <div className="rounded-3xl border border-slate-200 p-7">
              <b>01 · Practical</b>
              <p className="mt-3 text-sm leading-6 text-slate-500">Practical learning, activities and applied work designed around the program</p>
            </div>
            <div className="rounded-3xl border border-slate-200 p-7">
              <b>02 · Bilingual</b>
              <p className="mt-3 text-sm leading-6 text-slate-500">Program information is available in Arabic and English</p>
            </div>
            <div className="rounded-3xl border border-slate-200 p-7">
              <b>03 · Industry</b>
              <p className="mt-3 text-sm leading-6 text-slate-500">Built around practical technology and workplace capability</p>
            </div>
          </div>

          <div className="mt-12 rounded-3xl bg-slate-50 p-8 text-center">
            <h2 className="text-3xl font-black">{nameEn}</h2>
            <p className="mt-3 text-slate-500">{nameAr} · {durationEn}</p>
            <Link
              href={isOpen ? "/contact-us" : "/contact-us?subject=program-interest"}
              className="mt-6 inline-flex rounded-full bg-accent px-7 py-3 font-black text-white"
            >
              {isOpen ? "Register interest / سجّل اهتمامك" : "Register interest / أبدِ اهتمامك"}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
