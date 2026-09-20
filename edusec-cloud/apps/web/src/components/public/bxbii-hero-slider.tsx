"use client";

import {useEffect, useState} from "react";
import {useLanguage} from "./language-provider";

const slides=[
 {en:"Local Talent. Global Impact.",ar:"مواهب عُمانية. أثر عالمي.",subEn:"Advanced technology, real-world solutions, and innovation for Oman’s future.",subAr:"تكنولوجيا متقدمة، حلول واقعية، وابتكار لمستقبل عُمان.",ctaEn:"Explore Technology",ctaAr:"استكشف التقنية"},
 {en:"Built in Oman. Ready for the World.",ar:"من عُمان إلى العالم.",subEn:"Deep technology, industrial intelligence, and capabilities built for critical sectors.",subAr:"تكنولوجيا عميقة، ذكاء صناعي، وقدرات مصممة للقطاعات الحيوية.",ctaEn:"Explore Technology",ctaAr:"استكشف التقنية"},
 {en:"From Ideas to Industrial Impact.",ar:"من الفكرة إلى الأثر الصناعي.",subEn:"Connecting people, technology, and industry to create what comes next.",subAr:"نربط الإنسان والتقنية والصناعة لصناعة ما هو قادم.",ctaEn:"Work With Us",ctaAr:"اعمل معنا"}
];

export function BxbiiHeroSlider(){
 const{lang}=useLanguage();
 const ar=lang==="ar";
 const[index,setIndex]=useState(0);
 const slide=slides[index];
 useEffect(()=>{const id=window.setInterval(()=>setIndex(v=>(v+1)%slides.length),7000);return()=>window.clearInterval(id)},[]);
 const t=(e:string,a:string)=>ar?a:e;
 return <section className="relative isolate h-[min(760px,calc(100vh-72px))] min-h-[620px] overflow-hidden border-b border-white/10 bg-[#02070d]">
  <div className="absolute inset-0 bg-cover bg-center transition-transform duration-[9000ms] scale-[1.02]" style={{backgroundImage:"url('/images/oman-hero.webp')"}}/>
  <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,7,13,.88)_0%,rgba(2,7,13,.58)_40%,rgba(2,7,13,.12)_75%,rgba(2,7,13,.3)_100%)]"/>
  <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(2,7,13,.82)_0%,transparent_35%,rgba(2,7,13,.12)_100%)]"/>
  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_75%_35%,rgba(49,196,255,.28),transparent_24%),radial-gradient(circle_at_20%_80%,rgba(255,80,48,.18),transparent_28%)]"/>
  <div className="relative mx-auto flex h-full max-w-7xl items-end px-5 pb-24 pt-28 sm:px-8 lg:px-10">
   <div className={`max-w-2xl ${ar?"mr-auto text-right":""}`}>
    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/20 px-4 py-2 text-[10px] font-black uppercase tracking-[.25em] text-white/80 backdrop-blur-md"><span className="h-1.5 w-1.5 rounded-full bg-red-400 shadow-[0_0_14px_rgba(248,113,113,.9)]"/>{t("BUILT IN OMAN · FOR A BRIGHTER TOMORROW","من عُمان · لمستقبل أكثر إشراقًا")}</div>
    <h2 key={index} className="text-5xl font-black leading-[.94] tracking-[-.055em] text-white drop-shadow-2xl sm:text-6xl lg:text-8xl">{t(slide.en,slide.ar)}</h2>
    <p key={`p-${index}`} className="mt-6 max-w-xl text-sm leading-7 text-white/80 sm:text-lg">{t(slide.subEn,slide.subAr)}</p>
    <a href={index===0?"/technology":index===1?"/technology":"/contact-us"} className={`mt-8 inline-flex items-center rounded-full bg-white px-6 py-3.5 text-sm font-black text-[#06101a] shadow-2xl transition hover:-translate-y-0.5 ${ar?"flex-row-reverse":""}`}>
     {t(slide.ctaEn,slide.ctaAr)} <span className={ar?"mr-3":"ml-3"}>{ar?"←":"→"}</span>
    </a>
   </div>
  </div>
  <button aria-label={ar?"الشريحة السابقة":"Previous slide"} onClick={()=>setIndex(v=>(v-1+slides.length)%slides.length)} className="absolute left-5 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/20 p-3 text-2xl text-white backdrop-blur-md transition hover:bg-black/40 sm:left-8">‹</button>
  <button aria-label={ar?"الشريحة التالية":"Next slide"} onClick={()=>setIndex(v=>(v+1)%slides.length)} className="absolute right-5 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/20 p-3 text-2xl text-white backdrop-blur-md transition hover:bg-black/40 sm:right-8">›</button>
  <div className={`absolute bottom-7 left-1/2 flex -translate-x-1/2 gap-2 ${ar?"flex-row-reverse":""}`}>
   {slides.map((_,i)=><button key={i} aria-label={`${t("Slide","الشريحة")} ${i+1}`} onClick={()=>setIndex(i)} className={`h-1 rounded-full transition-all ${i===index?"w-12 bg-white":"w-6 bg-white/35"}`}/>) }
  </div>
  <div className="absolute bottom-7 right-5 hidden text-right text-[9px] font-black uppercase tracking-[.22em] text-white/60 sm:block">Muscat · Oman<br/><span className="text-white/35">From Oman to the World</span></div>
 </section>;
}
