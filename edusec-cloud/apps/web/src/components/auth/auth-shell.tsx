import Link from "next/link";

/** Card layout shared by the forgot-password and reset-password screens (matches /login). */
export function AuthShell({ eyebrow, title, subtitle, children }: { eyebrow: string; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F6F5FA] px-5 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8"><div className="text-3xl font-black tracking-[-.06em] text-brand">bxbii<span className="text-accent">.</span></div><p className="mt-1 text-[10px] uppercase tracking-[.2em] text-slate-400">Cloud platform</p></div>
        <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-xl shadow-slate-900/5 sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-accent">{eyebrow}</p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
        <div className="mt-6 flex items-center justify-between text-xs text-slate-400"><span>© {new Date().getFullYear()} bxbii</span><Link href="/login" className="font-bold hover:text-brand">← Back to sign in</Link></div>
      </div>
    </main>
  );
}

export const authInputClass =
  "h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-brand/40 focus:bg-white focus:ring-4 focus:ring-brand/5";
export const authButtonClass =
  "h-12 w-full rounded-xl bg-brand text-sm font-black text-white shadow-lg shadow-brand/20 transition hover:bg-brand-light disabled:opacity-50";
