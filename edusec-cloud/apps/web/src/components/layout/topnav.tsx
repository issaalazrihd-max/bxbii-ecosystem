"use client";

/** Top navigation: global search + notifications + profile menu (brief Section 3/46/47). */
export function TopNav() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-surface-border bg-surface px-6">
      <input
        type="search"
        placeholder="Search students, employees, invoices..."
        className="w-96 rounded border border-surface-border px-3 py-1.5 text-sm focus:border-accent focus:outline-none"
      />
      <div className="flex items-center gap-4 text-sm text-slate-600">
        <button className="relative rounded p-2 hover:bg-surface-subtle" aria-label="Notifications">
          🔔
        </button>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-accent text-center leading-8 text-white">A</div>
        </div>
      </div>
    </header>
  );
}
