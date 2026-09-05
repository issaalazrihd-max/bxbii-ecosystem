"use client";

import { useEffect, useState } from "react";
import { api, type AdminNavItem, type AdminPage } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Draft = {
  arLabel: string;
  enLabel: string;
  linkType: "PAGE" | "EXTERNAL_URL";
  targetPageId: string;
  externalUrl: string;
  openInNewTab: boolean;
  parentId: string;
};

const EMPTY_DRAFT: Draft = {
  arLabel: "",
  enLabel: "",
  linkType: "PAGE",
  targetPageId: "",
  externalUrl: "",
  openInNewTab: false,
  parentId: "",
};

function flatten(tree: AdminNavItem[]): { id: string; parentId: string | null }[] {
  const out: { id: string; parentId: string | null }[] = [];
  for (const item of tree) {
    out.push({ id: item.id, parentId: item.parentId });
    for (const child of item.children) out.push({ id: child.id, parentId: child.parentId });
  }
  return out;
}

/**
 * Dynamic Navigation manager (brief Section 31) — add, edit, reorder, hide,
 * and delete menu items with no code change. One level of submenu is
 * supported, matching what the public nav actually renders.
 */
export default function NavigationManagerPage() {
  const [tree, setTree] = useState<AdminNavItem[]>([]);
  const [pages, setPages] = useState<AdminPage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [saving, setSaving] = useState(false);

  const load = () => {
    Promise.all([api.listNavigation(), api.listPages()])
      .then(([nav, pgs]) => {
        setTree(nav);
        setPages(pgs);
      })
      .catch((err) => setError(err.message));
  };

  useEffect(load, []);

  const topLevel = tree;

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.createNavItem({
        arLabel: draft.arLabel,
        enLabel: draft.enLabel,
        linkType: draft.linkType,
        targetPageId: draft.linkType === "PAGE" ? draft.targetPageId : undefined,
        externalUrl: draft.linkType === "EXTERNAL_URL" ? draft.externalUrl : undefined,
        openInNewTab: draft.openInNewTab,
        parentId: draft.parentId || undefined,
      });
      setDraft(EMPTY_DRAFT);
      setAdding(false);
      load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const toggleVisible = async (item: AdminNavItem) => {
    try {
      await api.updateNavItem(item.id, { isVisible: !item.isVisible });
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const remove = async (item: AdminNavItem) => {
    try {
      await api.deleteNavItem(item.id);
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const moveTopLevel = async (index: number, dir: -1 | 1) => {
    const next = [...topLevel];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    try {
      await api.reorderNavigation(flatten(next));
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const moveChild = async (parent: AdminNavItem, index: number, dir: -1 | 1) => {
    const children = [...parent.children];
    const target = index + dir;
    if (target < 0 || target >= children.length) return;
    [children[index], children[target]] = [children[target], children[index]];
    const nextTree = topLevel.map((t) => (t.id === parent.id ? { ...t, children } : t));
    try {
      await api.reorderNavigation(flatten(nextTree));
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Navigation</h1>
        <Button onClick={() => setAdding((v) => !v)}>{adding ? "Cancel" : "Add menu item"}</Button>
      </div>

      {error && <p className="text-sm text-status-danger">{error}</p>}

      {adding && (
        <Card>
          <form onSubmit={onCreate} className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Label (EN)</label>
              <input
                required
                value={draft.enLabel}
                onChange={(e) => setDraft({ ...draft, enLabel: e.target.value })}
                className="w-full rounded border border-surface-border px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Label (AR)</label>
              <input
                required
                dir="rtl"
                value={draft.arLabel}
                onChange={(e) => setDraft({ ...draft, arLabel: e.target.value })}
                className="w-full rounded border border-surface-border px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Parent (optional)</label>
              <select
                value={draft.parentId}
                onChange={(e) => setDraft({ ...draft, parentId: e.target.value })}
                className="w-full rounded border border-surface-border px-3 py-1.5 text-sm"
              >
                <option value="">— Top level —</option>
                {topLevel.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.enLabel}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Link type</label>
              <select
                value={draft.linkType}
                onChange={(e) => setDraft({ ...draft, linkType: e.target.value as Draft["linkType"] })}
                className="w-full rounded border border-surface-border px-3 py-1.5 text-sm"
              >
                <option value="PAGE">Page</option>
                <option value="EXTERNAL_URL">External URL</option>
              </select>
            </div>

            {draft.linkType === "PAGE" ? (
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">Target page</label>
                <select
                  required
                  value={draft.targetPageId}
                  onChange={(e) => setDraft({ ...draft, targetPageId: e.target.value })}
                  className="w-full rounded border border-surface-border px-3 py-1.5 text-sm"
                >
                  <option value="">Choose a page…</option>
                  {pages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.slug === "" ? "/ (home)" : `/${p.slug}`} — {p.enTitle}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">External URL</label>
                <input
                  required
                  type="url"
                  value={draft.externalUrl}
                  onChange={(e) => setDraft({ ...draft, externalUrl: e.target.value })}
                  placeholder="https://…"
                  className="w-full rounded border border-surface-border px-3 py-1.5 text-sm"
                />
              </div>
            )}

            <label className="flex items-center gap-2 self-end text-sm text-slate-600">
              <input
                type="checkbox"
                checked={draft.openInNewTab}
                onChange={(e) => setDraft({ ...draft, openInNewTab: e.target.checked })}
              />
              Open in new tab
            </label>

            <div className="sm:col-span-3">
              <Button type="submit" disabled={saving}>
                {saving ? "Adding..." : "Add item"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="divide-y divide-surface-border p-0">
        {topLevel.map((item, i) => (
          <div key={item.id}>
            <NavRow
              item={item}
              onMoveUp={i > 0 ? () => moveTopLevel(i, -1) : undefined}
              onMoveDown={i < topLevel.length - 1 ? () => moveTopLevel(i, 1) : undefined}
              onToggleVisible={() => toggleVisible(item)}
              onRemove={() => remove(item)}
            />
            {item.children.map((child, ci) => (
              <div key={child.id} className="pl-8">
                <NavRow
                  item={child}
                  onMoveUp={ci > 0 ? () => moveChild(item, ci, -1) : undefined}
                  onMoveDown={ci < item.children.length - 1 ? () => moveChild(item, ci, 1) : undefined}
                  onToggleVisible={() => toggleVisible(child)}
                  onRemove={() => remove(child)}
                />
              </div>
            ))}
          </div>
        ))}
        {topLevel.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-slate-400">No menu items yet — add one above.</p>
        )}
      </Card>
    </div>
  );
}

function NavRow({
  item,
  onMoveUp,
  onMoveDown,
  onToggleVisible,
  onRemove,
}: {
  item: AdminNavItem;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onToggleVisible: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-slate-800">{item.enLabel}</span>
        <span className="text-sm text-slate-400" dir="rtl">
          {item.arLabel}
        </span>
        <Badge tone="neutral">{item.linkType}</Badge>
        {!item.isVisible && <Badge tone="warning">Hidden</Badge>}
        {item.href && <span className="font-mono text-xs text-slate-400">{item.href}</span>}
      </div>
      <div className="flex items-center gap-1">
        <button onClick={onMoveUp} disabled={!onMoveUp} className="rounded p-1.5 text-sm hover:bg-surface-subtle disabled:opacity-30">
          ↑
        </button>
        <button onClick={onMoveDown} disabled={!onMoveDown} className="rounded p-1.5 text-sm hover:bg-surface-subtle disabled:opacity-30">
          ↓
        </button>
        <button onClick={onToggleVisible} className="rounded p-1.5 text-sm hover:bg-surface-subtle">
          {item.isVisible ? "🙈" : "👁"}
        </button>
        <button onClick={onRemove} className="rounded p-1.5 text-sm hover:bg-surface-subtle">
          🗑
        </button>
      </div>
    </div>
  );
}
