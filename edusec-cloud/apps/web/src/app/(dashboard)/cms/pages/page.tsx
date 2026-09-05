"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, type AdminPage } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const STATUS_TONE = { PUBLISHED: "success", DRAFT: "warning", HIDDEN: "neutral" } as const;

/** CMS Pages list — the entry point into the Page Builder (brief Section 29). */
export default function CmsPagesListPage() {
  const [pages, setPages] = useState<AdminPage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [slug, setSlug] = useState("");
  const [arTitle, setArTitle] = useState("");
  const [enTitle, setEnTitle] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => {
    api
      .listPages()
      .then(setPages)
      .catch((err) => setError(err.message));
  };

  useEffect(load, []);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.createPage({ slug: slug.trim(), arTitle, enTitle, status: "DRAFT" });
      setSlug("");
      setArTitle("");
      setEnTitle("");
      setCreating(false);
      load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Pages</h1>
        <Button onClick={() => setCreating((v) => !v)}>{creating ? "Cancel" : "New Page"}</Button>
      </div>

      {error && <p className="text-sm text-status-danger">{error}</p>}

      {creating && (
        <Card>
          <form onSubmit={onCreate} className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">
                Slug (empty = home page)
              </label>
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="about-us"
                pattern="[a-z0-9-]*"
                className="w-full rounded border border-surface-border px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">English title</label>
              <input
                required
                value={enTitle}
                onChange={(e) => setEnTitle(e.target.value)}
                className="w-full rounded border border-surface-border px-3 py-1.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">Arabic title</label>
              <input
                required
                dir="rtl"
                value={arTitle}
                onChange={(e) => setArTitle(e.target.value)}
                className="w-full rounded border border-surface-border px-3 py-1.5 text-sm"
              />
            </div>
            <div className="sm:col-span-3">
              <Button type="submit" disabled={saving}>
                {saving ? "Creating..." : "Create page"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="overflow-hidden p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-subtle text-slate-500">
            <tr>
              <th className="px-4 py-2">Slug</th>
              <th className="px-4 py-2">Title (EN)</th>
              <th className="px-4 py-2">Title (AR)</th>
              <th className="px-4 py-2">Sections</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody>
            {pages.map((p) => (
              <tr key={p.id} className="border-t border-surface-border">
                <td className="px-4 py-2 font-mono">{p.slug === "" ? "/ (home)" : `/${p.slug}`}</td>
                <td className="px-4 py-2">{p.enTitle}</td>
                <td className="px-4 py-2" dir="rtl">
                  {p.arTitle}
                </td>
                <td className="px-4 py-2">{p.sections?.length ?? 0}</td>
                <td className="px-4 py-2">
                  <Badge tone={STATUS_TONE[p.status]}>{p.status}</Badge>
                  {p.isSystem && (
                    <Badge tone="info" className="ml-2">
                      System
                    </Badge>
                  )}
                </td>
                <td className="px-4 py-2 text-right">
                  <Link href={`/cms/pages/${p.id}`} className="text-sm font-medium text-accent hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {pages.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  No pages yet — create one to start building the site.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
