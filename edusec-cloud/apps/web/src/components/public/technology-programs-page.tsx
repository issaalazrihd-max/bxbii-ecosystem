"use client";
import Link from "next/link";
import { useLanguage } from "./language-provider";

const programs = [
  ["01", "Software & Application Development", "تطوير البرمجيات والتطبيقات", "Web, mobile and application development foundations with practical project delivery.", "/images/iot-connected.svg"],
  ["02", "Cloud Computing", "الحوسبة السحابية", "Cloud foundations, deployment concepts and scalable digital services.", "/images/robotics-industrial.svg"],
  ["03", "Data Science & AI", "علم البيانات والذكاء الاصطناعي", "Data analysis, machine learning and applied AI for real-world use cases.", "/images/semiconductor-hero.svg"],
  ["04", "Software Engineering", "هندسة البرمجيات", "Engineering practices, quality, architecture and collaborative software delivery.", "/images/iot-connected.svg"],
  ["05", "Mechatronics Engineering", "هندسة الميكاترونكس", "Mechanical, electronics and programming foundations for intelligent machines and robotics.", "/images/robotics-industrial.svg"],
  ["06", "Cybersecurity", "الأمن السيبراني", "Security foundations, ethical testing and practical defensive capabilities.", "/images/semiconductor-hero.svg"],
  ["07", "Networks & Connected Systems", "الشبكات والأنظمة المتصلة", "Networking concepts, connected devices, telemetry and industrial connectivity.", "/images/iot-connected.svg"],
  ["08", "Executive & Leadership", "البرامج التنفيذية", "Technology-focused programs designed for leaders and decision-makers.", "/images/robotics-industrial.svg"],
];

export function TechnologyProgramsPage() {
  const { lang } = useLanguage();
  const ar = lang === "ar";
  const t = (en: string, arText: string) => (ar ? arText : en);

  return (
    <main className="min-h-screen bg-[#050b13] text-white">
      <section className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_80%_10%,rgba(47,183,255,.18),transparent_30%),radial-gradient(circle_at_15%_80%,rgba(255,72,48,.08),transparent_25%),linear-gradient(135deg,#050b13,#071727)] py-28">
        <div className={`relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 ${ar ? "text-right" : ""}`}>
          <span className="text-[10px] font-black tracking-[.25em] text-cyan-200">{t("SOCIAL IMPACT / PROGRAMS", "الأثر المجتمعي / البرامج")}</span>
          <h1 className="mt-5 max-w-5xl text-5xl font-black leading-[.98] tracking-[-.05em] sm:text-7xl">{t("Professional technology programs built around practical learning.", "برامج تقنية احترافية مبنية على التعلم التطبيقي.")}</h1>
          <p className="mt-7 max-w-3xl text-lg leading-8 text-white/50">{t("A structured program catalogue inspired by the technology pathways and delivery model publicly presented by Tuwaiq Academy, adapted as a reference framework for bxbii capability-building initiatives.", "كتالوج منظم للبرامج التقنية مستلهم من المسارات التقنية ونموذج تقديم البرامج المنشور علنًا من أكاديمية طويق، ويُستخدم كإطار مرجعي لمبادرات بناء القدرات في bxbii.")}</p>
          <div className={`mt-9 flex flex-wrap gap-3 ${ar ? "justify-end" : ""}`}>
            <a href="https://tuwaiq.edu.sa/bootcamps" target="_blank" rel="noreferrer" className="rounded-lg bg-gradient-to-r from-red-500 to-orange-400 px-6 py-3 text-sm font-black">{t("View Tuwaiq catalogue ↗", "عرض كتالوج طويق ↗")}</a>
            <Link href="/contact-us" className="rounded-lg border border-white/15 bg-white/[.03] px-6 py-3 text-sm font-black">{t("Build a program with us", "صمّم برنامجًا معنا")}</Link>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#060d15] py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className={`grid gap-4 md:grid-cols-2 ${ar ? "text-right" : ""}`}>
            <div className="rounded-2xl border border-white/10 bg-white/[.025] p-7"><span className="text-3xl font-black">1–9</span><h2 className="mt-2 text-xl font-black">{t("Months / Bootcamps", "أشهر / المعسكرات")}</h2><p className="mt-3 text-sm leading-6 text-white/40">{t("Tuwaiq describes its intensive bootcamps as programs lasting from 1 to 9 months, with professional certificates and market-oriented practical learning.", "توضح طويق أن معسكراتها الاحترافية المكثفة تمتد من شهر إلى 9 أشهر، مع شهادات احترافية ومنهجية عملية مرتبطة باحتياجات سوق العمل.")}</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/[.025] p-7"><span className="text-3xl font-black">1–3</span><h2 className="mt-2 text-xl font-black">{t("Weeks / Professional Programs", "أسابيع / البرامج الاحترافية")}</h2><p className="mt-3 text-sm leading-6 text-white/40">{t("Tuwaiq describes its professional programs as 1–3 week experiences focused on developing technical capabilities through practical learning.", "توضح طويق أن برامجها الاحترافية تمتد من أسبوع إلى 3 أسابيع وتركز على تطوير القدرات التقنية من خلال التعلم التطبيقي.")}</p></div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className={`max-w-3xl ${ar ? "mr-auto text-right" : ""}`}>
            <span className="text-[10px] font-black tracking-[.25em] text-cyan-200">01 / {t("PROGRAM PATHWAYS", "مسارات البرامج")}</span>
            <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">{t("Technology pathways for students, professionals and organizations.", "مسارات تقنية للطلاب والمهنيين والمؤسسات.")}</h2>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {programs.map(([n, en, a, desc, img]) => (
              <article key={n} className={`group overflow-hidden rounded-2xl border border-white/10 bg-[#091521] transition hover:-translate-y-1 hover:border-cyan-200/25 ${ar ? "text-right" : ""}`}>
                <div className="relative h-36 overflow-hidden bg-[#0b1b29]">
                  <img src={img} alt="" className="h-full w-full object-cover opacity-65 transition duration-500 group-hover:scale-110 group-hover:opacity-90" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#091521] to-transparent" />
                  <span className="absolute left-4 top-4 text-[10px] font-black text-red-400">{n}</span>
                </div>
                <div className="p-6"><h3 className="text-lg font-black">{ar ? a : en}</h3><p className="mt-3 text-xs leading-6 text-white/40">{desc}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-[#060d15] py-16">
        <div className={`mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 ${ar ? "text-right" : ""}`}>
          <p className="max-w-3xl text-xs leading-6 text-white/35">{t("Source note: Program categories, durations and delivery descriptions in this section are based on information publicly available from Tuwaiq Academy. Individual programs, dates, eligibility and availability change over time; users should verify current details on Tuwaiq's official catalogue.", "ملاحظة المصدر: تصنيفات البرامج ومددها ووصف نموذج تقديمها في هذا القسم مبنية على المعلومات المنشورة علنًا من أكاديمية طويق. تختلف البرامج والمواعيد وشروط القبول والتوفر بمرور الوقت؛ ويجب التحقق من التفاصيل الحالية من الكتالوج الرسمي لطويق.")}</p>
          <a href="https://tuwaiq.edu.sa/bootcamps" target="_blank" rel="noreferrer" className="mt-4 inline-block text-xs font-black text-cyan-200">{t("Official Tuwaiq Academy catalogue ↗", "الكتالوج الرسمي لأكاديمية طويق ↗")}</a>
        </div>
      </section>
    </main>
  );
}
