"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const GROUPS = [
  { title: "Workspace", items: [["/dashboard", "Dashboard", "⌂"], ["/operations", "Operations Center", "◫"], ["/operations/workflow", "Institute Workflow", "→"], ["/branches", "Branches", "⌘"]] },
  { title: "People", items: [["/students", "Students", "◉"], ["/operations/admissions", "Admissions & CRM", "◎"]] },
  { title: "Academic", items: [["/erp/batches", "Batches", "▣"], ["/erp/enrollments", "Enrollments", "↳"], ["/operations/timetable", "Timetable", "▦"], ["/operations/attendance", "Attendance", "✓"], ["/operations/exams", "Exams & Assessments", "▤"], ["/operations/certificates", "Certificates", "◇"], ["/cms/programs", "Programs", "◆"], ["/cms/courses", "Courses", "◇"]] },
  { title: "Finance", items: [["/erp/invoices", "Invoices", "▤"], ["/erp/payments", "Payments", "﹩"], ["/operations/reports", "Reports & Analytics", "◫"]] },
  { title: "Content", items: [["/cms/pages", "Pages", "□"], ["/cms/navigation", "Navigation", "≡"], ["/cms/partners", "Partners", "♢"], ["/cms/contact", "Messages", "✉"]] },
  { title: "Administration", items: [["/operations/settings", "System Settings", "⚙"]] },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  return (
    <aside className={`sticky top-0 flex h-screen shrink-0 flex-col bg-[#24135F] text-white transition-all duration-200 ${collapsed ? "w-[72px]" : "w-[250px]"}`}>
      <div className="flex h-[72px] items-center justify-between border-b border-white/10 px-4">
        {!collapsed ? <div><div className="text-xl font-black tracking-[-.05em]">bxbii<span className="text-accent">.</span></div><div className="text-[10px] font-medium uppercase tracking-[.2em] text-white/45">Cloud platform</div></div> : <span className="mx-auto text-xl font-black">b.</span>}
        <button onClick={() => setCollapsed((v) => !v)} className="rounded-lg p-2 text-white/55 hover:bg-white/10 hover:text-white" aria-label="Toggle sidebar">{collapsed ? "»" : "«"}</button>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {GROUPS.map((group) => <div key={group.title} className="mb-5"><div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[.16em] text-white/35">{group.title}</div><div className="space-y-1">{group.items.map(([href, label, icon]) => { const active = pathname === href || pathname?.startsWith(`${href}/`); return <Link key={href} href={href} title={collapsed ? label : undefined} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${active ? "bg-accent text-white shadow-lg shadow-accent/20" : "text-white/65 hover:bg-white/10 hover:text-white"}`}><span className="grid h-6 w-6 shrink-0 place-items-center text-sm">{icon}</span>{!collapsed && <span>{label}</span>}</Link>; })}</div></div>)}
      </nav>
      <div className="border-t border-white/10 p-3"><Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-white/50 hover:bg-white/10 hover:text-white"><span>↗</span>{!collapsed && "View public website"}</Link></div>
    </aside>
  );
}
