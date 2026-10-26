"use client";
import { usePathname } from "next/navigation";
import { useLanguage } from "./language-provider";
type Visual={en:string;ar:string;image:string;tag:string};
const visuals:Record<string,Visual>={
"/":{en:"Technology for the real world",ar:"تقنية للعالم الحقيقي",tag:"BXBII / TECHNOLOGY",image:"/images/semiconductor-hero.svg"},
"/technology":{en:"Engineering the intelligence layer",ar:"نهندس طبقة الذكاء",tag:"TECHNOLOGY",image:"https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1800&q=85"},
"/solutions":{en:"Technology built for operations",ar:"تقنية تُبنى للعمليات",tag:"SOLUTIONS",image:"/images/robotics-industrial.svg"},
"/industries":{en:"Technology where reliability matters",ar:"تقنية حيث الاعتمادية تصنع الفرق",tag:"INDUSTRIES",image:"/images/robotics-industrial.svg"},
"/rd":{en:"From prototype to field",ar:"من النموذج الأولي إلى الميدان",tag:"R&D",image:"/images/robotics-industrial.svg"},
"/about-us":{en:"Built in Oman. Designed for scale.",ar:"نبني من عُمان لفرص تتجاوز الحدود",tag:"ABOUT BXBII",image:"/images/iot-connected.svg"},
"/contact-us":{en:"Let's build what matters",ar:"لنبنِ ما يصنع الفرق",tag:"LET'S BUILD",image:"/images/iot-connected.svg"}
};
export function PublicVisualBanner(){const pathname=usePathname();const{lang}=useLanguage();const visual=visuals[pathname]??visuals["/"];const ar=lang==="ar";return <section className="relative overflow-hidden border-b border-white/10 bg-[#07111d]"><div className="relative h-[220px] sm:h-[270px]"><img src={visual.image} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover object-center"/><div className="absolute inset-0 bg-[#07111d]/65"/><div className="absolute inset-0 bg-gradient-to-r from-[#07111d] via-[#07111d]/55 to-transparent"/><div className="relative mx-auto flex h-full max-w-7xl items-end px-5 pb-9 sm:px-8 lg:px-10"><div className={ar?"text-right":""}><span className="text-[10px] font-black uppercase tracking-[.28em] text-cyan-200">{visual.tag}</span><h1 className="mt-3 max-w-3xl text-3xl font-black tracking-[-.04em] text-white sm:text-5xl">{ar?visual.ar:visual.en}</h1></div></div></div></section>}