"use client";
import Link from "next/link";
import { useLanguage } from "./language-provider";
import { catalogCourses } from "@/lib/site-catalog";

export function CoursesPage() {
  const { lang } = useLanguage();
  const ar = lang === "ar";
  const t = (en: string, a: string) => ar ? a : en;
  return <main className="bg-white">
    <section className="bg-[#08172e] py-24 text-white"><div className={`mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 ${ar ? "text-right" : ""}`}><span className="text-xs font-black uppercase tracking-[.18em] text-blue-300">{t("COURSES", "الدورات")}</span><h1 className="mt-4 max-w-4xl text-5xl font-black tracking-tight sm:text-6xl">{t("Focused learning. Immediate application.", "تعلم مركز. تطبيق مباشر.")}</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-white/65">{t("Short, practical courses for professionals, students and teams.", "دورات قصيرة وعملية للمهنيين والطلاب والفرق.")}</p></div></section>
    <section className="py-20"><div className="mx-auto grid max-w-7xl gap-6 px-5 sm:px-8 md:grid-cols-2 lg:grid-cols-4 lg:px-10">{catalogCourses.map((c, i) => <Link href={`/courses/${c.slug}`} key={c.slug} className="group rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-accent hover:shadow-xl"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-sm font-black text-white">{String(i + 1).padStart(2, "0")}</div><span className={`mt-7 block text-xs font-black text-accent ${ar ? "text-right" : ""}`}>{c.category[lang]}</span><h2 className={`mt-2 text-2xl font-black text-slate-950 group-hover:text-brand ${ar ? "text-right" : ""}`}>{c.name[lang]}</h2><p className={`mt-3 leading-7 text-slate-500 ${ar ? "text-right" : ""}`}>{c.description[lang]}</p><div className={`mt-6 border-t border-slate-100 pt-4 text-xs font-bold text-slate-400 ${ar ? "text-right" : ""}`}>{c.duration[lang]} • {c.lessons.length} {t("lessons", "دروس")}</div></Link>)}</div></section>
  </main>;
}
