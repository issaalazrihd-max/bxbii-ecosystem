"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { hasSession } from "@/lib/api-client";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNav } from "@/components/layout/topnav";

/**
 * Route guard for every /dashboard, /cms/*, /students, /branches, etc. page.
 *
 * Previously this layout rendered the full dashboard chrome (sidebar, top
 * nav) unconditionally, so a visitor with NO session at all — not just an
 * expired one — saw the real admin shell with a bare "Unauthorized" and a
 * misleading "No menu items yet — add one above" empty state, rather than
 * being sent to sign in. This only checks whether a session is stored at
 * all (hasSession() reads the same refresh-token state that api-client's
 * request()/ensureAccessToken() already rely on); it does not change how
 * requests are authorized or retried, so the existing fix for a *present
 * but stale* session (rehydrate-on-load, refresh-and-retry on 401) is
 * untouched — that still degrades to the page's own error state exactly
 * as before. This guard only catches the "never logged in / fully signed
 * out" case that fell through with no guard at all.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!hasSession()) {
      router.replace("/login");
      return;
    }
    setChecked(true);
  }, [router]);

  if (!checked) return null;

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <TopNav />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
