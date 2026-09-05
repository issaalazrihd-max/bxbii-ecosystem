"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, setTokens } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@bxbii.local");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await api.login(email, password);
      setTokens(result);
      router.push("/dashboard");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-subtle px-4">
      <div className="w-full max-w-sm">
        <Card className="w-full">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-lg font-bold text-white">
              b
            </div>
            <h1 className="text-lg font-semibold text-slate-900">bxbii cloud</h1>
            <p className="text-xs text-slate-500">Digital Business Ecosystem</p>
          </div>

          <h2 className="mb-1 text-center text-base font-semibold text-slate-900">
            Sign in to your account
          </h2>
          <p className="mb-6 text-center text-sm text-slate-500">
            Enter your details below to access your institute dashboard.
          </p>

          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <input
                type="email"
                required
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded border border-surface-border px-3 py-2 text-sm focus:border-accent focus:outline-none"
              />
            </div>
            <div>
              <input
                type="password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded border border-surface-border px-3 py-2 text-sm focus:border-accent focus:outline-none"
              />
            </div>

            <div className="flex justify-end">
              <a
                href="mailto:admin@bxbii.local?subject=Password%20reset"
                className="text-xs font-medium text-accent hover:underline"
              >
                Forgot your password?
              </a>
            </div>

            {error && <p className="text-sm text-status-danger">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </Card>

        <p className="mt-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} bxbii. All rights reserved.
        </p>
      </div>
    </div>
  );
}
