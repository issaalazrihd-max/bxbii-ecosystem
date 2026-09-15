import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { catalogCourses } from "@/lib/site-catalog";

export async function generateStaticParams() { return catalogCourses.map((c) => ({ slug: c.slug })); }
export const dynamicParams = false;
export const metadata: Metadata = { title: "Course | bxbii" };

export default function Page({ params }: { params: { slug: string } }) {
  const course = catalogCourses.find((c) => c.slug === params.slug);
  if (!course) notFound();
  return <main className="bg-white"><section className="bg-[#08172e] py-24 text-white"><div className="mx-auto max-w-5xl px-5 sm:px-8"><Link href="/courses" className="text-sm font-bold text-blue-300">← Courses / الدورات</Link><div className="mt-10 grid gap-8 md:grid-cols-[1fr_auto]"><div><span className="text-xs font-black uppercase tracking-[.18em] text-blue-300">{course.category.en} / {course.category.ar}</span><h1 className="mt-4 text-5xl font-black">{course.name.en}</h1><h2 className="mt-3 text-2xl font-bold text-white/80" dir="rtl">{course.name.ar}</h2><p className="mt-6 text-lg leading-8 text-white/65">{course.description.en}</p><p className="mt-2 text-lg leading-8 text-white/65" dir="rtl">{course.description.ar}</p></div><div className="h-fit rounded-3xl border border-white/10 bg-white/5 p-7 text-center"><div className="text-3xl font-black">{course.duration.en}</div><div className="mt-2 text-white/50">{course.duration.ar}</div></div></div></div></section><section className="py-20"><div className="mx-auto max-w-5xl px-5 sm:px-8"><span className="text-xs font-black uppercase tracking-[.18em] text-accent">Curriculum / المنهج</span><h2 className="mt-3 text-4xl font-black">What you will learn / ماذا ستتعلم</h2><div className="mt-10 grid gap-4">{course.lessons.map((lesson, i) => <div key={i} className="grid gap-5 rounded-2xl border border-slate-200 p-6 md:grid-cols-2"><div><span className="text-xs font-black text-accent">Lesson {i + 1}</span><h3 className="mt-2 font-black">{lesson.en}</h3></div><div dir="rtl" className="text-right"><span className="text-xs font-black text-accent">الدرس {i + 1}</span><h3 className="mt-2 font-black">{lesson.ar}</h3></div></div>)}</div><div className="mt-12 rounded-3xl bg-slate-50 p-8 text-center"><h3 className="text-2xl font-black">Ready to learn? / مستعد للتعلم؟</h3><Link href="/contact-us" className="mt-6 inline-flex rounded-full bg-accent px-7 py-3 font-black text-white">Register interest / سجّل اهتمامك</Link></div></div></section></main>;
}
