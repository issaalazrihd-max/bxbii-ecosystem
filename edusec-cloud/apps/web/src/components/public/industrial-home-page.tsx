"use client";

import Link from "next/link";
import type { PublicPartner } from "@/lib/public-api";
import { useLanguage } from "./language-provider";

const domains = [
  { en: "Semiconductor Design", ar: "تصميم أشباه الموصلات", enDesc: "Chip, electronics and embedded-system design for next-generation industrial applications.", arDesc: "تصميم الشرائح والإلكترونيات والأنظمة المدمجة لتطبيقات صناعية من الجيل القادم.", image: "/images/semiconductor-hero.svg" },
  { en: "Robotics & Autonomous Systems", ar: "الروبوتات والأنظمة الذاتية", enDesc: "Robotic and autonomous systems for inspection, monitoring and field operations.", arDesc: "أنظمة روبوتية وذاتية للتفتيش والمراقبة والعمليات الميدانية.", image: "/images/robotics-industrial.svg" },
  { en: "IoT & Connected Devices", ar: "إنترنت الأشياء والأجهزة المتصلة", enDesc: "Sensors, connected devices and digital twins that turn field data into operational intelligence.", arDesc: "حساسات وأجهزة متصلة وتوائم رقمية تحول البيانات الميدانية إلى ذكاء تشغيلي.", image: "/images/iot-connected.svg" },
  { en: "Industrial & Physical AI", ar: "الذكاء الاصطناعي الصناعي والفيزيائي", enDesc: "Computer vision and physical intelligence connecting perception, decisions and action.", arDesc: "رؤية حاسوبية وذكاء فيزيائي يربط الإدراك بالقرار والتنفيذ.", image: "/images/robotics-industrial.svg" },
];

const sectors = [
  ["Oil & Gas", "النفط والغاز", "Asset inspection, leak detection, safety and operational visibility."],
  ["Mining & Manufacturing", "التعدين والتصنيع", "Equipment inspection, defect detection and industrial performance."],
  ["Energy & Utilities", "الطاقة والمرافق", "Monitoring, predictive maintenance and connected infrastructure."],
  ["Ports, Airports & Infrastructure", "الموانئ والمطارات والبنية الأساسية", "Inspection, safety and decision support for critical assets."],
];

const copy = {
  en: {
    eyebrow: "OMAN • DEEP TECH • INDUSTRIAL INNOVATION",
    hero: "Engineering the intelligence of the physical world.",
    sub: "bxbii develops industrial technologies across semiconductor design, robotics, connected devices and physical AI — turning intelligence into systems that can sense, understand, decide and act.",
    solutions: "Explore our technologies", about: "About bxbii", domains: "TECHNOLOGY DOMAINS", domainTitle: "From silicon to intelligent machines.", domainSub: "An integrated technology stack built around hardware, sensing, intelligence and real-world execution.",
    flow: "FROM DATA TO ACTION", flowTitle: "Sense. Understand. Decide. Act.", flowSub: "We connect sensors and cameras to intelligence, robotics and operational systems, with human oversight where required.",
    industries: "TARGET INDUSTRIES", industriesTitle: "Built for demanding environments.", industriesSub: "Solutions designed for industrial and infrastructure environments where access, safety, uptime and early detection matter.",
    model: "BUSINESS MODEL", modelTitle: "Technology that moves beyond the prototype.", modelSub: "Engineering projects, systems integration, industrial software and technology partnerships — moving from use case to field deployment and scalable products.",
    impact: "SOCIAL IMPACT", impactTitle: "Technology with purpose.", impactSub: "Alongside our core technology business, bxbii can support selected community and talent initiatives through educational and capability-building programs.",
    contact: "Build with us", contactSub: "Industrial use cases, technology partnerships, pilots and investment discussions.", contactBtn: "Start a conversation",
  },
  ar: {
    eyebrow: "عُمان • تكنولوجيا عميقة • ابتكار صناعي",
    hero: "نهندس ذكاء العالم المادي.",
    sub: "تطوّر bxbii تقنيات صناعية في تصميم أشباه الموصلات والروبوتات والأجهزة المتصلة والذكاء الاصطناعي الفيزيائي — لتحويل الذكاء إلى أنظمة تستشعر وتفهم وتقرر وتنفذ.",
    solutions: "استكشف تقنياتنا", about: "عن bxbii", domains: "مجالات التقنية", domainTitle: "من السيليكون إلى الآلات الذكية.", domainSub: "منظومة تقنية متكاملة تجمع الأجهزة والاستشعار والذكاء والتنفيذ في العالم الحقيقي.",
    flow: "من البيانات إلى الفعل", flowTitle: "استشعر. افهم. قرر. نفّذ.", flowSub: "نربط الحساسات والكاميرات بالذكاء والروبوتات والأنظمة التشغيلية، مع إبقاء الإنسان ضمن دائرة القرار عند الحاجة.",
    industries: "القطاعات المستهدفة", industriesTitle: "تقنيات للبيئات الأكثر تحديًا.", industriesSub: "حلول للبيئات الصناعية والبنية الأساسية حيث الوصول والسلامة ووقت التشغيل والكشف المبكر عوامل حاسمة.",
    model: "نموذج الأعمال", modelTitle: "تقنية تتجاوز النموذج الأولي.", modelSub: "مشاريع هندسية وتكامل أنظمة وبرمجيات صناعية وشراكات تقنية لنقل الحلول من حالة الاستخدام إلى التجارب الميدانية ثم المنتجات القابلة للتوسع.",
    impact: "الأثر المجتمعي", impactTitle: "تقنية تصنع أثرًا.", impactSub: "إلى جانب نشاطنا التقني الأساسي، يمكن لـ bxbii دعم مبادرات المجتمع وتنمية المواهب من خلال برامج تعليمية وبناء قدرات مختارة.",
    contact: "لنبنِ معًا", contactSub: "لحالات الاستخدام الصناعية والشراكات التقنية والتجارب الميدانية ومناقشات الاستثمار.", contactBtn: "ابدأ الحوار",
  },
} as const;

export function IndustrialHomePage({ partners }: { partners: PublicPartner[] }) {
  const { lang } = useLanguage();
  const ar = lang === "ar";
  const t = copy[lang];
  const text = (en: string, a: string) => (ar ? a : en);

  return <main className="overflow-hidden bg-[#050b13] text-white">
    <section className="relative min-h-[760px] overflow-hidden border-b border-white/10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,rgba(50,190,255,.18),transparent_28%),radial-gradient(circle_at_90%_72%,rgba(255,70,55,.15),transparent_24%),linear-gradient(115deg,#040a12,#071525_58%,#02070d)]" />
      <div className="absolute inset-0 opacity-20 hero-grid" />
      <div className="relative mx-auto grid min-h-[760px] max-w-7xl items-center gap-10 px-5 py-24 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:px-10">
        <div className={ar ? "text-right" : ""}>
          <span className="inline-flex rounded-full border border-white/15 bg-white/[.04] px-4 py-2 text-[11px] font-black tracking-[.2em] text-cyan-200/80">{t.eyebrow}</span>
          <h1 className="mt-7 max-w-4xl text-5xl font-black leading-[.95] tracking-[-.04em] sm:text-6xl lg:text-[76px]">{t.hero}</h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-white/60 sm:text-xl">{t.sub}</p>
          <div className={`mt-9 flex flex-wrap gap-3 ${ar ? "justify-end" : ""}`}>
            <Link href="/about-us" className="rounded-full bg-gradient-to-r from-red-500 to-orange-400 px-7 py-4 text-sm font-black shadow-xl shadow-red-950/30 transition hover:-translate-y-1">{t.solutions} →</Link>
            <Link href="/contact-us" className="rounded-full border border-white/20 bg-white/[.04] px-7 py-4 text-sm font-black hover:bg-white/10">{t.about}</Link>
          </div>
          <div className="mt-14 grid max-w-3xl grid-cols-2 gap-y-5 sm:grid-cols-4">
            {[["04",text("Technology domains","مجالات تقنية")],["INDUSTRIAL",text("Core focus","النشاط الأساسي")],["OMAN",text("Home base","القاعدة")],["GLOBAL",text("Expansion","التوسع")]].map(([n,l])=><div key={n} className="border-s border-white/10 ps-4"><strong className="block text-sm font-black text-cyan-200">{n}</strong><span className="mt-1 block text-[11px] text-white/45">{l}</span></div>)}
          </div>
        </div>
        <div className="relative hidden min-h-[540px] lg:block">
          <div className="absolute inset-4 rounded-[2rem] border border-white/10 bg-white/[.025] p-5 shadow-2xl shadow-black/50 backdrop-blur-sm"><img src="/images/semiconductor-hero.svg" alt="Original semiconductor illustration" className="h-full w-full rounded-[1.5rem] object-cover" /></div>
          <div className="absolute -bottom-2 -left-5 rounded-2xl border border-cyan-300/20 bg-[#07111d]/95 px-5 py-4"><span className="block text-[10px] tracking-[.2em] text-cyan-200/70">CORE TECHNOLOGY</span><strong className="mt-1 block text-sm">Semiconductor • Robotics • IoT</strong></div>
        </div>
      </div>
    </section>

    <section className="border-b border-white/10 bg-[#07111c] py-24"><div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10"><div className={`max-w-3xl ${ar ? "ms-auto text-right" : ""}`}><span className="text-[11px] font-black tracking-[.2em] text-red-400">{t.domains}</span><h2 className="mt-4 text-4xl font-black sm:text-5xl">{t.domainTitle}</h2><p className="mt-4 text-lg leading-8 text-white/50">{t.domainSub}</p></div><div className="mt-12 grid gap-5 md:grid-cols-2">{domains.map((d,i)=><Link href="/about-us" key={d.en} className="group overflow-hidden rounded-[1.7rem] border border-white/10 bg-[#091624] transition hover:-translate-y-1 hover:border-cyan-300/25"><div className="h-64 overflow-hidden"><img src={d.image} alt="" className="h-full w-full object-cover opacity-80 transition duration-700 group-hover:scale-105" /></div><div className={`p-7 ${ar ? "text-right" : ""}`}><span className="text-[10px] font-black tracking-[.18em] text-red-400">0{i+1}</span><h3 className="mt-2 text-2xl font-black">{ar?d.ar:d.en}</h3><p className="mt-3 text-sm leading-6 text-white/45">{ar?d.arDesc:d.enDesc}</p><span className="mt-5 inline-block text-sm font-black text-cyan-200">{text("Explore technology →","استكشف التقنية ←")}</span></div></Link>)}</div></div></section>

    <section className="bg-[#050b13] py-24"><div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[.9fr_1.1fr] lg:px-10"><div className={`flex flex-col justify-center ${ar?"text-right":""}`}><span className="text-[11px] font-black tracking-[.2em] text-cyan-200">{t.flow}</span><h2 className="mt-4 text-4xl font-black sm:text-5xl">{t.flowTitle}</h2><p className="mt-5 text-lg leading-8 text-white/50">{t.flowSub}</p><span className="mt-8 inline-flex w-fit rounded-full border border-white/10 px-5 py-3 text-xs font-bold text-white/55">Physical AI • Human oversight • Industrial intelligence</span></div><div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#081624] p-8"><div className="absolute inset-0 opacity-20 hero-grid"/><div className="relative grid gap-4 sm:grid-cols-4">{[["01","SENSE","الاستشعار"],["02","UNDERSTAND","الإدراك والتحليل"],["03","DECIDE","القرار"],["04","ACT","التنفيذ"]].map(([n,e,a],i)=><div key={n} className="relative rounded-2xl border border-white/10 bg-white/[.035] p-5"><span className="text-xs font-black text-red-400">{n}</span><h3 className="mt-10 text-sm font-black">{ar?a:e}</h3>{i<3&&<span className="absolute -right-3 top-1/2 z-10 hidden text-cyan-200 sm:block">→</span>}</div>)}</div><div className="relative mt-6 h-32 overflow-hidden rounded-2xl border border-white/10"><img src="/images/iot-connected.svg" alt="Original connected systems illustration" className="h-full w-full object-cover opacity-60" /></div></div></div></section>

    <section className="border-y border-white/10 bg-[#07111c] py-24"><div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10"><div className={`max-w-3xl ${ar?"ms-auto text-right":""}`}><span className="text-[11px] font-black tracking-[.2em] text-red-400">{t.industries}</span><h2 className="mt-4 text-4xl font-black sm:text-5xl">{t.industriesTitle}</h2><p className="mt-4 text-lg leading-8 text-white/50">{t.industriesSub}</p></div><div className="mt-12 grid gap-px overflow-hidden rounded-[1.7rem] border border-white/10 bg-white/10 md:grid-cols-2">{sectors.map(([e,a,d],i)=><div key={e} className={`bg-[#07111c] p-8 ${ar?"text-right":""}`}><span className="text-xs font-black text-cyan-200">0{i+1}</span><h3 className="mt-7 text-xl font-black">{ar?a:e}</h3><p className="mt-3 text-sm leading-6 text-white/45">{d}</p></div>)}</div></div></section>

    <section className="bg-[#050b13] py-24"><div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:px-10"><div className={`rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#0b1c2e] to-[#070d16] p-9 ${ar?"text-right":""}`}><span className="text-[11px] font-black tracking-[.2em] text-cyan-200">{t.model}</span><h2 className="mt-4 text-4xl font-black">{t.modelTitle}</h2><p className="mt-5 leading-8 text-white/50">{t.modelSub}</p><div className="mt-8 grid grid-cols-2 gap-3">{[text("Engineering projects","مشاريع هندسية"),text("Systems integration","تكامل الأنظمة"),text("Industrial software","برمجيات صناعية"),text("Technology partnerships","شراكات تقنية")].map(x=><div key={x} className="rounded-xl border border-white/10 bg-white/[.035] p-4 text-sm font-bold text-white/75">{x}</div>)}</div></div><div className={`flex flex-col justify-center ${ar?"text-right":""}`}><span className="text-[11px] font-black tracking-[.2em] text-red-400">{t.impact}</span><h2 className="mt-4 text-4xl font-black">{t.impactTitle}</h2><p className="mt-5 text-lg leading-8 text-white/50">{t.impactSub}</p><Link href="/training" className="mt-8 inline-flex w-fit rounded-full border border-white/15 px-6 py-3 text-sm font-black text-white/70 hover:bg-white/5">{text("Explore community initiatives","استكشف المبادرات المجتمعية")} →</Link></div></div></section>

    {partners.length>0&&<section className="border-t border-white/10 bg-[#07111c] py-20"><div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10"><span className="text-[11px] font-black tracking-[.2em] text-cyan-200">TECHNOLOGY NETWORK</span><h2 className={`mt-3 text-3xl font-black ${ar?"text-right":""}`}>{text("Strategic technology ecosystem","منظومة تقنية استراتيجية")}</h2><div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">{partners.slice(0,12).map(p=><div key={p.id} className="flex h-24 items-center justify-center rounded-2xl border border-white/10 bg-white/[.03] p-4"><img src={p.logoUrl} alt={p.name} className="max-h-11 max-w-[140px] object-contain opacity-70 grayscale"/></div>)}</div></div></section>}

    <section className="border-t border-white/10 bg-gradient-to-r from-red-600 to-orange-500 px-5 py-20"><div className={`mx-auto flex max-w-7xl flex-col justify-between gap-8 sm:flex-row sm:items-center ${ar?"sm:flex-row-reverse":""}`}><div className={ar?"text-right":""}><span className="text-[11px] font-black tracking-[.2em] text-white/70">bxbii</span><h2 className="mt-3 text-4xl font-black">{t.contact}</h2><p className="mt-3 max-w-2xl text-white/75">{t.contactSub}</p></div><Link href="/contact-us" className="rounded-full bg-white px-7 py-4 text-sm font-black text-red-600 shadow-xl">{t.contactBtn} →</Link></div></section>
  </main>;
}
