"use client";
import Link from "next/link";
import {useLanguage} from "./language-provider";

const domains=[
 ["01","Semiconductor Design","تصميم أشباه الموصلات","Designing next-generation chips and integrated hardware systems.","/images/semiconductor-hero.svg"],
 ["02","Robotics & Automation","الروبوتات والأتمتة","Robots and autonomous systems for real-world industrial applications.","/images/robotics-industrial.svg"],
 ["03","IoT & Connected Devices","إنترنت الأشياء والأجهزة المتصلة","Intelligent devices and sensor networks for industrial environments.","/images/iot-connected.svg"],
 ["04","Embedded Systems","الأنظمة المدمجة","Reliable hardware and software foundations for critical applications.","/images/semiconductor-hero.svg"]
];
const industries=[["Oil & Gas","النفط والغاز"],["Mining & Manufacturing","التعدين والتصنيع"],["Energy & Utilities","الطاقة والمرافق"],["Ports & Infrastructure","الموانئ والبنية الأساسية"]];

export function BxbiiHomePage(){
 const{lang}=useLanguage();
 const ar=lang==="ar";
 const t=(e:string,a:string)=>ar?a:e;
 return <main className="overflow-hidden bg-[#050b13] text-white">
  <section className="relative min-h-[760px] border-b border-white/10">
   <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_35%,rgba(54,181,255,.20),transparent_29%),radial-gradient(circle_at_90%_80%,rgba(255,65,48,.15),transparent_24%),linear-gradient(118deg,#030812,#071525_55%,#02070d)]"/>
   <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] [background-size:72px_72px]"/>
   <div className="relative mx-auto grid min-h-[760px] max-w-7xl items-center gap-8 px-5 pb-16 pt-24 sm:px-8 lg:grid-cols-[.98fr_1.02fr] lg:px-10">
    <div className={ar?"text-right":""}>
     <span className="text-xs font-black tracking-[.30em] text-cyan-200">{t("OMAN'S DEEP-TECH COMPANY","شركة عُمانية للتكنولوجيا العميقة")}</span>
     <h1 className="mt-6 whitespace-pre-line text-[48px] font-black leading-[.88] tracking-[-.055em] sm:text-6xl lg:text-[72px]">{t("SEMICONDUCTORS\nROBOTICS\nAND IOT","أشباه الموصلات\nالروبوتات\nوإنترنت الأشياء")}</h1>
     <h2 className="mt-7 whitespace-pre-line text-2xl font-black leading-[1.05] text-cyan-200/80 sm:text-3xl">{t("FROM INTELLIGENCE\nTO IMPACT IN THE REAL WORLD","من الذكاء\nإلى أثر في العالم الحقيقي")}</h2>
     <p className="mt-6 max-w-xl text-[15px] leading-7 text-white/58">{t("We design, develop and integrate advanced technologies in semiconductors, robotics, IoT and embedded systems to solve real industrial challenges and build a smarter, more resilient future.","نصمم ونطوّر وندمج تقنيات متقدمة في أشباه الموصلات والروبوتات وإنترنت الأشياء والأنظمة المدمجة لحل تحديات صناعية حقيقية وبناء مستقبل أكثر ذكاءً ومرونة.")}</p>
     <div className={`mt-8 flex flex-wrap gap-3 ${ar?"justify-end":""}`}>
      <Link href="/solutions" className="rounded-lg bg-gradient-to-r from-red-500 to-orange-400 px-7 py-4 text-sm font-black shadow-lg shadow-red-950/20">{t("Explore Our Solutions","استكشف حلولنا")} →</Link>
      <Link href="/about-us" className="rounded-lg border border-white/25 bg-white/[.02] px-7 py-4 text-sm font-black">{t("About bxbii","عن bxbii")} ▷</Link>
     </div>
     <div className={`mt-11 flex flex-wrap gap-6 text-xs font-bold text-white/55 ${ar?"justify-end":""}`}>
      <span>▣ {t("Deep Technology","تكنولوجيا عميقة")}</span><span>◉ {t("Real-World Impact","أثر في العالم الحقيقي")}</span><span>♧ {t("Made in Oman","صناعة عُمانية")}</span>
     </div>
    </div>
    <div className="relative hidden min-h-[610px] lg:block">
     <div className="absolute right-0 top-2 z-10 flex flex-col gap-2 border-l border-white/10 pl-4 text-[10px] font-bold uppercase tracking-[.18em] text-white/40">
      <span>{t("People","الأفراد")}</span><span className="text-white/65">{t("Technology","التقنية")}</span><span>{t("Industries","القطاعات")}</span><span className="text-cyan-200">{t("A Brighter Oman","عُمان أكثر إشراقًا")}</span><i className="mt-2 block h-0.5 w-5 bg-red-400"/>
     </div>
     <div className="absolute inset-x-0 bottom-4 top-14 overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#081522] shadow-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_62%_35%,rgba(105,211,255,.24),transparent_28%),linear-gradient(135deg,#10283c,#07111c_48%,#03070c)]"/>
      <div className="absolute inset-x-8 bottom-0 h-44 bg-[radial-gradient(ellipse_at_center,rgba(255,105,54,.20),transparent_62%)]"/>
      <div className="absolute left-[28%] top-[26%] h-56 w-56 rounded-full border border-cyan-200/15 bg-white/[.025] shadow-[0_0_90px_rgba(48,185,255,.10)]"/>
      <div className="absolute left-[40%] top-[34%] h-24 w-24 rotate-45 rounded-[1.1rem] border border-orange-300/60 bg-[#0a1520] shadow-[0_0_45px_rgba(255,130,50,.25)]"><div className="m-5 h-12 w-12 rounded border border-orange-300/50 bg-[repeating-linear-gradient(0deg,transparent_0_4px,rgba(255,150,70,.24)_5px),repeating-linear-gradient(90deg,transparent_0_4px,rgba(255,150,70,.24)_5px)]"/></div>
      <div className="absolute bottom-9 left-9 rounded-xl border border-cyan-200/15 bg-[#07111d]/90 px-5 py-4 backdrop-blur-md"><span className="text-[10px] tracking-[.2em] text-cyan-200">CORE TECHNOLOGY</span><strong className="mt-1 block text-sm">Semiconductor • Robotics • IoT</strong></div>
      <div className="absolute bottom-0 right-0 h-2/3 w-1/2 bg-[linear-gradient(145deg,transparent_35%,rgba(255,255,255,.06)_36%,transparent_37%),linear-gradient(165deg,transparent_47%,rgba(255,255,255,.04)_48%,transparent_49%)]"/>
     </div>
    </div>
   </div>
  </section>

  <section className="border-b border-white/10 bg-[#07111c] py-20">
   <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
    <div className={`flex items-end justify-between gap-6 ${ar?"flex-row-reverse text-right":""}`}>
     <div><span className="text-[11px] font-black tracking-[.2em] text-cyan-200">{t("OUR TECHNOLOGY DOMAINS","مجالاتنا التقنية")}</span><h2 className="mt-3 text-4xl font-black tracking-tight">{t("Our Technology Domains","مجالاتنا التقنية")}</h2><p className="mt-2 text-sm text-white/45">{t("Integrated technologies for a smarter, safer and more productive world.","تقنيات متكاملة لعالم أكثر ذكاءً وأمانًا وإنتاجية.")}</p></div>
     <Link href="/technology" className="hidden rounded-lg border border-white/20 px-5 py-3 text-xs font-black sm:block">{t("View All Solutions →","عرض جميع الحلول ←")}</Link>
    </div>
    <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
     {domains.map(([n,en,a,d,img])=><Link href="/technology" key={n} className="group overflow-hidden rounded-2xl border border-white/10 bg-[#091624] transition duration-300 hover:-translate-y-1 hover:border-cyan-300/30 hover:shadow-xl hover:shadow-cyan-950/20">
      <div className="relative h-40 overflow-hidden bg-[#0b1a29]"><img src={img} alt="" className="h-full w-full object-cover opacity-75 transition duration-500 group-hover:scale-105"/><div className="absolute inset-0 bg-gradient-to-t from-[#091624] via-transparent to-transparent"/></div>
      <div className={`p-5 ${ar?"text-right":""}`}><span className="text-[10px] font-black text-red-400">{n}</span><h3 className="mt-2 text-lg font-black">{ar?a:en}</h3><p className="mt-2 text-xs leading-5 text-white/45">{t(d,d)}</p><span className={`mt-5 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-cyan-200 ${ar?"rotate-180":""}`}>→</span></div>
     </Link>)}
    </div>
    <div className="mt-7 grid grid-cols-2 overflow-hidden rounded-xl border border-white/10 md:grid-cols-4">
     {[['4',t('Technology Domains','مجالات تقنية')],['∞',t('Real-World Possibilities','إمكانات العالم الحقيقي')],['100%',t("Commitment to Oman's Future",'التزام بمستقبل عُمان')],['OMAN',t('Innovation • Global Impact','ابتكار • أثر عالمي')]].map(([n,l])=><div key={n} className="border-white/10 bg-[#07111c] p-5 md:border-r last:border-r-0"><strong className="text-2xl font-black">{n}</strong><span className="mt-1 block text-[10px] text-white/45">{l}</span></div>)}
    </div>
   </div>
  </section>

  <section className="bg-[#050b13] py-20">
   <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
    <div className={`grid gap-6 lg:grid-cols-[.8fr_1.2fr] ${ar?"text-right":""}`}>
     <div className="flex flex-col justify-center"><span className="text-[11px] font-black tracking-[.2em] text-red-400">{t("BEYOND BUSINESS","ما بعد الأعمال")}</span><h2 className="mt-4 text-4xl font-black">{t("Technology with purpose.","تقنية تصنع أثرًا.")}</h2><p className="mt-5 text-sm leading-7 text-white/50">{t("We believe advanced technology should create real opportunities for people and communities. Our capability-building initiatives support long-term technology development in Oman.","نؤمن بأن التكنولوجيا المتقدمة يجب أن تصنع فرصًا حقيقية للأفراد والمجتمعات. وتدعم مبادراتنا لبناء القدرات تطوير التكنولوجيا على المدى الطويل في عُمان.")}</p><Link href="/impact" className="mt-7 w-fit rounded-lg border border-white/20 px-5 py-3 text-xs font-black">{t("Our Impact →","أثرنا ←")}</Link></div>
     <div className="grid gap-5 sm:grid-cols-2"><div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#0d2032] to-[#08111b] p-8"><span className="text-4xl">⌁</span><h3 className="mt-12 text-xl font-black">{t("Building Local Talent","بناء المواهب المحلية")}</h3><p className="mt-3 text-sm text-white/45">{t("Technology and talent initiatives aligned with long-term capability building.","مبادرات تقنية ومواهب تدعم بناء القدرات على المدى الطويل.")}</p></div><div className="rounded-2xl border border-white/10 bg-gradient-to-br from-[#101d2d] to-[#08111b] p-8"><span className="text-4xl">◈</span><h3 className="mt-12 text-xl font-black">{t("Advanced Technology for Oman","تقنية متقدمة لعُمان")}</h3><p className="mt-3 text-sm text-white/45">{t("Turning deep technology into practical opportunities for industry and society.","تحويل التكنولوجيا العميقة إلى فرص عملية للصناعة والمجتمع.")}</p></div></div>
    </div>
   </div>
  </section>

  <section className="border-t border-white/10 bg-[#07111c] py-16">
   <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10"><div className={`mb-8 ${ar?"text-right":""}`}><span className="text-[11px] font-black tracking-[.2em] text-cyan-200">{t("INDUSTRIES","القطاعات")}</span><h2 className="mt-3 text-3xl font-black">{t("Built for demanding environments.","مصممة للبيئات الأكثر تحديًا.")}</h2></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{industries.map(([e,a])=><Link key={e} href="/industries" className="rounded-xl border border-white/10 bg-white/[.025] p-5 text-sm font-black text-white/75 transition hover:border-cyan-300/25 hover:bg-white/[.04]">{ar?a:e} <span className="float-right text-cyan-200">→</span></Link>)}</div></div>
  </section>
 </main>
}
