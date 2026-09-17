"use client";
import Link from "next/link";
import { useLanguage } from "./language-provider";

type PageKey="technology"|"solutions"|"industries"|"rd"|"about"|"contact"|"impact";
type Card=[string,string,string,string,string];
const pages:Record<PageKey,{e:string;a:string;t:string;ta:string;i:string;ia:string;c:Card[]}>= {
 technology:{e:"TECHNOLOGY",a:"التقنية",t:"Engineering intelligence for the physical world.",ta:"نهندس الذكاء للعالم الحقيقي.",i:"bxbii connects semiconductor design, embedded systems, sensing, connected devices and robotics into an integrated technology stack.",ia:"تربط bxbii بين تصميم أشباه الموصلات والأنظمة المدمجة والاستشعار والأجهزة المتصلة والروبوتات ضمن منظومة تقنية متكاملة.",c:[
 ["01","Semiconductor Design","تصميم أشباه الموصلات","Chip, electronics architecture and hardware-oriented development.","تصميم الشرائح والبنية الإلكترونية وتطوير المنتجات المعتمدة على العتاد."],["02","Embedded Systems","الأنظمة المدمجة","Reliable hardware and software foundations for connected devices.","أسس موثوقة للعتاد والبرمجيات للأجهزة والأنظمة المتصلة."],["03","Sensors & IoT","الحساسات وإنترنت الأشياء","Connected sensing, telemetry and edge-ready systems.","الاستشعار المتصل والقياس عن بُعد والأنظمة الجاهزة للحوسبة الطرفية."],["04","Robotics & Physical AI","الروبوتات والذكاء الفيزيائي","Perception, vision and robotic systems connecting intelligence with action.","الإدراك والرؤية والأنظمة الروبوتية التي تربط الذكاء بالفعل."]]},
 solutions:{e:"SOLUTIONS",a:"الحلول",t:"From industrial challenge to deployable technology.",ta:"من التحدي الصناعي إلى تقنية قابلة للتطبيق.",i:"We engineer technology around measurable operational problems: inspection, monitoring, safety, asset visibility and automation.",ia:"نطوّر التقنية حول تحديات تشغيلية قابلة للقياس: التفتيش والمراقبة والسلامة ورؤية الأصول والأتمتة.",c:[
 ["01","Industrial Inspection","التفتيش الصناعي","Computer vision, sensors and robotic systems for inspection workflows.","الرؤية الحاسوبية والحساسات والأنظمة الروبوتية لعمليات التفتيش."],["02","Safety & Monitoring","السلامة والمراقبة","Continuous sensing and intelligent alerts for demanding environments.","استشعار مستمر وتنبيهات ذكية للبيئات التشغيلية الصعبة."],["03","Predictive Maintenance","الصيانة التنبؤية","Connected equipment data and analytics for maintenance visibility.","بيانات المعدات المتصلة والتحليلات لتحسين رؤية الصيانة."],["04","Smart Infrastructure","البنية الأساسية الذكية","Integrated sensing, edge intelligence and connected systems.","الاستشعار المتكامل والذكاء الطرفي والأنظمة المتصلة."]]},
 industries:{e:"INDUSTRIES",a:"القطاعات",t:"Technology for environments where reliability matters.",ta:"تقنية للبيئات التي تتطلب الاعتمادية.",i:"bxbii focuses on industrial and infrastructure contexts where safety, uptime and operational intelligence create tangible value.",ia:"تركز bxbii على البيئات الصناعية والبنية الأساسية حيث تصنع السلامة واستمرارية التشغيل والذكاء التشغيلي قيمة ملموسة.",c:[
 ["01","Oil & Gas","النفط والغاز","Inspection, monitoring, safety and operational intelligence.","التفتيش والمراقبة والسلامة والذكاء التشغيلي."],["02","Mining & Manufacturing","التعدين والتصنيع","Equipment visibility, defect detection and industrial automation.","رؤية المعدات واكتشاف العيوب والأتمتة الصناعية."],["03","Energy & Utilities","الطاقة والمرافق","Connected assets, monitoring and predictive operations.","الأصول المتصلة والمراقبة والعمليات التنبؤية."],["04","Ports & Infrastructure","الموانئ والبنية الأساسية","Technology for critical assets and field operations.","تقنيات للأصول الحيوية والعمليات الميدانية."]]},
 rd:{e:"R&D",a:"البحث والتطوير",t:"Build, test, learn — then move technology into the field.",ta:"نبني ونختبر ونتعلم — ثم ننقل التقنية إلى الميدان.",i:"Our R&D connects technical exploration with real-world use cases, partnerships and product pathways.",ia:"يربط البحث والتطوير لدينا الاستكشاف التقني بحالات استخدام واقعية وشراكات ومسارات للمنتجات.",c:[
 ["01","Applied AI","الذكاء الاصطناعي التطبيقي","Models and computer vision for industrial perception and decisions.","نماذج ورؤية حاسوبية للإدراك الصناعي ودعم القرارات."],["02","Edge & Embedded","الحوسبة الطرفية والأنظمة المدمجة","Efficient intelligence close to sensors, devices and machines.","ذكاء فعال قريب من الحساسات والأجهزة والآلات."],["03","Robotics","الروبوتات","Robotic platforms for inspection, monitoring and controlled tasks.","منصات روبوتية للتفتيش والمراقبة والمهام الميدانية المنضبطة."],["04","Prototyping","النمذجة التقنية","Rapid validation of hardware, software and integrated systems.","تحقق سريع من العتاد والبرمجيات والأنظمة المتكاملة."]]},
 about:{e:"ABOUT BXBII",a:"عن bxbii",t:"An Omani deep-tech company building for the real world.",ta:"شركة عُمانية للتكنولوجيا العميقة تبني للعالم الحقيقي.",i:"bxbii creates and integrates hardware, intelligent systems and connected technologies from Oman for regional and international opportunities.",ia:"تطوّر bxbii وتدمج الأجهزة والأنظمة الذكية والتقنيات المتصلة من عُمان للفرص الإقليمية والدولية.",c:[
 ["01","Core Business","النشاط الأساسي","Semiconductors, robotics, IoT, embedded systems and industrial AI.","أشباه الموصلات والروبوتات وإنترنت الأشياء والأنظمة المدمجة والذكاء الصناعي."],["02","Engineering Mindset","عقلية هندسية","Technology developed around use cases and deployment realities.","تقنية تُطوّر حول حالات الاستخدام ومتطلبات التطبيق الفعلي."],["03","Partnerships","الشراكات","Technical and commercial partnerships extend capabilities and reach.","شراكات تقنية وتجارية توسّع القدرات والوصول إلى الأسواق."],["04","Made in Oman","صناعة عُمانية","Building technical capability, products and opportunities from Oman.","بناء القدرات التقنية والمنتجات والفرص انطلاقًا من عُمان."]]},
 contact:{e:"LET'S BUILD",a:"لنبنِ معًا",t:"Have an industrial problem worth solving?",ta:"لديك تحدٍ صناعي يستحق الحل؟",i:"Tell us what you are trying to inspect, connect, automate or build. We can explore the technology pathway together.",ia:"أخبرنا بما تريد تفتيشه أو ربطه أو أتمتته أو بناءه، ولنستكشف معًا المسار التقني المناسب.",c:[
 ["01","Technology Partnerships","شراكات تقنية","Co-development, technology transfer and strategic technical collaboration.","التطوير المشترك ونقل التقنية والتعاون التقني الاستراتيجي."],["02","Industrial Projects","مشاريع صناعية","Inspection, monitoring, automation and connected-systems requirements.","متطلبات التفتيش والمراقبة والأتمتة والأنظمة المتصلة."],["03","Product Development","تطوير المنتجات","Move an idea from technical concept toward a validated product.","نقل الفكرة من المفهوم التقني إلى مسار منتج قابل للتحقق."],["04","General Enquiries","استفسارات عامة","Company, partnership and business enquiries.","استفسارات الشركة والشراكات والأعمال."]]},
 impact:{e:"TECHNOLOGY WITH PURPOSE",a:"تقنية تصنع أثرًا",t:"Capability building is part of our wider impact.",ta:"بناء القدرات جزء من أثرنا الأوسع.",i:"Education and talent initiatives complement bxbii's core identity in deep-tech products and industrial technology.",ia:"تكمل مبادرات التعليم وبناء المواهب هوية bxbii الأساسية في المنتجات والتقنيات الصناعية العميقة.",c:[
 ["01","Talent Development","تطوير المواهب","Initiatives that expose local talent to emerging technologies.","مبادرات تعرّف المواهب المحلية بالتقنيات الناشئة."],["02","Industry Awareness","الوعي الصناعي","Practical initiatives connecting people with real industrial challenges.","مبادرات عملية تربط الناس بالتحديات الصناعية الحقيقية."],["03","Knowledge Transfer","نقل المعرفة","Sharing technical knowledge through partnerships and applied initiatives.","مشاركة المعرفة التقنية عبر الشراكات والمبادرات التطبيقية."],["04","Future Capability","قدرات المستقبل","Supporting long-term technical capability in Oman where appropriate.","دعم القدرات التقنية طويلة المدى في عُمان حيثما كان ذلك مناسبًا."]]}
};

export function DeepTechPage({page}:{page:PageKey}){
 const {lang}=useLanguage(); const ar=lang==="ar"; const d=pages[page];
 return <main className="min-h-screen overflow-hidden bg-[#05080d] text-white">
  <section className="relative min-h-[620px] overflow-hidden border-b border-white/10">
   <div className="absolute inset-0 bg-[url('/images/oman-hero.webp')] bg-cover bg-center"/>
   <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,7,13,.95)_0%,rgba(3,7,13,.78)_40%,rgba(3,7,13,.25)_78%,rgba(3,7,13,.5)_100%)]"/>
   <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(3,7,13,.95)_0%,transparent_55%,rgba(3,7,13,.2)_100%)]"/>
   <div className={`relative mx-auto flex min-h-[620px] max-w-7xl items-end px-5 pb-20 pt-32 sm:px-8 lg:px-10 ${ar?"text-right":""}`}>
    <div className="max-w-4xl">
     <span className="inline-flex rounded-full border border-cyan-200/20 bg-cyan-200/5 px-4 py-2 text-[10px] font-black tracking-[.24em] text-cyan-100">{ar?d.a:d.e}</span>
     <h1 className="mt-6 text-5xl font-black leading-[.98] tracking-[-.055em] sm:text-7xl lg:text-[88px]">{ar?d.ta:d.t}</h1>
     <p className="mt-7 max-w-3xl text-base leading-8 text-white/60 sm:text-lg">{ar?d.ia:d.i}</p>
     <Link href="/contact-us" className="mt-9 inline-flex rounded-full bg-gradient-to-r from-red-500 to-orange-400 px-7 py-4 text-sm font-black shadow-lg shadow-red-500/10">{ar?"ابدأ محادثة":"Start a conversation"} <span className="ms-2">→</span></Link>
    </div>
   </div>
  </section>
  <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
   <div className={`mb-12 flex items-end justify-between gap-8 ${ar?"text-right":""}`}>
    <div><span className="text-[10px] font-black tracking-[.24em] text-red-400">{ar?"مجالاتنا":"CAPABILITIES"}</span><h2 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">{ar?"نحوّل التقنية إلى قدرة عملية.":"Turning technology into practical capability."}</h2></div>
   </div>
   <div className="grid gap-4 md:grid-cols-2">
    {d.c.map(([n,en,a,desc,descAr])=><article key={n} className={`group rounded-[28px] border border-white/10 bg-white/[.025] p-7 transition duration-300 hover:-translate-y-1 hover:border-cyan-200/25 hover:bg-white/[.045] sm:p-9 ${ar?"text-right":""}`}>
      <div className="flex items-start justify-between gap-6"><span className="text-xs font-black text-red-400">{n}</span><span className="h-2 w-2 rounded-full bg-cyan-300/70 shadow-[0_0_18px_rgba(103,232,249,.7)]"/></div>
      <h3 className="mt-14 text-2xl font-black sm:text-3xl">{ar?a:en}</h3>
      <p className="mt-4 max-w-xl text-sm leading-7 text-white/45">{ar?descAr:desc}</p>
      <div className="mt-8 h-px bg-gradient-to-r from-red-500/70 via-cyan-300/20 to-transparent"/>
    </article>)}
   </div>
  </section>
  <section className="border-t border-white/10 bg-[#07111a]">
   <div className={`mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-10 ${ar?"text-right":""}`}>
    <div className="flex flex-col justify-between gap-8 rounded-[30px] border border-white/10 bg-white/[.025] p-8 sm:p-10 lg:flex-row lg:items-center">
     <div><span className="text-[10px] font-black tracking-[.24em] text-cyan-200">{ar?"bxbii":"BUILT IN OMAN"}</span><h2 className="mt-3 text-3xl font-black">{ar?"جاهزون لبناء الحل التالي.":"Ready to build the next solution."}</h2></div>
     <Link href="/contact-us" className="inline-flex w-fit rounded-full border border-white/15 px-6 py-3 text-sm font-black transition hover:border-cyan-200/40">{ar?"تواصل معنا":"Talk to bxbii"} →</Link>
    </div>
   </div>
  </section>
 </main>
}
