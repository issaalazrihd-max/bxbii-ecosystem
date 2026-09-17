"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { publicApi } from "@/lib/public-api";
import { useLanguage } from "./language-provider";

type PageKey = "technology" | "solutions" | "industries" | "rd" | "about" | "contact" | "impact";
type Card = [string, string, string, string, string];

type PageData = {
  e: string; a: string; t: string; ta: string; i: string; ia: string; c: Card[];
};

const pages: Record<PageKey, PageData> = {
  technology: { e:"TECHNOLOGY STACK", a:"منظومة التقنية", t:"Engineering the intelligence layer of the physical world", ta:"نهندس طبقة الذكاء للعالم المادي", i:"bxbii brings together semiconductor design, embedded systems, sensing, connected devices, robotics and physical AI into an integrated technology stack.", ia:"تجمع bxbii بين تصميم أشباه الموصلات والأنظمة المدمجة والاستشعار والأجهزة المتصلة والروبوتات والذكاء الاصطناعي الفيزيائي ضمن منظومة متكاملة.", c:[
    ["01","Semiconductor Design","تصميم أشباه الموصلات","Chip, electronics architecture and hardware-oriented product development.","تطوير الشرائح وهندسة الإلكترونيات والمنتجات القائمة على العتاد."],
    ["02","Embedded Systems","الأنظمة المدمجة","Reliable hardware/software foundations for connected and critical devices.","أسس موثوقة للعتاد والبرمجيات للأجهزة المتصلة والحساسة."],
    ["03","Sensors & IoT","الحساسات وإنترنت الأشياء","Connected sensing, telemetry and digital-twin foundations for industry.","حلول الاستشعار المتصل والقياس عن بُعد وأسس التوأم الرقمي للقطاع الصناعي."],
    ["04","Robotics & Physical AI","الروبوتات والذكاء الفيزيائي","Perception, computer vision and robotic systems connecting intelligence with action.","الإدراك والرؤية الحاسوبية والأنظمة الروبوتية لربط الذكاء بالفعل."]]},
  solutions: { e:"SOLUTIONS", a:"الحلول", t:"From industrial challenge to deployable technology", ta:"من التحدي الصناعي إلى تقنية قابلة للتطبيق", i:"We engineer technology around measurable operational problems — inspection, monitoring, safety, asset visibility and automation.", ia:"نطوّر التقنية حول تحديات تشغيلية قابلة للقياس — التفتيش والمراقبة والسلامة ورؤية الأصول والأتمتة.", c:[
    ["01","Industrial Inspection","التفتيش الصناعي","Computer vision, sensors and robotic systems for inspection workflows.","الرؤية الحاسوبية والحساسات والأنظمة الروبوتية لسير أعمال التفتيش."],
    ["02","Safety & Monitoring","السلامة والمراقبة","Continuous sensing and intelligent alerts for demanding environments.","استشعار مستمر وتنبيهات ذكية للبيئات التي تتطلب أعلى مستويات الاعتمادية."],
    ["03","Predictive Maintenance","الصيانة التنبؤية","Connected equipment data and analytics for maintenance visibility.","بيانات المعدات المتصلة والتحليلات لتحسين الرؤية واتخاذ قرارات الصيانة."],
    ["04","Smart Infrastructure","البنية الأساسية الذكية","Integrated sensing, edge intelligence and connected systems for critical assets.","الاستشعار المتكامل والذكاء الطرفي والأنظمة المتصلة للأصول الحيوية."]]},
  industries: { e:"INDUSTRIES", a:"القطاعات", t:"Technology for environments where reliability matters", ta:"تقنية للبيئات التي تتطلب الاعتمادية", i:"bxbii focuses on industrial and infrastructure contexts where early detection, safety, uptime and operational intelligence create tangible value.", ia:"تركز bxbii على البيئات الصناعية والبنية الأساسية حيث يصنع الكشف المبكر والسلامة واستمرارية التشغيل والذكاء التشغيلي قيمة ملموسة.", c:[
    ["01","Oil & Gas","النفط والغاز","Inspection, monitoring, safety and operational intelligence.","التفتيش والمراقبة والسلامة والذكاء التشغيلي."],
    ["02","Mining & Manufacturing","التعدين والتصنيع","Equipment visibility, defect detection and industrial automation.","رؤية المعدات واكتشاف العيوب والأتمتة الصناعية."],
    ["03","Energy & Utilities","الطاقة والمرافق","Connected assets, monitoring and predictive operations.","الأصول المتصلة والمراقبة والتشغيل التنبؤي."],
    ["04","Ports, Airports & Infrastructure","الموانئ والمطارات والبنية الأساسية","Technology for critical assets and field operations.","تقنيات للأصول الحيوية والعمليات الميدانية."]]},
  rd: { e:"R&D", a:"البحث والتطوير", t:"Build, test, learn — then move technology into the field", ta:"نبني ونختبر ونتعلم — ثم ننقل التقنية إلى الميدان", i:"Our R&D connects technical exploration with real-world use cases, partnerships and product pathways.", ia:"يربط البحث والتطوير لدينا الاستكشاف التقني بحالات استخدام واقعية وشراكات ومسارات للمنتجات.", c:[
    ["01","Applied AI","الذكاء الاصطناعي التطبيقي","Models and computer vision for industrial perception and decision support.","نماذج الذكاء الاصطناعي والرؤية الحاسوبية للإدراك الصناعي ودعم اتخاذ القرار."],
    ["02","Edge & Embedded","الحوسبة الطرفية والأنظمة المدمجة","Efficient intelligence close to sensors, devices and machines.","ذكاء فعال قريب من الحساسات والأجهزة والآلات."],
    ["03","Robotics","الروبوتات","Robotic platforms for inspection, monitoring and controlled field tasks.","منصات روبوتية للتفتيش والمراقبة والمهام الميدانية المنضبطة."],
    ["04","Prototyping","النمذجة التقنية","Rapid validation of hardware, software and integrated systems.","التحقق السريع من العتاد والبرمجيات والأنظمة المتكاملة."]]},
  about: { e:"ABOUT BXBII", a:"عن bxbii", t:"An Omani deep-tech company building for the real world", ta:"شركة عُمانية للتكنولوجيا العميقة تبني حلولًا للعالم الحقيقي", i:"bxbii creates and integrates hardware, intelligent systems and connected technologies from Oman for regional and international opportunities.", ia:"تطوّر bxbii وتدمج الأجهزة والأنظمة الذكية والتقنيات المتصلة من عُمان للفرص الإقليمية والدولية.", c:[
    ["01","Core Business","النشاط الأساسي","Semiconductors, robotics, IoT, embedded systems and industrial AI.","أشباه الموصلات والروبوتات وإنترنت الأشياء والأنظمة المدمجة والذكاء الاصطناعي الصناعي."],
    ["02","Engineering Mindset","عقلية هندسية","Technology developed around use cases, constraints and deployment realities.","تقنيات تُطوّر وفق حالات الاستخدام والقيود ومتطلبات التطبيق الفعلي."],
    ["03","Partnerships","الشراكات","Technical and commercial partnerships extend capabilities and market reach.","شراكات تقنية وتجارية توسّع القدرات والوصول إلى الأسواق."],
    ["04","Made in Oman","صناعة عُمانية","Building technical capability, products and opportunities from Oman.","بناء القدرات التقنية والمنتجات والفرص انطلاقًا من عُمان."]]},
  contact: { e:"LET'S BUILD", a:"لنبنِ معًا", t:"Have an industrial problem worth solving", ta:"لديك تحدٍ صناعي يستحق الحل", i:"Tell us what you are trying to inspect, connect, automate or build. We can explore the technology pathway together.", ia:"أخبرنا بما تريد تفتيشه أو ربطه أو أتمتته أو بناءه، ولنستكشف معًا المسار التقني المناسب.", c:[
    ["01","Technology Partnerships","شراكات تقنية","Co-development, technology transfer and strategic technical collaboration.","التطوير المشترك ونقل التقنية والتعاون التقني الاستراتيجي."],
    ["02","Industrial Projects","مشاريع صناعية","Inspection, monitoring, automation and connected-systems requirements.","متطلبات التفتيش والمراقبة والأتمتة والأنظمة المتصلة."],
    ["03","Product Development","تطوير المنتجات","Move an idea from technical concept toward a validated product pathway.","نقل الفكرة من المفهوم التقني نحو مسار منتج قابل للتحقق والتطوير."],
    ["04","General Enquiries","استفسارات عامة","Company, partnership and business enquiries.","استفسارات الشركة والشراكات والأعمال."]]},
  impact: { e:"TECHNOLOGY WITH PURPOSE", a:"تقنية تصنع أثرًا", t:"Capability building is part of our wider impact", ta:"بناء القدرات جزء من أثرنا الأوسع", i:"Education and talent initiatives may be delivered as complementary social-impact programs, while bxbii's core identity remains deep-tech product and industrial technology.", ia:"يمكن تنفيذ مبادرات التعليم وبناء المواهب كبرامج أثر مجتمعي مكملة، بينما تبقى هوية bxbii الأساسية في المنتجات والتقنيات الصناعية العميقة.", c:[
    ["01","Talent Development","تطوير المواهب","Selected initiatives that expose local talent to emerging technologies.","مبادرات مختارة تتيح للمواهب المحلية التعرف على التقنيات الناشئة."],
    ["02","Industry Awareness","الوعي الصناعي","Practical initiatives connecting people with real industrial challenges.","مبادرات عملية تربط الأفراد بالتحديات الصناعية الحقيقية."],
    ["03","Knowledge Transfer","نقل المعرفة","Sharing technical knowledge through partnerships and applied initiatives.","مشاركة المعرفة التقنية من خلال الشراكات والمبادرات التطبيقية."],
    ["04","Future Capability","قدرات المستقبل","Supporting long-term technical capability in Oman where appropriate.","دعم بناء القدرات التقنية طويلة المدى في عُمان حيثما كان ذلك مناسبًا."]]}
};

const art = [
  "from-[#101827] via-[#18324a] to-[#00b8d9]",
  "from-[#20122f] via-[#35215c] to-[#ff536d]",
  "from-[#071b1d] via-[#123e43] to-[#20c997]",
  "from-[#111827] via-[#1e3a5f] to-[#38bdf8]",
];

function ContactForm(){
  const {lang}=useLanguage(); const ar=lang==="ar";
  const [status,setStatus]=useState<"idle"|"sending"|"success"|"error">("idle");
  const [values,setValues]=useState({name:"",email:"",phone:"",subject:"",message:""});
  const t=(e:string,a:string)=>ar?a:e;
  useEffect(()=>{if(window.location.hash!=="#contact-form")return;const timer=window.setTimeout(()=>document.getElementById("contact-form")?.scrollIntoView({behavior:"smooth",block:"start"}),120);return()=>window.clearTimeout(timer)},[]);
  async function submit(e:FormEvent){e.preventDefault();setStatus("sending");const ok=await publicApi.submitContactForm(values);setStatus(ok?"success":"error");if(ok)setValues({name:"",email:"",phone:"",subject:"",message:""});}
  const input="w-full rounded-xl border border-slate-700/80 bg-[#0b1828] px-5 py-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-cyan-300/50";
  return <section id="contact-form" className="scroll-mt-24 border-t border-white/10 bg-[#07111d] py-20"><div className={`mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 ${ar?"text-right":""}`}><div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-start"><div><span className="text-[10px] font-black tracking-[.24em] text-cyan-200">{t("CONTACT BXBII","تواصل مع BXBII")}</span><h2 className="mt-4 text-4xl font-black tracking-[-.04em] text-white sm:text-5xl">{t("Send us a message","أرسل لنا رسالة")}</h2><p className="mt-5 max-w-xl text-sm leading-7 text-white/50">{t("Tell us about your idea, project or challenge, and let's explore what we can build together.","أخبرنا عن فكرتك أو مشروعك أو التحدي الذي تواجهه، ولنستكشف معًا ما يمكننا بناؤه.")}</p><a href="mailto:info@bxbii.com" className="mt-7 inline-block text-sm font-bold text-cyan-200">info@bxbii.com</a></div><form onSubmit={submit} className="rounded-3xl border border-white/10 bg-white/[.04] p-6 shadow-2xl sm:p-8"><div className="grid gap-4 sm:grid-cols-2"><input className={input} required value={values.name} onChange={e=>setValues(v=>({...v,name:e.target.value}))} placeholder={t("Name","الاسم")}/><input className={input} required type="email" value={values.email} onChange={e=>setValues(v=>({...v,email:e.target.value}))} placeholder={t("Email","البريد الإلكتروني")}/><input className={input} value={values.phone} onChange={e=>setValues(v=>({...v,phone:e.target.value}))} placeholder={t("Phone","الهاتف")}/><input className={input} value={values.subject} onChange={e=>setValues(v=>({...v,subject:e.target.value}))} placeholder={t("Subject","الموضوع")}/></div><textarea className={`${input} mt-4 min-h-40`} required value={values.message} onChange={e=>setValues(v=>({...v,message:e.target.value}))} placeholder={t("Tell us what you need...","اكتب تفاصيل طلبك...")}/><button disabled={status==="sending"} className="mt-4 w-full rounded-xl bg-white px-6 py-4 text-sm font-black text-[#07111d] transition hover:bg-cyan-100 disabled:opacity-60">{status==="sending"?t("Sending...","جارٍ الإرسال"):t("Send message","إرسال الرسالة")} {ar?"←":"→"}</button>{status==="success"&&<p className="mt-4 text-sm font-semibold text-emerald-300">{t("Your message has been sent.","تم إرسال رسالتك بنجاح.")}</p>}{status==="error"&&<p className="mt-4 text-sm font-semibold text-rose-300">{t("Something went wrong. Please try again.","حدث خطأ. حاول مرة أخرى.")}</p>}</form></div></div></section>;
}

export function ProgramThemePage({page}:{page:PageKey}){
  const {lang}=useLanguage(); const ar=lang==="ar"; const d=pages[page]; const t=(e:string,a:string)=>ar?a:e;
  const links:[string,string][]=[['/technology',t('Technology','التكنولوجيا')],['/solutions',t('Solutions','الحلول')],['/industries',t('Industries','القطاعات')],['/rd',t('R&D','البحث والتطوير')]];
  return <main className="min-h-screen bg-[#f7f8fa] text-slate-900">
    <section className="relative overflow-hidden bg-[#07111d] py-24 text-white sm:py-32">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(0,194,218,.22),transparent_30%),radial-gradient(circle_at_12%_82%,rgba(255,83,109,.15),transparent_30%)]" />
      <div className={`relative mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 ${ar?"text-right":""}`}>
        <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[.28em] text-cyan-200"><span>BXBII</span><span className="h-px w-8 bg-white/30"/><span>{ar?d.a:d.e}</span></div>
        <h1 className="mt-6 max-w-5xl text-5xl font-black tracking-[-.06em] sm:text-7xl">{t(d.t,d.ta)}</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-white/55">{t(d.i,d.ia)}</p>
      </div>
    </section>

    <nav className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className={`mx-auto flex max-w-7xl gap-2 overflow-x-auto px-5 py-3 sm:px-8 lg:px-10 ${ar?"flex-row-reverse":""}`}>
        {links.map(([href,label])=><Link key={href} href={href} className="whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-black text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">{label}</Link>)}
        <Link href="/programs" className="whitespace-nowrap rounded-xl bg-[#07111d] px-4 py-2.5 text-xs font-black text-white">{t('Training','التدريب')}</Link>
      </div>
    </nav>

    <section className="py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
        <div className={`mb-8 flex items-end justify-between gap-6 ${ar?"text-right":""}`}><div><span className="text-[10px] font-black uppercase tracking-[.24em] text-red-500">01 / {t('Explore','استكشف')}</span><h2 className="mt-3 text-3xl font-black sm:text-4xl">{t('Capabilities and focus areas','القدرات ومجالات التركيز')}</h2></div><span className="text-sm text-slate-400">{d.c.length} {t('areas','مجالات')}</span></div>
        <div className="grid gap-5 md:grid-cols-2">
          {d.c.map((c,i)=><article key={c[0]} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className={`relative h-48 bg-gradient-to-br ${art[i%art.length]}`}><div className="absolute inset-0 opacity-20 bg-[linear-gradient(135deg,transparent_40%,rgba(255,255,255,.35)_41%,transparent_42%)]"/><div className={`absolute bottom-5 ${ar?'right-5 text-right':'left-5'} text-white`}><span className="text-[10px] font-bold uppercase tracking-[.18em] text-white/65">{c[0]}</span><h2 className="mt-1 text-2xl font-black leading-tight">{t(c[1],c[2])}</h2></div></div>
            <div className={`p-6 ${ar?'text-right':''}`}><p className="min-h-[72px] text-sm leading-6 text-slate-500">{t(c[3],c[4])}</p><div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5 text-[10px] font-black uppercase tracking-[.18em] text-red-500"><span>{t('BXBII','BXBII')}</span><span>{ar?'←':'→'}</span></div></div>
          </article>)}
        </div>
      </div>
    </section>

    <section className="border-t border-slate-200 bg-white py-20"><div className={`mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 ${ar?'text-right':''}`}><div className="grid gap-8 rounded-3xl bg-[#07111d] p-8 text-white sm:p-12 lg:grid-cols-[1fr_auto] lg:items-center"><div><span className="text-[10px] font-black uppercase tracking-[.24em] text-cyan-200">02 / BXBII</span><h2 className="mt-4 text-3xl font-black sm:text-4xl">{t('Build what comes next','لنبنِ ما يأتي بعد ذلك')}</h2><p className="mt-4 max-w-2xl leading-7 text-white/50">{t('Connect with bxbii to discuss technology, industrial projects, partnerships or capability building.','تواصل مع bxbii لمناقشة التقنية والمشاريع الصناعية والشراكات وبناء القدرات.')}</p></div><Link href="/contact-us#contact-form" className="rounded-xl bg-white px-6 py-4 text-center text-sm font-black text-[#07111d] transition hover:bg-cyan-100">{t('Start a conversation','ابدأ محادثة')} {ar?'←':'→'}</Link></div></div></section>

    {page==='contact'&&<ContactForm/>}
  </main>;
}
