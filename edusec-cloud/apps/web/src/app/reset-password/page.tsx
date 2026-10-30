"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api-client";
import { AuthShell, authButtonClass, authInputClass } from "@/components/auth/auth-shell";

function ResetPasswordForm() {
  const token = useSearchParams().get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <AuthShell eyebrow="Password reset" title="Link not valid." subtitle="This page needs the link from your reset email. Request a new one to continue.">
        <Link href="/forgot-password" className={`${authButtonClass} flex items-center justify-center`}>Request a new link</Link>
      </AuthShell>
    );
  }

  if (done) {
    return (
      <AuthShell eyebrow="All set" title="Password updated." subtitle="Your new password is active and any other open sessions have been signed out.">
        <Link href="/login" className={`${authButtonClass} flex items-center justify-center`}>Sign in</Link>
      </AuthShell>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("The two passwords don't match.");
    setLoading(true);
    try {
      await api.resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError((err as Error).message);
    } finally { setLoading(false); }
  };

  return (
    <AuthShell eyebrow="Password reset" title="Choose a new password." subtitle="Use at least 8 characters. You'll use it the next time you sign in.">
      <form onSubmit={onSubmit} className="space-y-4">
        <div><label className="mb-1.5 block text-xs font-bold text-slate-600">New password</label><input type="password" required minLength={8} autoComplete="new-password" autoFocus value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={authInputClass} /></div>
        <div><label className="mb-1.5 block text-xs font-bold text-slate-600">Confirm new password</label><input type="password" required minLength={8} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="••••••••" className={authInputClass} /></div>
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-status-danger">
            {error}
            {error.includes("expired") && <> <Link href="/forgot-password" className="font-bold underline">Request a new link</Link></>}
          </div>
        )}
        <button type="submit" disabled={loading} className={authButtonClass}>{loading ? "Saving…" : "Update password"}</button>
      </form>
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
