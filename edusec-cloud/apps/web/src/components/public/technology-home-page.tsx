"use client";

import Link from "next/link";
import { useLanguage } from "./language-provider";

const domains = [
  { en: "Semiconductor Design", ar: "تصميم أشباه الموصلات", code: "01", href: "/programs" },
  { en: "Robotics & Automation", ar: "الروبوتات والأتمتة", code: "02", href: "/programs" },
  { en: "IoT & Connected Devices", ar: "إنترنت الأشياء والأجهزة المتصلة", code: "03", href: "/programs" },
  { en: "Embedded Systems", ar: "الأنظمة المدمجة", code: "04", href: "/programs" },
];

export function TechnologyHomePage() {
  const { lang } = useLanguage();
  const ar = lang === "ar";
  const t = (en: string, arText: string) => ar ? arText : en;

  return (
    <main className="overflow-hidden bg-white text-slate-950">
      <section className="relative min-h-[760px] overflow-hidden bg-[#050b18] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_35%,rgba(67,104,255,.32),transparent_28%),radial-gradient(circle_at_55%_85%,rgba(30,210,190,.12),transparent_30%)]" />
        <div className="absolute inset-0 opacity-25 hero-grid" />
        <div className="absolute right-[-8%] top-[12%] h-[620px] w-[620px] rounded-full border border-blue-400/15" />
        <div className="absolute right-[4%] top-[24%] h-[430px] w-[430px] rounded-full border border-cyan-300/10" />
        <div className="relative mx-auto flex min-h-[760px] max-w-7xl items-center px-5 py-24 sm:px-8 lg:px-10">
          <div className={`max-w-4xl ${ar ? "text-right" : ""}`}>
            <div className="mb-7 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[.05] px-4 py-2 text-xs font-black tracking-[.16em] text-blue-200 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-cyan-300" /> {t("DEEP TECHNOLOGY • OMAN", "التقنيات العميقة • عُمان")}
            </div>
            <h1 className="max-w-4xl text-5xl font-black leading-[.96] tracking-tight sm:text-6xl lg:text-8xl">
              {t("Engineering the technologies behind tomorrow.", "نهندس تقنيات المستقبل.")}
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-white/65 sm:text-xl">
              {t("bxbii develops technology across semiconductor design, robotics, connected devices and embedded systems — turning advanced ideas into practical products.", "تعمل bxbii على تطوير تقنيات في تصميم أشباه الموصلات والروبوتات والأجهزة المتصلة والأنظمة المدمجة، وتحويل الأفكار المتقدمة إلى منتجات عملية.")}
            </p>
            <div className={`mt-10 flex flex-wrap gap-3 ${ar ? "justify-end" : ""}`}>
              <Link href="/about-us" className="rounded-full bg-blue-600 px-7 py-4 text-sm font-black shadow-xl shadow-blue-950/40 transition hover:-translate-y-1 hover:bg-blue-500">{t("Explore bxbii", "اكتشف bxbii")} →</Link>
              <Link href="/programs" className="rounded-full border border-white/15 bg-white/[.06] px-7 py-4 text-sm font-black backdrop-blur transition hover:bg-white/10">{t("Technology programs", "البرامج التقنية")}</Link>
            </div>
            <div className="mt-16 flex flex-wrap gap-x-10 gap-y-5 text-xs font-bold uppercase tracking-[.14em] text-white/35">
              <span>{t("Semiconductors", "أشباه الموصلات")}</span><span>{t("Robotics", "الروبوتات")}</span><span>IoT</span><span>{t("Embedded", "الأنظمة المدمجة")}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white py-8">
        <div className="mx-auto grid max-w-7xl gap-4 px-5 sm:px-8 md:grid-cols-4 lg:px-10">
          {domains.map((d) => <Link href={d.href} key={d.code} className={`group rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl ${ar ? "text-right" : ""}`}><span className="text-xs font-black text-blue-600">{d.code}</span><h3 className="mt-5 text-lg font-black">{ar ? d.ar : d.en}</h3><span className="mt-4 block text-xs font-bold text-slate-400 group-hover:text-blue-600">{t("Explore capability", "استكشف المجال")} →</span></Link>)}
        </div>
      </section>

      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className={`grid items-end gap-8 lg:grid-cols-[1.2fr_.8fr] ${ar ? "lg:grid-flow-col-dense" : ""}`}>
            <div className={ar ? "text-right" : ""}>
              <span className="text-xs font-black tracking-[.18em] text-blue-600">{t("WHAT WE BUILD", "ماذا نطوّر")}</span>
              <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">{t("From silicon to intelligent systems.", "من السيليكون إلى الأنظمة الذكية.")}</h2>
            </div>
            <p className={`text-lg leading-8 text-slate-500 ${ar ? "text-right" : ""}`}>{t("Our work sits at the intersection of hardware, software and intelligent systems — creating foundations for industrial and connected applications.", "يقع عملنا عند تقاطع العتاد والبرمجيات والأنظمة الذكية، لبناء أساس لتطبيقات صناعية ومتصلة.")}</p>
          </div>
          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              ["01", "Chip Design", "تصميم الشرائح", "Digital design, architecture and technology development."],
              ["02", "Robotics", "الروبوتات", "Autonomous machines, control systems and industrial automation."],
              ["03", "IoT", "إنترنت الأشياء", "Connected devices, sensors and intelligent edge solutions."],
              ["04", "Embedded", "الأنظمة المدمجة", "Hardware-software systems built for real-world environments."],
            ].map(([n,en,arTitle,desc]) => <article key={n} className={`rounded-[1.5rem] border border-slate-200 bg-white p-7 shadow-sm ${ar ? "text-right" : ""}`}><span className="text-xs font-black text-blue-600">{n}</span><h3 className="mt-8 text-2xl font-black">{ar ? arTitle : en}</h3><p className="mt-4 text-sm leading-7 text-slate-500">{t(desc, ["التصميم الرقمي وبنية الشرائح وتطوير التقنيات.", "الآلات المستقلة وأنظمة التحكم والأتمتة الصناعية.", "الأجهزة المتصلة والمستشعرات وحلول الحافة الذكية.", "أنظمة تجمع العتاد والبرمجيات للبيئات الواقعية."][Number(n)-1])}</p></article>)}
          </div>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:px-10">
          <div className={`rounded-[2rem] bg-[#07172f] p-10 text-white sm:p-14 ${ar ? "text-right" : ""}`}>
            <span className="text-xs font-black tracking-[.18em] text-cyan-300">{t("R&D MINDSET", "عقلية البحث والتطوير")}</span>
            <h2 className="mt-5 text-4xl font-black sm:text-5xl">{t("Prototype. Validate. Industrialize.", "طوّر النموذج. اختبر. حوّل إلى منتج.")}</h2>
            <p className="mt-6 text-lg leading-8 text-white/60">{t("We combine engineering, experimentation and product thinking to move technology from concept toward deployment.", "نجمع بين الهندسة والتجربة والتفكير بالمنتج لنقل التقنية من الفكرة إلى التطبيق.")}</p>
            <div className="mt-10 grid grid-cols-3 gap-3">{[["01","Prototype","النموذج"],["02","Validate","الاختبار"],["03","Deploy","التطبيق"]].map(([n,e,a])=><div key={n} className="rounded-xl border border-white/10 bg-white/[.04] p-4"><span className="text-xs text-cyan-300">{n}</span><b className="mt-5 block">{ar ? a : e}</b></div>)}</div>
          </div>
          <div className={`flex flex-col justify-center ${ar ? "text-right" : ""}`}>
            <span className="text-xs font-black tracking-[.18em] text-blue-600">{t("OMAN • GLOBAL", "عُمان • العالم")}</span>
            <h2 className="mt-4 text-4xl font-black sm:text-5xl">{t("Building technology from Oman, for the region and beyond.", "نبني التقنية من عُمان للمنطقة والعالم.")}</h2>
            <p className="mt-6 text-lg leading-8 text-slate-500">{t("Our ambition is to participate in the localization of advanced technology and the development of high-value technical capabilities.", "طموحنا هو المساهمة في توطين التقنيات المتقدمة وتطوير القدرات التقنية ذات القيمة العالية.")}</p>
            <div className="mt-8 flex flex-wrap gap-3"><span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold">Oman</span><span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold">Semiconductors</span><span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold">Robotics</span><span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold">IoT</span></div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className={`grid gap-8 lg:grid-cols-[1fr_2fr] ${ar ? "lg:grid-flow-col-dense" : ""}`}>
            <div className={ar ? "text-right" : ""}><span className="text-xs font-black tracking-[.18em] text-blue-600">{t("SOCIAL IMPACT", "الأثر المجتمعي")}</span><h2 className="mt-4 text-3xl font-black sm:text-4xl">{t("Technology should create opportunity.", "التقنية يجب أن تصنع الفرص.")}</h2></div>
            <div className={`rounded-[1.5rem] border border-slate-200 bg-white p-8 ${ar ? "text-right" : ""}`}><p className="text-lg leading-8 text-slate-600">{t("As part of our social responsibility, bxbii may support selected community initiatives, talent activities and knowledge programs. These initiatives complement our technology work; they are not the core business.", "ضمن مسؤوليتنا الاجتماعية، قد تدعم bxbii مبادرات مجتمعية مختارة وأنشطة للمواهب وبرامج معرفية. وتأتي هذه المبادرات مكملة لعملنا التقني وليست النشاط الرئيسي للشركة.")}</p><Link href="/contact" className="mt-6 inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-black text-white">{t("Partner with us", "تواصل للشراكة")} →</Link></div>
          </div>
        </div>
      </section>

      <section className="bg-blue-600 px-5 py-20 text-white"><div className={`mx-auto flex max-w-7xl flex-col justify-between gap-8 sm:flex-row sm:items-center ${ar ? "sm:flex-row-reverse" : ""}`}><div className={ar ? "text-right" : ""}><h2 className="text-4xl font-black sm:text-5xl">{t("Let’s build what comes next.", "لنبنِ ما هو قادم.")}</h2><p className="mt-3 text-white/75">{t("Technology partnerships, product development and strategic collaboration.", "شراكات تقنية وتطوير منتجات وتعاون استراتيجي.")}</p></div><Link href="/contact" className="rounded-full bg-white px-7 py-4 font-black text-blue-700">{t("Start a conversation", "ابدأ الحوار")} →</Link></div></section>
    </main>
  );
}
