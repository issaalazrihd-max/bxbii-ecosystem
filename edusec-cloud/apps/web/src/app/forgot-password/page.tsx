"use client";

import Link from "next/link";
import { useState } from "react";
import { api } from "@/lib/api-client";
import { AuthShell, authButtonClass, authInputClass } from "@/components/auth/auth-shell";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      await api.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError((err as Error).message);
    } finally { setLoading(false); }
  };

  if (sent) {
    return (
      <AuthShell eyebrow="Check your inbox" title="Email sent." subtitle={`If an account exists for ${email}, you'll receive a link to reset your password. The link expires in 30 minutes.`}>
        <Link href="/login" className={`${authButtonClass} flex items-center justify-center`}>Back to sign in</Link>
        <button type="button" onClick={() => setSent(false)} className="mt-4 w-full text-xs font-bold text-slate-500 hover:text-brand">Didn&apos;t get it? Try again</button>
      </AuthShell>
    );
  }

  return (
    <AuthShell eyebrow="Password reset" title="Forgot your password?" subtitle="Enter the email you use to sign in and we'll send you a link to choose a new password.">
      <form onSubmit={onSubmit} className="space-y-4">
        <div><label className="mb-1.5 block text-xs font-bold text-slate-600">Email</label><input type="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" className={authInputClass} /></div>
        {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-status-danger">{error}</div>}
        <button type="submit" disabled={loading} className={authButtonClass}>{loading ? "Sending…" : "Send reset link"}</button>
      </form>
    </AuthShell>
  );
}
