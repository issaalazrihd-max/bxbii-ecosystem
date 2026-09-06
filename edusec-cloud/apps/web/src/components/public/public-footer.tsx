"use client";

import Link from "next/link";
import { useLanguage } from "./language-provider";

/** Minimal public footer. Staff Sign In is deliberately understated — the
 * public nav's "Sign in" already covers the common case; this is the same
 * link kept reachable if that ever gets restyled out of the header. */
export function PublicFooter() {
  const { lang } = useLanguage();
  return (
    <footer className="border-t border-surface-border bg-surface-subtle py-8 text-sm text-slate-500">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-2 px-4 sm:flex-row sm:justify-between sm:px-6">
        <span>© {new Date().getFullYear()} bxbii. {lang === "ar" ? "جميع الحقوق محفوظة" : "All rights reserved."}</span>
        <Link
          href="/login"
          // Interface pass (Task #41): added a visible focus-visible ring —
          // this link had no keyboard-focus indicator before.
          className="rounded hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface-subtle"
        >
          {lang === "ar" ? "دخول الموظفين" : "Staff sign in"}
        </Link>
      </div>
    </footer>
  );
}
