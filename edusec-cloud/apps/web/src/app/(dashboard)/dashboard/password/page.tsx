"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, clearTokens } from "@/lib/api-client";

const inputClass =
  "h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-brand/40 focus:bg-white focus:ring-4 focus:ring-brand/5";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (next.length < 8) return setError("New password must be at least 8 characters.");
    if (next !== confirm) return setError("The two new passwords don't match.");
    setLoading(true);
    try {
      await api.changePassword(current, next);
      setDone(true);
    } catch (err) {
      setError((err as Error).message);
    } finally { setLoading(false); }
  };

  const signInAgain = () => { clearTokens(); router.push("/login"); };

  return (
    <div className="mx-auto max-w-md">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-xl shadow-slate-900/5 sm:p-9">
        <p className="text-xs font-bold uppercase tracking-[.16em] text-accent">Account security</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900">Change password</h1>
        {done ? (
          <>
            <p className="mt-2 text-sm leading-6 text-slate-500">Your password has been updated. Please sign in again with the new password.</p>
            <button onClick={signInAgain} className="mt-8 h-12 w-full rounded-xl bg-brand text-sm font-black text-white shadow-lg shadow-brand/20 transition hover:bg-brand-light">Sign in again</button>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm leading-6 text-slate-500">Use at least 8 characters.</p>
            <form onSubmit={onSubmit} className="mt-8 space-y-4">
              <div><label className="mb-1.5 block text-xs font-bold text-slate-600">Current password</label><input type="password" required autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} className={inputClass} /></div>
              <div><label className="mb-1.5 block text-xs font-bold text-slate-600">New password</label><input type="password" required minLength={8} autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} className={inputClass} /></div>
              <div><label className="mb-1.5 block text-xs font-bold text-slate-600">Confirm new password</label><input type="password" required minLength={8} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputClass} /></div>
              {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-status-danger">{error}</div>}
              <button type="submit" disabled={loading} className="h-12 w-full rounded-xl bg-brand text-sm font-black text-white shadow-lg shadow-brand/20 transition hover:bg-brand-light disabled:opacity-50">{loading ? "Saving…" : "Update password"}</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
