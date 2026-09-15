"use client";

import Link from "next/link";

export function TopNav() {
  return (
    <header className="sticky top-0 z-30 flex min-h-[72px] items-center justify-between gap-4 border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl sm:px-6">
      <div className="relative w-full max-w-xl">
        <span className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-slate-400">⌕</span>
        <input type="search" placeholder="Search students, programs, invoices..." className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 ps-10 pe-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-brand/40 focus:bg-white focus:ring-4 focus:ring-brand/5" />
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <Link href="/" className="hidden rounded-lg px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 sm:block">Public site ↗</Link>
        <button className="relative grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50" aria-label="Notifications">♢<span className="absolute end-2 top-2 h-1.5 w-1.5 rounded-full bg-accent" /></button>
        <div className="hidden h-8 w-px bg-slate-200 sm:block" />
        <div className="flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-brand text-sm font-black text-white">A</div>
          <div className="hidden leading-tight lg:block"><div className="text-sm font-bold text-slate-800">Administrator</div><div className="text-[11px] text-slate-400">bxbii Cloud</div></div>
        </div>
      </div>
    </header>
  );
}
