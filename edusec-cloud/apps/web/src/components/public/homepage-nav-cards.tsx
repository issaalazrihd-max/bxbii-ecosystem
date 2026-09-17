"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "./language-provider";

const cards = [
  {
    en: "Home",
    ar: "الرئيسية",
    href: "/",
    image: "/images/oman-hero.webp",
    enInfo: ["BXBII ecosystem", "Technology · Industry · Training", "Built for real-world needs", "From Oman to the world"],
    arInfo: ["منظومة BXBII", "التكنولوجيا · الصناعة · التدريب", "نبني حلولاً للعالم الحقيقي", "من عُمان إلى العالم"],
  },
  {
    en: "Technology",
    ar: "التكنولوجيا",
    href: "/technology",
    image: "/images/semiconductor-hero.svg",
    enInfo: ["Semiconductors", "Robotics & Automation", "Connected Systems", "Embedded Technologies"],
    arInfo: ["أشباه الموصلات", "الروبوتات والأتمتة", "الأنظمة المتصلة", "الأنظمة المدمجة"],
  },
  {
    en: "Solutions",
    ar: "الحلول",
    href: "/solutions",
    image: "/images/robotics-industrial.svg",
    enInfo: ["Industrial Inspection", "Safety & Monitoring", "Predictive Maintenance", "Smart Infrastructure"],
    arInfo: ["الفحص الصناعي", "السلامة والمراقبة", "الصيانة التنبؤية", "البنية الأساسية الذكية"],
  },
  {
    en: "Industries",
    ar: "القطاعات",
    href: "/industries",
    image: "/images/oman-hero.webp",
    enInfo: ["Oil & Gas", "Mining & Manufacturing", "Energy & Utilities", "Ports & Infrastructure"],
    arInfo: ["النفط والغاز", "التعدين والتصنيع", "الطاقة والمرافق", "الموانئ والبنية الأساسية"],
  },
  {
    en: "R&D",
    ar: "البحث والتطوير",
    href: "/rd",
    image: "/images/iot-connected.svg",
    enInfo: ["Applied AI", "Edge & Embedded", "Robotics", "Prototyping"],
    arInfo: ["الذكاء الاصطناعي التطبيقي", "الحافة والأنظمة المدمجة", "الروبوتات", "النمذجة الأولية"],
  },
  {
    en: "Training",
    ar: "التدريب",
    href: "/programs",
    image: "/images/semiconductor-hero.svg",
    enInfo: ["Professional Programs", "Practical Learning", "Technology Skills", "Industry Capability"],
    arInfo: ["برامج مهنية", "تعلم تطبيقي", "مهارات تقنية", "بناء القدرات الصناعية"],
  },
  {
    en: "About",
    ar: "من نحن",
    href: "/about-us",
    image: "/images/robotics-industrial.svg",
    enInfo: ["Oman-based", "Technology focused", "Industry connected", "Built for growth"],
    arInfo: ["من عُمان", "تركيز على التكنولوجيا", "مرتبطون بالصناعة", "نبني للنمو"],
  },
  {
    en: "Contact",
    ar: "تواصل معنا",
    href: "/contact-us",
    image: "/images/oman-hero.webp",
    enInfo: ["Start a conversation", "Discuss a project", "Explore a partnership", "Build what comes next"],
    arInfo: ["ابدأ محادثة", "ناقش مشروعاً", "استكشف شراكة", "لنبنِ ما يأتي بعد ذلك"],
  },
];

export function HomepageNavCards() {
  const { lang } = useLanguage();
  const ar = lang === "ar";
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setActive((value) => (value + 1) % 4), 2800);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section className="relative overflow-hidden border-y border-slate-200 bg-[#f6f7f9] py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className={`mb-9 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between ${ar ? "sm:flex-row-reverse" : ""}`}>
          <div className={ar ? "text-right" : ""}>
            <span className="text-[10px] font-black uppercase tracking-[.22em] text-[#e31b23]">BXBII / {ar ? "استكشف" : "Explore"}</span>
            <h2 className="mt-3 text-3xl font-black tracking-[-.035em] sm:text-4xl">{ar ? "استكشف منظومة BXBII" : "Explore the BXBII ecosystem"}</h2>
          </div>
          <p className={`max-w-xl text-sm leading-6 text-slate-500 ${ar ? "text-right" : ""}`}>
            {ar ? "تنقل بين مجالاتنا وخدماتنا وقطاعاتنا من خلال بطاقات تفاعلية تتحرك معلوماتها تلقائياً." : "Move through our domains, services and industries through interactive cards with continuously moving information."}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card, index) => {
            const info = ar ? card.arInfo : card.enInfo;
            const current = active % info.length;
            return (
              <Link
                href={card.href}
                key={card.en}
                className="group relative min-h-[250px] overflow-hidden rounded-2xl border border-slate-200 bg-[#111827] text-white shadow-sm transition duration-500 hover:-translate-y-1 hover:shadow-2xl"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-45 transition duration-700 group-hover:scale-110 group-hover:opacity-60"
                  style={{ backgroundImage: `url(${card.image})` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#070b12] via-[#111827]/75 to-[#111827]/25" />
                <div className={`relative flex min-h-[250px] flex-col justify-between p-6 ${ar ? "text-right" : ""}`}>
                  <div className={`flex items-start justify-between ${ar ? "flex-row-reverse" : ""}`}>
                    <span className="text-[10px] font-black tracking-[.2em] text-[#e31b23]">0{index + 1}</span>
                    <span className="text-xl text-white/45 transition group-hover:text-[#e31b23]">↗</span>
                  </div>

                  <div>
                    <h3 className="text-2xl font-black tracking-tight">{ar ? card.ar : card.en}</h3>
                    <div className="mt-3 h-6 overflow-hidden text-sm font-semibold text-white/75">
                      <div
                        className="transition-transform duration-700 ease-out"
                        style={{ transform: `translateY(-${current * 24}px)` }}
                      >
                        {info.map((text) => (
                          <div key={text} className="h-6 leading-6 whitespace-nowrap">
                            {text}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className={`mt-5 flex items-center gap-2 ${ar ? "justify-end" : ""}`}>
                      <span className="h-1 w-10 overflow-hidden rounded-full bg-white/15">
                        <span className="block h-full rounded-full bg-[#e31b23] transition-all duration-700" style={{ width: `${((current + 1) / info.length) * 100}%` }} />
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-[.18em] text-white/45">{ar ? "استكشف" : "Explore"}</span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
