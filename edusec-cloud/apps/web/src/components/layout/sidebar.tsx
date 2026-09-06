"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/branches", label: "Branches" },
  { href: "/students", label: "Students" },
  { href: "/cms/pages", label: "Pages" },
  { href: "/cms/navigation", label: "Navigation" },
  { href: "/cms/programs", label: "Programs" },
];

/** Collapsible sidebar navigation (brief Section 3). */
export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`flex h-screen flex-col border-r border-surface-border bg-brand text-white transition-all ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex items-center justify-between px-4 py-4">
        {!collapsed && <span className="text-lg font-semibold">bxbii cloud</span>}
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="rounded p-1 text-white/70 hover:bg-white/10 hover:text-white"
          aria-label="Toggle sidebar"
        >
          {collapsed ? "»" : "«"}
        </button>
      </div>
      <nav className="flex-1 space-y-1 px-2">
        {NAV_ITEMS.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded px-3 py-2 text-sm font-medium ${
                active ? "bg-accent text-white" : "text-white/80 hover:bg-white/10"
              }`}
            >
              {collapsed ? item.label[0] : item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
