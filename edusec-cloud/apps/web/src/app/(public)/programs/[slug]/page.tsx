import { notFound } from "next/navigation";
import Link from "next/link";
import { publicApi } from "@/lib/public-api";
import { catalogPrograms } from "@/lib/site-catalog";

export async function generateStaticParams() {
  const remote = (await publicApi.getPrograms()) ?? [];
  return [...new Set([...remote.map((p) => p.slug), ...catalogPrograms.map((p) => p.slug)])].map((slug) => ({ slug }));
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

  return <main className="min-h-screen bg-[#f7f8fa] text-slate-900">
    <section className="relative overflow-hidden bg-[#07111d] py-24 text-white sm:py-32"><div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(0,194,218,.22),transparent_30%),radial-gradient(circle_at_12%_82%,rgba(255,83,109,.15),transparent_30%)]"/><div className="relative mx-auto max-w-5xl px-5 sm:px-8">
      <Link href="/programs" className="text-sm font-bold text-cyan-200 hover:text-white">← Programs / البرامج</Link>
      <span className="mt-10 block text-[10px] font-black uppercase tracking-[.24em] text-cyan-200">{domainEn} / {domainAr}</span>
      <h1 className="mt-5 text-5xl font-black tracking-[-.06em] sm:text-7xl">{nameEn}</h1><h2 className="mt-3 text-2xl font-bold text-white/70" dir="rtl">{nameAr}</h2>
      <p className="mt-6 max-w-3xl text-lg leading-8 text-white/55">{descriptionEn}</p><p className="mt-2 max-w-3xl text-lg leading-8 text-white/55" dir="rtl">{descriptionAr}</p>
      <div className="mt-8 flex flex-wrap gap-3"><span className="rounded-xl bg-white/10 px-4 py-2 text-sm">{durationEn} / {durationAr}</span><span className="rounded-xl bg-white/10 px-4 py-2 text-sm">{formatEn} / {formatAr}</span><span className="rounded-xl bg-white/10 px-4 py-2 text-sm">{isOpen?"Open / متاح":"Coming soon / قريبًا"}</span></div>
    </div></section>

    <section className="py-16 sm:py-20"><div className="mx-auto max-w-5xl px-5 sm:px-8"><div className="grid gap-5 md:grid-cols-3">
      {[['01','Practical','Practical learning, activities and applied work designed around the program'],['02','Bilingual','Program information is available in Arabic and English'],['03','Industry','Built around practical technology and workplace capability']].map(([n,title,text],i)=><div key={n} className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm`}><div className={`h-2 bg-gradient-to-r ${['from-[#00b8d9] to-[#18324a]','from-[#ff536d] to-[#35215c]','from-[#20c997] to-[#123e43]'][i]}`}/><div className="p-7"><b>{n} · {title}</b><p className="mt-3 text-sm leading-6 text-slate-500">{text}</p></div></div>)}
    </div><div className="mt-12 rounded-3xl bg-[#07111d] p-8 text-center text-white sm:p-12"><span className="text-[10px] font-black uppercase tracking-[.24em] text-cyan-200">BXBII TRAINING</span><h2 className="mt-4 text-3xl font-black sm:text-4xl">{nameEn}</h2><p className="mt-3 text-white/50">{nameAr} · {durationEn}</p><Link href={isOpen?"/contact-us#contact-form":"/contact-us?subject=program-interest#contact-form"} className="mt-7 inline-flex rounded-xl bg-white px-7 py-4 font-black text-[#07111d] transition hover:bg-cyan-100">{isOpen?"Register interest / سجّل اهتمامك":"Register interest / أبدِ اهتمامك"}</Link></div></div></section>
  </main>;
}
