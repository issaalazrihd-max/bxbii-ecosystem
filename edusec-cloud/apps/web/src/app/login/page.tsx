"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, setTokens } from "@/lib/api-client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@bxbii.local");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const result = await api.login(email, password);
      setTokens(result);
      router.push("/dashboard");
    } catch (err) {
      setError((err as Error).message);
    } finally { setLoading(false); }
  };

  return (
    <main className="min-h-screen bg-[#F6F5FA] lg:grid lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-[#24135F] p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -start-24 top-24 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute -end-24 bottom-10 h-96 w-96 rounded-full bg-brand-light/30 blur-3xl" />
        <div className="relative"><div className="text-3xl font-black tracking-[-.06em]">bxbii<span className="text-accent">.</span></div><p className="mt-2 text-xs uppercase tracking-[.2em] text-white/40">Cloud platform</p></div>
        <div className="relative max-w-lg"><p className="text-xs font-bold uppercase tracking-[.18em] text-white/45">Institute operations</p><h1 className="mt-4 text-5xl font-black leading-tight">One workspace for your learning operation.</h1><p className="mt-5 text-lg leading-8 text-white/60">Manage people, academic delivery, branches and finance from a single operational layer.</p></div>
        <div className="relative flex gap-8 text-xs font-semibold text-white/40"><span>People</span><span>Academic</span><span>Finance</span><span>Content</span></div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden"><div className="text-3xl font-black tracking-[-.06em] text-brand">bxbii<span className="text-accent">.</span></div><p className="mt-1 text-[10px] uppercase tracking-[.2em] text-slate-400">Cloud platform</p></div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-xl shadow-slate-900/5 sm:p-9">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-accent">Secure access</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900">Welcome back.</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Sign in to manage your bxbii learning operation.</p>
            <form onSubmit={onSubmit} className="mt-8 space-y-4">
              <div><label className="mb-1.5 block text-xs font-bold text-slate-600">Email</label><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-brand/40 focus:bg-white focus:ring-4 focus:ring-brand/5" /></div>
              <div><div className="mb-1.5 flex items-center justify-between"><label className="text-xs font-bold text-slate-600">Password</label><a href="mailto:admin@bxbii.local?subject=Password%20reset" className="text-xs font-bold text-accent hover:underline">Forgot password?</a></div><input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-brand/40 focus:bg-white focus:ring-4 focus:ring-brand/5" /></div>
              {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-status-danger">{error}</div>}
              <button type="submit" disabled={loading} className="h-12 w-full rounded-xl bg-brand text-sm font-black text-white shadow-lg shadow-brand/20 transition hover:bg-brand-light disabled:opacity-50">{loading ? "Signing in…" : "Sign in to bxbii"}</button>
            </form>
          </div>
          <div className="mt-6 flex items-center justify-between text-xs text-slate-400"><span>© {new Date().getFullYear()} bxbii</span><Link href="/" className="font-bold hover:text-brand">← Public website</Link></div>
        </div>
      </section>
    </main>
  );
}
