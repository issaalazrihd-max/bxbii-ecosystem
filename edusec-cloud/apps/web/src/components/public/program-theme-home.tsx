"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { publicApi, type PublicProgram } from "@/lib/public-api";
import { useLanguage } from "./language-provider";

const focus = [
  ["Technology","التكنولوجيا","Semiconductors, embedded systems, IoT and robotics.","أشباه الموصلات والأنظمة المدمجة وإنترنت الأشياء والروبوتات.","/technology","from-[#101827] via-[#18324a] to-[#00b8d9]"],
  ["Solutions","الحلول","Inspection, monitoring, safety and predictive operations.","التفتيش والمراقبة والسلامة والتشغيل التنبؤي.","/solutions","from-[#20122f] via-[#35215c] to-[#ff536d]"],
  ["Industries","القطاعات","Oil & gas, mining, manufacturing, energy and infrastructure.","النفط والغاز والتعدين والتصنيع والطاقة والبنية الأساسية.","/industries","from-[#071b1d] via-[#123e43] to-[#20c997]"],
  ["R&D","البحث والتطوير","Applied AI, edge intelligence, robotics and prototyping.","الذكاء الاصطناعي التطبيقي والحوسبة الطرفية والروبوتات والنمذجة.","/rd","from-[#111827] via-[#1e3a5f] to-[#38bdf8]"],
];

export function ProgramThemeHome(){
  const {lang}=useLanguage(); const ar=lang==="ar"; const [programs,setPrograms]=useState<PublicProgram[]>([]);
  const t=(e:string,a:string)=>ar?a:e;
  useEffect(()=>{publicApi.getPrograms().then(r=>setPrograms(r??[])).catch(()=>setPrograms([]));},[]);
  return <main className="min-h-screen bg-[#f7f8fa] text-slate-900">
    <section className="relative overflow-hidden bg-[#07111d] py-24 text-white sm:py-36">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(0,194,218,.24),transparent_30%),radial-gradient(circle_at_12%_82%,rgba(255,83,109,.16),transparent_30%)]" />
      <div className={`relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 ${ar?"text-right":""}`}>
        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[.28em] text-cyan-200"><span>BXBII</span><span className="h-px w-8 bg-white/30"/><span>{t("Technology · Industry · Training","التكنولوجيا · الصناعة · التدريب")}</span></div>
        <h1 className="mt-6 max-w-5xl text-5xl font-black tracking-[-.06em] sm:text-7xl lg:text-[88px]">{t("Build. Connect. Apply.","نبني. نربط. نطبّق.")}</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-white/55">{t("A deep-tech ecosystem connecting advanced technology, industrial solutions, R&D and professional capability building from Oman to the world.","منظومة تقنية عميقة تربط التكنولوجيا المتقدمة والحلول الصناعية والبحث والتطوير وبناء القدرات المهنية من عُمان إلى العالم.")}</p>
        <div className={`mt-8 flex flex-wrap gap-3 ${ar?"justify-end":""}`}><Link href="/technology" className="rounded-xl bg-white px-6 py-4 text-sm font-black text-[#07111d] transition hover:bg-cyan-100">{t("Explore technology","استكشف التكنولوجيا")} {ar?"←":"→"}</Link><Link href="/programs" className="rounded-xl border border-white/20 px-6 py-4 text-sm font-black text-white transition hover:bg-white/10">{t("Training programs","البرامج التدريبية")}</Link></div>
      </div>
    </section>

    <section className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur"><div className={`mx-auto flex max-w-7xl gap-2 overflow-x-auto px-5 py-3 sm:px-8 lg:px-10 ${ar?"flex-row-reverse":""}`}>
      {[['/technology',t('Technology','التكنولوجيا')],['/solutions',t('Solutions','الحلول')],['/industries',t('Industries','القطاعات')],['/rd',t('R&D','البحث والتطوير')],['/programs',t('Training','التدريب')],['/about-us',t('About','من نحن')],['/contact-us',t('Contact','تواصل')]].map(([href,label])=><Link key={href} href={href} className="whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-black text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">{label}</Link>)}
    </div></section>

    <section className="py-14 sm:py-20"><div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10"><div className={`mb-8 ${ar?"text-right":""}`}><span className="text-[10px] font-black uppercase tracking-[.24em] text-red-500">01 / {t("What we do","ماذا نقدم")}</span><h2 className="mt-3 text-3xl font-black sm:text-4xl">{t("Technology built around real-world needs","تقنية تُبنى حول احتياجات العالم الحقيقي")}</h2></div><div className="grid gap-5 md:grid-cols-2">
      {focus.map((item,i)=><Link key={item[0]} href={item[4]} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"><div className={`relative h-48 bg-gradient-to-br ${item[5]}`}><div className="absolute inset-0 opacity-20 bg-[linear-gradient(135deg,transparent_40%,rgba(255,255,255,.35)_41%,transparent_42%)]"/><div className={`absolute bottom-5 ${ar?'right-5 text-right':'left-5'} text-white`}><span className="text-[10px] font-bold uppercase tracking-[.18em] text-white/65">0{i+1}</span><h3 className="mt-1 text-2xl font-black">{t(item[0],item[1])}</h3></div></div><div className={`p-6 ${ar?'text-right':''}`}><p className="min-h-[72px] text-sm leading-6 text-slate-500">{t(item[2],item[3])}</p><div className="mt-6 border-t border-slate-100 pt-5 text-[10px] font-black uppercase tracking-[.18em] text-red-500">{t("Explore","استكشف")} {ar?"←":"→"}</div></div></Link>)}
    </div></div></section>

    <section className="border-y border-slate-200 bg-white py-16 sm:py-20"><div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10"><div className={`mb-8 flex items-end justify-between gap-6 ${ar?"text-right":""}`}><div><span className="text-[10px] font-black uppercase tracking-[.24em] text-red-500">02 / {t("Training","التدريب")}</span><h2 className="mt-3 text-3xl font-black sm:text-4xl">{t("Professional programs. Practical learning.","برامج مهنية. تعلم تطبيقي.")}</h2></div><Link href="/programs" className="text-sm font-black text-red-500">{t("View all","عرض الكل")} {ar?"←":"→"}</Link></div>{programs.length?<div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{programs.slice(0,6).map((p,i)=><Link href={`/programs/${p.slug}`} key={p.id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"><div className={`relative h-40 bg-gradient-to-br ${["from-[#101827] via-[#18324a] to-[#00b8d9]","from-[#20122f] via-[#35215c] to-[#ff536d]","from-[#071b1d] via-[#123e43] to-[#20c997]"][i%3]}`}><div className="absolute bottom-5 left-5 right-5 text-white"><span className="text-[10px] font-bold uppercase tracking-[.16em] text-white/65">{lang==='ar'?p.arDomain:p.enDomain}</span><h3 className="mt-1 text-xl font-black">{lang==='ar'?p.arName:p.enName}</h3></div></div><div className={`p-6 ${ar?'text-right':''}`}><p className="line-clamp-3 min-h-[72px] text-sm leading-6 text-slate-500">{lang==='ar'?p.arDescription:p.enDescription}</p><div className="mt-5 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-400">{lang==='ar'?p.arDuration:p.enDuration} · {lang==='ar'?p.arFormat:p.enFormat}</div></div></Link>)}</div>:<div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center text-slate-400">{t("New professional programs will be published here.","سيتم نشر البرامج المهنية الجديدة هنا.")}</div>}</div></section>

    <section className="py-20"><div className={`mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 ${ar?"text-right":""}`}><div className="rounded-3xl bg-[#07111d] p-8 text-white sm:p-12 lg:p-16"><span className="text-[10px] font-black uppercase tracking-[.24em] text-cyan-200">03 / BXBII</span><h2 className="mt-4 max-w-4xl text-3xl font-black sm:text-5xl">{t("Let’s build what comes next.","لنبنِ ما يأتي بعد ذلك.")}</h2><p className="mt-4 max-w-2xl leading-7 text-white/50">{t("Technology, industrial projects, partnerships and training — start the conversation with bxbii.","التقنية والمشاريع الصناعية والشراكات والتدريب — ابدأ الحوار مع bxbii.")}</p><Link href="/contact-us#contact-form" className="mt-8 inline-flex rounded-xl bg-white px-6 py-4 text-sm font-black text-[#07111d] transition hover:bg-cyan-100">{t("Start a conversation","ابدأ محادثة")} {ar?"←":"→"}</Link></div></div></section>
  </main>;
}
