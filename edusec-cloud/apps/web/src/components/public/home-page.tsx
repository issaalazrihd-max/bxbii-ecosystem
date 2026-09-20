"use client";
import Link from "next/link";
import type { PublicPartner, PublicProgram } from "@/lib/public-api";
import { useLanguage } from "./language-provider";

const fallback = [
  { slug: "full-stack-web", en: "Full-Stack Web Development", ar: "تطوير الويب المتكامل", domainEn: "Software Development", domainAr: "تطوير البرمجيات", durationEn: "12 weeks", durationAr: "12 أسبوعًا" },
  { slug: "ai-applied", en: "Applied AI & Intelligent Applications", ar: "الذكاء الاصطناعي والتطبيقات الذكية", domainEn: "AI & Data", domainAr: "الذكاء الاصطناعي والبيانات", durationEn: "8 weeks", durationAr: "8 أسابيع" },
  { slug: "data-analytics", en: "Data Analytics & Decision Intelligence", ar: "تحليل البيانات وذكاء القرار", domainEn: "Data", domainAr: "البيانات", durationEn: "10 weeks", durationAr: "10 أسابيع" },
  { slug: "cybersecurity", en: "Cybersecurity Foundations", ar: "أساسيات الأمن السيبراني", domainEn: "Cybersecurity", domainAr: "الأمن السيبراني", durationEn: "8 weeks", durationAr: "8 أسابيع" },
  { slug: "cloud", en: "Cloud Foundations", ar: "أساسيات الحوسبة السحابية", domainEn: "Cloud", domainAr: "الحوسبة السحابية", durationEn: "8 weeks", durationAr: "8 أسابيع" },
  { slug: "project-management", en: "Project Management in Practice", ar: "إدارة المشاريع بالتطبيق", domainEn: "Business", domainAr: "الأعمال", durationEn: "6 weeks", durationAr: "6 أسابيع" },
];

const copy = {
  en: {
    eyebrow: "PEOPLE • SKILLS • TECHNOLOGY",
    hero: "Skills for today. Opportunities for tomorrow.",
    sub: "Practical programs, intensive bootcamps and professional courses designed around real work, real projects and a global standard.",
    programs: "Explore programs", courses: "Explore courses", stats: ["Programs", "Bootcamps", "Courses", "Partners"],
    programTitle: "Programs built for the real world", programSub: "Technology, data, cybersecurity, business and digital skills — with clear outcomes and practical projects.",
    viewAll: "View all programs", featured: "Featured courses", featuredSub: "Short, focused learning for skills you can use immediately.",
    method: "Learn. Apply. Build. Demonstrate.", methodSub: "We connect knowledge to practice, projects and measurable outcomes.",
    ecosystem: "Local roots. Global standard.", ecosystemSub: "Built in Oman for learners, organizations and partners who want learning experiences that create real opportunity.",
    partners: "Trusted partners", faq: "Frequently asked questions", cta: "Ready for what’s next?", ctaSub: "Choose a program, start a course or talk to our team.", start: "Start learning",
  },
  ar: {
    eyebrow: "الإنسان • المهارات • التقنية",
    hero: "مهارات اليوم. فرص الغد.",
    sub: "برامج عملية ومعسكرات مكثفة ودورات مهنية مصممة حول العمل الحقيقي والمشاريع والمعايير العالمية.",
    programs: "استكشف البرامج", courses: "استكشف الدورات", stats: ["برنامج", "معسكر", "دورة", "شريك"],
    programTitle: "برامج صُممت للعالم الحقيقي", programSub: "التقنية والبيانات والأمن السيبراني والأعمال والمهارات الرقمية — بمخرجات واضحة ومشاريع عملية.",
    viewAll: "عرض جميع البرامج", featured: "دورات مميزة", featuredSub: "تعلم مركز لمهارات يمكنك استخدامها مباشرة.",
    method: "تعلّم. طبّق. ابنِ. أثبت.", methodSub: "نربط المعرفة بالتطبيق والمشاريع والمخرجات القابلة للقياس.",
    ecosystem: "جذور محلية. معيار عالمي.", ecosystemSub: "نبني bxbii في عُمان للمتعلمين والمؤسسات والشركاء الذين يريدون تجارب تعلم تصنع فرصًا حقيقية.",
    partners: "شركاء موثوقون", faq: "الأسئلة الشائعة", cta: "مستعد لما هو قادم؟", ctaSub: "اختر برنامجًا، ابدأ دورة، أو تواصل مع فريقنا.", start: "ابدأ التعلم",
  },
} as const;

export function HomePage({ programs, partners }: { programs: PublicProgram[]; partners: PublicPartner[] }) {
  const { lang } = useLanguage();
  const ar = lang === "ar";
  const t = copy[lang];
  const db = programs.slice(0, 6).map((p) => ({ slug: p.slug, en: p.enName, ar: p.arName, domainEn: p.enDomain, domainAr: p.arDomain, durationEn: p.enDuration, durationAr: p.arDuration }));
  const cards = db.length ? db : fallback;
  const text = (en: string, a: string) => ar ? a : en;
  return (
    <main className="overflow-hidden bg-white text-slate-950">
      <section className="relative min-h-[720px] overflow-hidden bg-[#07162c] text-white">
        <img src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=2200&q=85" alt="Modern learning environment" className="absolute inset-0 h-full w-full object-cover opacity-55" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_28%,rgba(91,49,199,.35),transparent_30%),linear-gradient(90deg,rgba(3,12,28,.98)_0%,rgba(3,12,28,.82)_42%,rgba(3,12,28,.25)_100%)]" />
        <div className="absolute inset-0 opacity-20 hero-grid" />
        <div className="relative mx-auto flex min-h-[720px] max-w-7xl items-center px-5 py-24 sm:px-8 lg:px-10">
          <div className={`max-w-3xl ${ar ? "text-right" : ""}`}>
            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black tracking-[.16em] text-white/80 backdrop-blur">{t.eyebrow}</span>
            <h1 className="mt-7 text-5xl font-black leading-[.98] tracking-tight sm:text-6xl lg:text-7xl">{t.hero}</h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/70 sm:text-xl">{t.sub}</p>
            <div className={`mt-9 flex flex-wrap gap-3 ${ar ? "justify-end" : ""}`}>
              <Link href="/training" className="rounded-full bg-accent px-7 py-4 text-sm font-black shadow-2xl shadow-purple-950/40 transition hover:-translate-y-1 hover:bg-accent-light">{t.programs} <span className={ar ? "inline-block rotate-180" : ""}>→</span></Link>
              <Link href="/courses" className="rounded-full border border-white/25 bg-white/10 px-7 py-4 text-sm font-black backdrop-blur transition hover:bg-white/15">{t.courses}</Link>
            </div>
            <div className="mt-14 grid max-w-2xl grid-cols-2 gap-5 sm:grid-cols-4">
              {[["50+", t.stats[0]], ["12", t.stats[1]], ["40+", t.stats[2]], ["15+", t.stats[3]]].map(([n, label]) => <div key={label} className="border-s border-white/15 ps-4"><strong className="block text-2xl font-black">{n}</strong><span className="text-xs text-white/50">{label}</span></div>)}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white py-9">
        <div className="mx-auto grid max-w-7xl gap-4 px-5 sm:px-8 md:grid-cols-4 lg:px-10">
          {[text("Learn by doing", "تعلّم بالممارسة"), text("Industry-aligned", "متوافق مع احتياجات القطاع"), text("Bilingual", "ثنائي اللغة"), text("Global standard", "بمعيار عالمي")].map((x, i) => <div key={x} className={`rounded-2xl bg-slate-50 p-5 ${ar ? "text-right" : ""}`}><span className="text-xs font-black text-accent">0{i + 1}</span><h3 className="mt-2 font-black">{x}</h3></div>)}
        </div>
      </section>

      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className={`flex flex-col justify-between gap-5 sm:flex-row sm:items-end ${ar ? "sm:flex-row-reverse" : ""}`}><div className={ar ? "text-right" : ""}><span className="text-xs font-black uppercase tracking-[.18em] text-accent">{text("PROGRAMS", "البرامج")}</span><h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{t.programTitle}</h2><p className="mt-4 max-w-2xl text-slate-500">{t.programSub}</p></div><Link href="/training" className="font-black text-brand">{t.viewAll} →</Link></div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {cards.map((p, i) => <Link key={p.slug} href={`/programs/${p.slug}`} className="group overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-2xl"><div className={`relative h-44 bg-gradient-to-br ${["from-brand to-blue-600", "from-violet-950 to-indigo-500", "from-slate-950 to-emerald-500", "from-cyan-950 to-blue-500", "from-indigo-950 to-purple-500", "from-slate-900 to-cyan-500"][i % 6]}`}><div className="absolute inset-0 opacity-20 hero-grid"/><div className={`absolute bottom-4 ${ar ? "right-5" : "left-5"} text-white`}><span className="text-xs font-bold text-white/60">{ar ? p.domainAr : p.domainEn}</span><div className="mt-1 text-xl font-black">{ar ? p.ar : p.en}</div></div></div><div className={`p-6 ${ar ? "text-right" : ""}`}><p className="text-sm leading-6 text-slate-500">{text("Practical curriculum, guided projects and clear outcomes.", "منهج عملي ومشاريع تطبيقية ومخرجات واضحة.")}</p><div className="mt-5 flex justify-between border-t border-slate-100 pt-4 text-xs font-bold text-slate-400"><span>{ar ? p.durationAr : p.durationEn}</span><span className="text-brand">{text("Explore", "استكشف")} →</span></div></div></Link>)}
          </div>
        </div>
      </section>

      <section className="bg-white py-24"><div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:px-10"><div className={`rounded-[2rem] bg-[#08172e] p-10 text-white ${ar ? "text-right" : ""}`}><span className="text-xs font-black uppercase tracking-[.18em] text-blue-300">{text("OUR METHOD", "منهجنا")}</span><h2 className="mt-5 text-4xl font-black sm:text-5xl">{t.method}</h2><p className="mt-5 text-lg leading-8 text-white/65">{t.methodSub}</p><div className="mt-8 grid gap-3 sm:grid-cols-2">{[text("Learn", "تعلّم"), text("Apply", "طبّق"), text("Build", "ابنِ"), text("Demonstrate", "أثبت")].map((x, i) => <div key={x} className="rounded-xl border border-white/10 bg-white/5 p-4 font-bold"><span className="me-3 text-blue-300">0{i + 1}</span>{x}</div>)}</div></div><div className={`flex flex-col justify-center ${ar ? "text-right" : ""}`}><span className="text-xs font-black uppercase tracking-[.18em] text-accent">bxbii ecosystem</span><h2 className="mt-5 text-4xl font-black sm:text-5xl">{t.ecosystem}</h2><p className="mt-5 max-w-xl text-lg leading-8 text-slate-500">{t.ecosystemSub}</p><Link href="/about-us" className="mt-8 inline-flex w-fit rounded-full bg-brand px-6 py-3 font-black text-white">{text("Discover bxbii", "اكتشف bxbii")} →</Link></div></div></section>

      {partners.length > 0 && <section className="border-y border-slate-200 bg-slate-50 py-20"><div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10"><div className={ar ? "text-right" : ""}><span className="text-xs font-black uppercase tracking-[.18em] text-accent">{text("PARTNERS", "الشركاء")}</span><h2 className="mt-3 text-3xl font-black">{t.partners}</h2></div><div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">{partners.slice(0, 12).map((p) => <div key={p.id} className="flex h-24 items-center justify-center rounded-2xl border border-slate-200 bg-white p-4 grayscale transition hover:grayscale-0"><img src={p.logoUrl} alt={p.name} className="max-h-12 max-w-[140px] object-contain"/></div>)}</div></div></section>}

      <section className="bg-white py-24"><div className="mx-auto max-w-4xl px-5 sm:px-8"><div className={ar ? "text-right" : ""}><span className="text-xs font-black uppercase tracking-[.18em] text-accent">FAQ</span><h2 className="mt-3 text-4xl font-black">{t.faq}</h2></div><div className="mt-8 divide-y divide-slate-200 rounded-3xl border border-slate-200">{[[text("Are programs available in Arabic and English?", "هل البرامج متاحة بالعربية والإنجليزية؟"), text("Yes. bxbii is designed as a bilingual experience.", "نعم. صُممت bxbii كتجربة ثنائية اللغة." )],[text("Can companies request private training?", "هل يمكن للشركات طلب تدريب خاص؟"), text("Yes. Delivery, schedule, projects and assessment can be adapted for organizations.", "نعم. يمكن تكييف التقديم والجدول والمشاريع والتقييم للمؤسسات.")],[text("How do I register?", "كيف أسجل؟"), text("Explore a program or course and contact the team to start your registration.", "استكشف البرنامج أو الدورة وتواصل مع الفريق لبدء التسجيل.")]].map(([q,a]) => <details key={q} className={`group p-6 ${ar ? "text-right" : ""}`}><summary className="cursor-pointer list-none font-black">{q}<span className="float-end text-accent">+</span></summary><p className="mt-3 leading-7 text-slate-500">{a}</p></details>)}</div></div></section>

      <section className="bg-accent px-5 py-20 text-white sm:px-8"><div className={`mx-auto flex max-w-7xl flex-col justify-between gap-7 sm:flex-row sm:items-center ${ar ? "sm:flex-row-reverse" : ""}`}><div className={ar ? "text-right" : ""}><h2 className="text-4xl font-black">{t.cta}</h2><p className="mt-3 text-white/75">{t.ctaSub}</p></div><Link href="/training" className="rounded-full bg-white px-7 py-4 font-black text-brand">{t.start} →</Link></div></section>
    </main>
  );
}
