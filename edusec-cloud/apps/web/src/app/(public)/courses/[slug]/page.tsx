import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { publicApi } from "@/lib/public-api";

export const dynamic="force-dynamic";
export const metadata: Metadata={title:"Course | BXBII"};

export default async function Page({params}:{params:{slug:string}}){
 const courses=(await publicApi.getCourses())??[]; const course=courses.find(c=>c.slug===params.slug); if(!course) notFound();
 const courseHref=course.hrefOverride||`/courses/${course.slug}`;
 return <main className="bg-white"><section className="bg-[#08172e] py-24 text-white"><div className="mx-auto max-w-5xl px-5 sm:px-8"><Link href="/courses" className="text-sm font-bold text-blue-300">← Courses / الدورات</Link><div className="mt-10"><span className="text-xs font-black uppercase tracking-[.18em] text-blue-300">{course.status==="OPEN"?"OPEN / مفتوح":"COMING SOON / قريبًا"}</span><h1 className="mt-4 text-5xl font-black">{course.enTitle}</h1><h2 className="mt-3 text-2xl font-bold text-white/80" dir="rtl">{course.arTitle}</h2><p className="mt-6 text-lg leading-8 text-white/65">{course.enDescription}</p><p className="mt-2 text-lg leading-8 text-white/65" dir="rtl">{course.arDescription}</p><div className="mt-8 flex flex-wrap gap-3 text-sm font-bold text-white/60"><span>{course.enDuration}</span><span>•</span><span>{course.enFormat}</span></div></div></div></section><section className="py-20"><div className="mx-auto max-w-5xl px-5 sm:px-8"><div className="rounded-3xl border border-slate-200 bg-slate-50 p-8"><span className="text-xs font-black uppercase tracking-[.18em] text-accent">ONLINE COURSE / دورة أونلاين</span><h2 className="mt-3 text-3xl font-black">Start the course / ابدأ الدورة</h2><p className="mt-3 text-slate-500">Access the online learning content and start learning.</p><a href={courseHref} target={courseHref.startsWith("http")?"_blank":undefined} rel={courseHref.startsWith("http")?"noreferrer":undefined} className="mt-6 inline-flex rounded-full bg-accent px-7 py-3 font-black text-white">Start course / ابدأ الدورة</a></div></div></section></main>;
}
