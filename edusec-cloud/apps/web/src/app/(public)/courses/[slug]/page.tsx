import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { publicApi } from "@/lib/public-api";

export const dynamic="force-dynamic";
export const metadata: Metadata={title:"Course | BXBII"};

export default async function Page({params}:{params:{slug:string}}){
 const courses=(await publicApi.getCourses())??[]; const course=courses.find(c=>c.slug===params.slug); if(!course) notFound();
 const interestHref=`/contact-us?subject=${encodeURIComponent(`Course Interest — ${course.enTitle}`)}&program=${encodeURIComponent(params.slug)}#contact-form`;
 return <main className="bg-white"><section className="bg-[#08172e] py-24 text-white"><div className="mx-auto max-w-5xl px-5 sm:px-8"><Link href="/courses" className="text-sm font-bold text-blue-300">← Courses / الدورات</Link><div className="mt-10"><span className="text-xs font-black uppercase tracking-[.18em] text-blue-300">{course.status==="OPEN"?"OPEN / مفتوح":"COMING SOON / قريبًا"}</span><h1 className="mt-4 text-5xl font-black">{course.enTitle}</h1><h2 className="mt-3 text-2xl font-bold text-white/80" dir="rtl">{course.arTitle}</h2><p className="mt-6 text-lg leading-8 text-white/65">{course.enDescription}</p><p className="mt-2 text-lg leading-8 text-white/65" dir="rtl">{course.arDescription}</p><div className="mt-8 flex flex-wrap gap-3 text-sm font-bold text-white/60"><span>{course.enDuration}</span><span>•</span><span>{course.enFormat}</span></div></div></div></section><section className="py-20"><div className="mx-auto max-w-5xl px-5 sm:px-8"><div className="rounded-3xl border border-slate-200 bg-slate-50 p-8"><h2 className="text-3xl font-black">{course.status==="OPEN"?"Register interest / سجّل اهتمامك":"Register interest / أبدِ اهتمامك"}</h2><p className="mt-3 text-slate-500">{course.status==="OPEN"?"Contact BXBII for the current registration process.":"Tell us you are interested and the sales team can follow up when registration opens."}</p><Link href={interestHref} className="mt-6 inline-flex rounded-full bg-accent px-7 py-3 font-black text-white">{course.status==="OPEN"?"Contact us / تواصل معنا":"Register interest / أبدِ اهتمامك"}</Link></div></div></section></main>;
}
