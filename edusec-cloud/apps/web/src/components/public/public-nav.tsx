"use client";

import Link from "next/link";
import { useState } from "react";
import type { PublicNavItem } from "@/lib/public-api";
import { pickText } from "@/lib/i18n";
import { useLanguage, LanguageToggle } from "./language-provider";

const APP_LOGIN_URL = "https://app.bxbii.com/login";
const FOCUS = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2";

export function PublicNav({ items }: { items: PublicNavItem[] }) {
  const { lang } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const ar = lang === "ar";
  const core = [
    ["/", "Home", "الرئيسية"],
    ["/programs", "Programs", "البرامج"],
    ["/programs", "Bootcamps", "المعسكرات"],
    ["/courses", "Courses", "الدورات"],
    ["/training", "Miran Studio", "مران ستوديو"],
    ["/about-us", "About", "عن bxbii"],
    ["/contact-us", "Contact", "تواصل معنا"],
  ] as const;
  const cmsExtras = items.filter((item) => item.isVisible && item.href && !core.some((x) => x[0] === item.href));

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 text-slate-900 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3 sm:px-8 lg:px-10">
        <Link href="/" className={`shrink-0 rounded text-2xl font-black tracking-[-.06em] text-brand ${FOCUS}`}>
          bxbii<span className="ms-1 text-accent">.</span><span className="sr-only"> Build Beyond</span>
        </Link>
        <nav className="hidden items-center gap-1 xl:flex">
          {core.map(([href, en, arLabel]) => (
            <Link key={href + en} href={href} className={`rounded-lg px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 hover:text-brand ${FOCUS}`}>
              {ar ? arLabel : en}
            </Link>
          ))}
          {cmsExtras.slice(0, 1).map((item) => (
            <Link key={item.id} href={item.href!} className={`rounded-lg px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 hover:text-brand ${FOCUS}`}>
              {pickText(item.enLabel, item.arLabel, lang)}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <LanguageToggle />
          <Link href="/programs" className="rounded-full bg-brand px-5 py-2.5 text-xs font-black text-white transition hover:bg-accent">
            {ar ? "ابدأ الآن" : "Start now"}
          </Link>
          <a href={APP_LOGIN_URL} aria-label={ar ? "بوابة الإدارة" : "Administration portal"} title={ar ? "بوابة الإدارة" : "Administration portal"} className={`rounded px-1 text-[10px] text-slate-300 hover:text-slate-500 ${FOCUS}`}>•</a>
        </div>
        <button className={`rounded-lg border border-slate-200 p-2 xl:hidden ${FOCUS}`} onClick={() => setMobileOpen((v) => !v)} aria-label="Toggle menu">
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>
      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-5 pb-5 xl:hidden">
          <nav className="flex flex-col pt-2">
            {core.map(([href, en, arLabel]) => (
              <Link key={href + en} href={href} onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-3 font-bold text-slate-700 hover:bg-slate-50">
                {ar ? arLabel : en}
              </Link>
            ))}
          </nav>
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
            <LanguageToggle />
            <a href={APP_LOGIN_URL} className="text-xs text-slate-400">{ar ? "بوابة الإدارة" : "Admin"}</a>
          </div>
        </div>
      )}
    </header>
  );
}
