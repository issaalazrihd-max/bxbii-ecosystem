"use client";

import Link from "next/link";
import { useState } from "react";
import type { PublicNavItem } from "@/lib/public-api";
import { pickText } from "@/lib/i18n";
import { useLanguage, LanguageToggle } from "./language-provider";

/**
 * Fully dynamic top navigation (brief Section 31) — every item, including
 * submenus, comes from the CMS Navigation API. Nothing here is hard-coded;
 * an editor can add, reorder, or hide menu items without a code change.
 *
 * The "Login to Application" button is the one intentional exception: it
 * always points at the dedicated app.bxbii.com subdomain (the Institute
 * Management System / staff dashboard), kept separate from the public
 * marketing site served on bxbii.com / www.bxbii.com.
 */
const APP_LOGIN_URL = "https://app.bxbii.com/login";

export function PublicNav({ items }: { items: PublicNavItem[] }) {
  const { lang } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const visible = items.filter((item) => item.isVisible);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-brand text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          bxbii
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {visible.map((item) => (
            <NavEntry key={item.id} item={item} lang={lang} />
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LanguageToggle />
          <a
            href={APP_LOGIN_URL}
            className="rounded bg-accent px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-accent-light"
          >
            {lang === "ar" ? "الدخول إلى التطبيق" : "Login to Application"}
          </a>
        </div>

        <button
          className="rounded p-2 text-white/90 hover:bg-white/10 md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? "✕" : "☰"}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-white/10 px-4 pb-4 md:hidden">
          <nav className="flex flex-col gap-1 pt-2">
            {visible.map((item) => (
              <NavEntry key={item.id} item={item} lang={lang} mobile />
            ))}
          </nav>
          <div className="mt-3 flex items-center gap-3">
            <LanguageToggle />
            <a
              href={APP_LOGIN_URL}
              className="rounded bg-accent px-3 py-1.5 text-sm font-medium text-white"
            >
              {lang === "ar" ? "الدخول إلى التطبيق" : "Login to Application"}
            </a>
          </div>
        </div>
      )}
    </header>
  );
}

function NavEntry({
  item,
  lang,
  mobile,
}: {
  item: PublicNavItem;
  lang: "en" | "ar";
  mobile?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const label = pickText(item.enLabel, item.arLabel, lang);
  const children = item.children.filter((c) => c.isVisible);
  const hasChildren = children.length > 0;

  const linkClasses = mobile
    ? "block rounded px-3 py-2 text-sm font-medium text-white/90 hover:bg-white/10"
    : "rounded px-3 py-2 text-sm font-medium text-white/90 hover:bg-white/10";

  if (!hasChildren) {
    if (!item.href) return null;
    return item.openInNewTab ? (
      <a href={item.href} target="_blank" rel="noreferrer" className={linkClasses}>
        {label}
      </a>
    ) : (
      <Link href={item.href} className={linkClasses}>
        {label}
      </Link>
    );
  }

  return (
    <div
      className={mobile ? "" : "relative"}
      onMouseEnter={() => !mobile && setOpen(true)}
      onMouseLeave={() => !mobile && setOpen(false)}
    >
      <button
        className={`${linkClasses} flex w-full items-center gap-1`}
        onClick={() => mobile && setOpen((v) => !v)}
      >
        {label} <span className="text-xs">▾</span>
      </button>
      {open && (
        <div
          className={
            mobile
              ? "ml-3 flex flex-col gap-1 border-l border-white/10 pl-2"
              : "absolute left-0 top-full min-w-[12rem] rounded border border-surface-border bg-surface py-1 shadow-lg"
          }
        >
          {children.map((child) =>
            child.href ? (
              <Link
                key={child.id}
                href={child.href}
                target={child.openInNewTab ? "_blank" : undefined}
                className={
                  mobile
                    ? "block rounded px-3 py-2 text-sm text-white/80 hover:bg-white/10"
                    : "block px-4 py-2 text-sm text-slate-700 hover:bg-surface-subtle"
                }
              >
                {pickText(child.enLabel, child.arLabel, lang)}
              </Link>
            ) : null,
          )}
        </div>
      )}
    </div>
  );
}
