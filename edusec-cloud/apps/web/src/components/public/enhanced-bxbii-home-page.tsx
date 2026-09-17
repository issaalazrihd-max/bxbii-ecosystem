"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { publicApi, type PublicProgram } from "@/lib/public-api";
import { useLanguage } from "./language-provider";

const heroSlides = [
  {
    en: "ADVANCED TECHNOLOGY. BUILT FOR THE REAL WORLD.",
    ar: "تقنيات متقدمة. تُبنى للعالم الحقيقي.",
    descEn: "Technology, engineering and training capabilities designed around the needs of industry.",
    descAr: "تقنيات وهندسة وقدرات تدريبية تُبنى حول احتياجات الصناعة.",
    href: "/technology",
  },
  {
    en: "BUILD CAPABILITY. CREATE IMPACT.",
    ar: "نبني القدرات. نصنع الأثر.",
    descEn: "From advanced systems and industrial solutions to practical professional programs.",
    descAr: "من الأنظمة المتقدمة والحلول الصناعية إلى البرامج المهنية التطبيقية.",
    href: "/solutions",
  },
  {
    en: "FROM OMAN. CONNECTED TO THE WORLD.",
    ar: "من عُمان. متصلون بالعالم.",
    descEn: "A technology company focused on building capabilities for Oman and beyond.",
    descAr: "شركة تقنية تركز على بناء القدرات لعُمان والأسواق من حولها.",
    href: "/about-us",
  },
];

const capabilities = [
  { n: "01", en: "Semiconductors", ar: "أشباه الموصلات", descEn: "Chip, electronics and advanced hardware capabilities.", descAr: "قدرات في الشرائح والإلكترونيات والعتاد المتقدم.", image: "/images/semiconductor-hero.svg", href: "/technology" },
  { n: "02", en: "Robotics & Automation", ar: "الروبوتات والأتمتة", descEn: "Intelligent systems for modern industrial environments.", descAr: "أنظمة ذكية للبيئات الصناعية الحديثة.", image: "/images/robotics-industrial.svg", href: "/technology" },
  { n: "03", en: "Connected Systems", ar: "الأنظمة المتصلة", descEn: "IoT, embedded systems and intelligent edge technologies.", descAr: "إنترنت الأشياء والأنظمة المدمجة وتقنيات الحافة الذكية.", image: "/images/iot-connected.svg", href: "/technology" },
  { n: "04", en: "Industrial Solutions", ar: "الحلول الصناعية", descEn: "Technology solutions shaped around operational outcomes.", descAr: "حلول تقنية مصممة حول النتائج التشغيلية.", image: "/images/oman-hero.webp", href: "/solutions" },
];

const industries = [
  ["Oil & Gas", "النفط والغاز"],
  ["Mining & Manufacturing", "التعدين والتصنيع"],
  ["Energy & Utilities", "الطاقة والمرافق"],
  ["Ports & Infrastructure", "الموانئ والبنية الأساسية"],
];

const pillars = [
  ["Technology", "التكنولوجيا", "Explore our technology domains and engineering capabilities.", "استكشف مجالات التكنولوجيا وقدراتنا الهندسية.", "/technology"],
  ["Solutions", "الحلول", "Apply technology to practical industrial and operational challenges.", "نوظف التقنية لمعالجة التحديات الصناعية والتشغيلية.", "/solutions"],
  ["R&D", "البحث والتطوير", "Turn ideas, prototypes and emerging technologies into practical capabilities.", "نحوّل الأفكار والنماذج الأولية والتقنيات الناشئة إلى قدرات عملية.", "/rd"],
  ["Training", "التدريب", "Professional programs that connect people with future-ready technology skills.", "برامج مهنية تربط الأفراد بالمهارات التقنية المطلوبة للمستقبل.", "/programs"],
];

export function EnhancedBxbiiHomePage() {
  const { lang } = useLanguage();
  const ar = lang === "ar";
  const [active, setActive] = useState(0);
  const [programs, setPrograms] = useState<PublicProgram[]>([]);
  const t = (en: string, arText: string) => (ar ? arText : en);

  useEffect(() => {
    publicApi.getPrograms().then((r) => setPrograms(r ?? [])).catch(() => setPrograms([]));
    const id = window.setInterval(() => setActive((v) => (v + 1) % heroSlides.length), 6500);
    return () => window.clearInterval(id);
  }, []);

  const slide = heroSlides[active];

  return (
    <main className="overflow-hidden bg-white text-[#111827]">
      {/* Hero */}
      <section className="relative min-h-[650px] overflow-hidden bg-[#111827] text-white lg:min-h-[720px]">
        <div className="absolute inset-0 bg-[url('/images/oman-hero.webp')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070b12]/95 via-[#111827]/80 to-[#111827]/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111827]/90 via-transparent to-[#111827]/20" />
        <div className="relative mx-auto flex min-h-[650px] max-w-7xl items-end px-5 pb-14 pt-28 sm:px-8 lg:min-h-[720px] lg:px-10 lg:pb-20">
          <div className={`max-w-4xl ${ar ? "mr-auto text-right" : ""}`}>
            <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-[.2em] backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-[#e31b23]" />
              {t("Technology · Industry · Training", "التكنولوجيا · الصناعة · التدريب")}
            </div>
            <h1 key={active} className="max-w-4xl text-5xl font-black leading-[.94] tracking-[-.055em] sm:text-7xl lg:text-[84px]">
              {t(slide.en, slide.ar)}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-white/75 sm:text-lg">
              {t(slide.descEn, slide.descAr)}
            </p>
            <div className={`mt-8 flex flex-wrap gap-3 ${ar ? "justify-end" : ""}`}>
              <Link href={slide.href} className="rounded-xl bg-[#e31b23] px-7 py-4 text-sm font-black transition hover:bg-[#c9141b]">
                {t("Explore bxbii", "استكشف bxbii")} {ar ? "←" : "→"}
              </Link>
              <Link href="/programs" className="rounded-xl border border-white/30 bg-white/5 px-7 py-4 text-sm font-black backdrop-blur transition hover:bg-white/10">
                {t("Training programs", "البرامج التدريبية")}
              </Link>
            </div>
            <div className={`mt-10 flex gap-2 ${ar ? "justify-end" : ""}`}>
              {heroSlides.map((item, i) => (
                <button key={item.en} onClick={() => setActive(i)} aria-label={`slide ${i + 1}`} className={`h-1.5 rounded-full transition-all ${i === active ? "w-12 bg-white" : "w-6 bg-white/30"}`} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Brand / positioning strip */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-0 px-5 sm:px-8 lg:grid-cols-[1.1fr_2fr] lg:px-10">
          <div className={`border-b border-slate-200 py-8 lg:border-b-0 lg:border-r ${ar ? "text-right lg:border-r-0 lg:border-l" : ""}`}>
            <span className="text-[10px] font-black uppercase tracking-[.2em] text-[#e31b23]">BXBII</span>
            <p className="mt-3 max-w-sm text-lg font-bold leading-7">
              {t("A technology company building practical capabilities for industry.", "شركة تقنية تبني قدرات عملية للصناعة.")}
            </p>
          </div>
          <div className="grid grid-cols-2 divide-x divide-slate-200 sm:grid-cols-4 sm:divide-y-0">
            {["Semiconductors", "Robotics", "Connected Systems", "Industrial Solutions"].map((item, i) => (
              <div key={item} className={`flex min-h-28 items-center px-5 py-6 text-sm font-black ${ar ? "text-right" : ""}`}>
                <span className="mr-3 text-[10px] text-[#e31b23]">0{i + 1}</span>{t(item, ["أشباه الموصلات", "الروبوتات", "الأنظمة المتصلة", "الحلول الصناعية"][i])}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main pillars */}
      <section className="bg-[#f6f7f9] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className={`max-w-3xl ${ar ? "mr-auto text-right" : ""}`}>
            <span className="text-[10px] font-black uppercase tracking-[.22em] text-[#e31b23]">01 / {t("What we do", "ماذا نقدم")}</span>
            <h2 className="mt-4 text-4xl font-black tracking-[-.04em] sm:text-6xl">{t("Technology, solutions, research and training.", "التكنولوجيا والحلول والبحث والتطوير والتدريب.")}</h2>
            <p className="mt-5 text-sm leading-7 text-slate-500 sm:text-base">{t("A focused ecosystem that connects advanced technology with industry needs and professional capability building.", "منظومة متكاملة تربط التكنولوجيا المتقدمة باحتياجات الصناعة وبناء القدرات المهنية.")}</p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {pillars.map(([en, a, descEn, descAr, href], i) => (
              <Link key={en} href={href} className="group relative min-h-52 overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="flex items-start justify-between">
                  <span className="text-[10px] font-black tracking-[.2em] text-[#e31b23]">0{i + 1}</span>
                  <span className="text-xl text-slate-300 transition group-hover:text-[#e31b23]">↗</span>
                </div>
                <h3 className={`mt-12 text-2xl font-black ${ar ? "text-right" : ""}`}>{t(en, a)}</h3>
                <p className={`mt-3 max-w-md text-sm leading-6 text-slate-500 ${ar ? "mr-auto text-right" : ""}`}>{t(descEn, descAr)}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Technology capabilities */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className={`flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between ${ar ? "text-right" : ""}`}>
            <div>
              <span className="text-[10px] font-black uppercase tracking-[.22em] text-[#e31b23]">02 / {t("Technology domains", "مجالات التكنولوجيا")}</span>
              <h2 className="mt-4 text-4xl font-black tracking-[-.04em] sm:text-6xl">{t("Explore our technology domains.", "استكشف مجالات التكنولوجيا لدينا.")}</h2>
            </div>
            <Link href="/technology" className="text-sm font-black text-[#e31b23]">{t("View all technology", "عرض كل مجالات التكنولوجيا")} {ar ? "←" : "→"}</Link>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {capabilities.map((item) => (
              <Link key={item.en} href={item.href} className="group overflow-hidden rounded-2xl border border-slate-200 bg-[#f6f7f9] transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="relative flex h-48 items-center justify-center overflow-hidden bg-[#111827] p-8">
                  <div className="absolute inset-0 opacity-80 transition duration-500 group-hover:scale-105 group-hover:opacity-100" style={{ backgroundImage: `url(${item.image})`, backgroundPosition: "center", backgroundRepeat: "no-repeat", backgroundSize: "cover" }} />
                  <div className="absolute inset-0 bg-[#111827]/45" />
                  <span className="relative text-5xl font-black text-white/90">{item.n}</span>
                </div>
                <div className={`p-6 ${ar ? "text-right" : ""}`}>
                  <h3 className="text-xl font-black">{t(item.en, item.ar)}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-500">{t(item.descEn, item.descAr)}</p>
                  <div className="mt-5 text-[10px] font-black uppercase tracking-[.18em] text-[#e31b23]">{t("Explore", "استكشف")} {ar ? "←" : "→"}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="bg-[#111827] py-20 text-white sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className={`max-w-3xl ${ar ? "mr-auto text-right" : ""}`}>
            <span className="text-[10px] font-black uppercase tracking-[.22em] text-red-400">03 / {t("Industries", "القطاعات")}</span>
            <h2 className="mt-4 text-4xl font-black tracking-[-.04em] sm:text-6xl">{t("Built around real industry needs.", "نبني حول احتياجات الصناعة الحقيقية.")}</h2>
            <p className="mt-5 text-sm leading-7 text-white/55 sm:text-base">{t("We focus on sectors where technology, reliability and operational performance matter.", "نركز على القطاعات التي تتطلب التقنية والموثوقية والأداء التشغيلي." )}</p>
          </div>
          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2">
            {industries.map(([en, a], i) => (
              <Link href="/industries" key={en} className="group min-h-36 bg-[#111827] p-7 transition hover:bg-[#182232]">
                <span className="text-[10px] font-black text-red-400">0{i + 1}</span>
                <div className="mt-8 flex items-end justify-between gap-4">
                  <h3 className="text-2xl font-black">{t(en, a)}</h3>
                  <span className="text-xl text-white/30 transition group-hover:text-red-400">↗</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Training */}
      <section className="bg-[#f6f7f9] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className={`flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between ${ar ? "text-right" : ""}`}>
            <div>
              <span className="text-[10px] font-black uppercase tracking-[.22em] text-[#e31b23]">04 / {t("Training", "التدريب")}</span>
              <h2 className="mt-4 text-4xl font-black tracking-[-.04em] sm:text-6xl">{t("Professional programs. Practical learning.", "برامج مهنية. تعلم تطبيقي.")}</h2>
            </div>
            <Link href="/programs" className="text-sm font-black text-[#e31b23]">{t("View all programs", "عرض كل البرامج")} {ar ? "←" : "→"}</Link>
          </div>

          {programs.length > 0 ? (
            <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {programs.slice(0, 6).map((p) => (
                <Link href={`/programs/${p.slug}`} key={p.id} className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-xl">
                  <div className={`flex items-center justify-between gap-4 ${ar ? "flex-row-reverse" : ""}`}>
                    <span className="text-[9px] font-black uppercase tracking-[.18em] text-[#e31b23]">{lang === "ar" ? p.arDomain : p.enDomain}</span>
                    <span className="text-slate-300 transition group-hover:text-[#e31b23]">↗</span>
                  </div>
                  <h3 className={`mt-5 text-xl font-black ${ar ? "text-right" : ""}`}>{lang === "ar" ? p.arName : p.enName}</h3>
                  <p className={`mt-3 line-clamp-3 text-sm leading-6 text-slate-500 ${ar ? "text-right" : ""}`}>{lang === "ar" ? p.arDescription : p.enDescription}</p>
                  <div className={`mt-6 border-t border-slate-100 pt-4 text-[10px] font-bold text-slate-400 ${ar ? "text-right" : ""}`}>
                    {lang === "ar" ? p.arDuration : p.enDuration} · {lang === "ar" ? p.arFormat : p.enFormat}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
              {t("New professional programs will be published here.", "سيتم نشر البرامج المهنية الجديدة هنا.")}
            </div>
          )}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className={`rounded-3xl bg-[#111827] p-8 text-white sm:p-14 lg:p-20 ${ar ? "text-right" : ""}`}>
            <span className="text-[10px] font-black uppercase tracking-[.22em] text-red-400">05 / BXBII</span>
            <h2 className="mt-5 max-w-4xl text-4xl font-black tracking-[-.04em] sm:text-6xl">{t("Let’s build what comes next.", "لنبنِ ما يأتي بعد ذلك.")}</h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/55 sm:text-base">{t("Whether you need technology, an industrial solution, R&D support or professional training, start a conversation with bxbii.", "سواء كنت تبحث عن تقنية أو حل صناعي أو دعم للبحث والتطوير أو تدريب مهني، ابدأ الحوار مع bxbii.")}</p>
            <div className={`mt-8 flex flex-wrap gap-3 ${ar ? "justify-end" : ""}`}>
              <Link href="/contact-us" className="rounded-xl bg-[#e31b23] px-7 py-4 text-sm font-black">{t("Contact bxbii", "تواصل مع bxbii")} {ar ? "←" : "→"}</Link>
              <Link href="/about-us" className="rounded-xl border border-white/20 px-7 py-4 text-sm font-black">{t("About us", "من نحن")}</Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
