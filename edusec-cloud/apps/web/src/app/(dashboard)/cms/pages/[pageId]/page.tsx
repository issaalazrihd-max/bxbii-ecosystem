"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, type AdminPage, type AdminSection } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionContentEditor } from "@/components/cms/section-content-editor";

const BLOCK_TYPES = [
  "HERO",
  "HEADING",
  "TEXT",
  "IMAGE",
  "VIDEO",
  "BUTTON",
  "PRODUCTS",
  "PROGRAMS",
  "COURSES",
  "PROJECTS",
  "GALLERY",
  "TEAM",
  "PARTNERS",
  "CONTACT_FORM",
  "FILES",
  "PDF",
  "CUSTOM",
];

/** Page Builder editor for one page (brief Section 30) — page metadata plus
 * the ordered list of sections that make it up. */
export default function PageEditor({ params }: { params: { pageId: string } }) {
  const router = useRouter();
  const [page, setPage] = useState<AdminPage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savingMeta, setSavingMeta] = useState(false);
  const [addingType, setAddingType] = useState(BLOCK_TYPES[0]);

  const load = () => {
    api
      .getPage(params.pageId)
      .then(setPage)
      .catch((err) => setError(err.message));
  };

  useEffect(load, [params.pageId]);

  if (error) return <p className="text-sm text-status-danger">{error}</p>;
  if (!page) return <p className="text-sm text-slate-400">Loading…</p>;

  const saveMeta = async (patch: Partial<AdminPage>) => {
    setSavingMeta(true);
    setError(null);
    try {
      const updated = await api.updatePage(page.id, patch);
      setPage({ ...page, ...updated });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSavingMeta(false);
    }
  };

  const deletePage = async () => {
    try {
      await api.deletePage(page.id);
      router.push("/cms/pages");
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const addSection = async () => {
    try {
      await api.addSection(page.id, { sectionType: addingType, enContent: {}, arContent: {}, isVisible: true });
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const sections = [...page.sections].sort((a, b) => a.position - b.position);

  const move = async (index: number, dir: -1 | 1) => {
    const next = [...sections];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    try {
      await api.reorderSections(page.id, next.map((s) => s.id));
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const toggleVisible = async (section: AdminSection) => {
    try {
      await api.updateSection(page.id, section.id, { isVisible: !section.isVisible });
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const removeSection = async (sectionId: string) => {
    try {
      await api.removeSection(page.id, sectionId);
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">
          {page.slug === "" ? "Home page" : `/${page.slug}`}
        </h1>
        {!page.isSystem && (
          <Button variant="secondary" onClick={deletePage}>
            Delete page
          </Button>
        )}
      </div>

      <Card className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-4">
          <Field label="Slug">
            <input
              defaultValue={page.slug}
              onBlur={(e) => e.target.value !== page.slug && saveMeta({ slug: e.target.value })}
              disabled={page.isSystem}
              className="w-full rounded border border-surface-border px-3 py-1.5 text-sm disabled:bg-surface-subtle"
            />
          </Field>
          <Field label="Title (EN)">
            <input
              defaultValue={page.enTitle}
              onBlur={(e) => e.target.value !== page.enTitle && saveMeta({ enTitle: e.target.value })}
              className="w-full rounded border border-surface-border px-3 py-1.5 text-sm"
            />
          </Field>
          <Field label="Title (AR)">
            <input
              dir="rtl"
              defaultValue={page.arTitle}
              onBlur={(e) => e.target.value !== page.arTitle && saveMeta({ arTitle: e.target.value })}
              className="w-full rounded border border-surface-border px-3 py-1.5 text-sm"
            />
          </Field>
          <Field label="Status">
            <select
              value={page.status}
              onChange={(e) => saveMeta({ status: e.target.value as AdminPage["status"] })}
              className="w-full rounded border border-surface-border px-3 py-1.5 text-sm"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLISHED">Published</option>
              <option value="HIDDEN">Hidden</option>
            </select>
          </Field>
        </div>
        {savingMeta && <p className="text-xs text-slate-400">Saving…</p>}
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">Sections</h2>
        <div className="flex items-center gap-2">
          <select
            value={addingType}
            onChange={(e) => setAddingType(e.target.value)}
            className="rounded border border-surface-border px-2 py-1.5 text-sm"
          >
            {BLOCK_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <Button onClick={addSection}>Add section</Button>
        </div>
      </div>

      <div className="space-y-3">
        {sections.map((section, i) => (
          <SectionRow
            key={section.id}
            section={section}
            index={i}
            count={sections.length}
            onMove={move}
            onToggleVisible={() => toggleVisible(section)}
            onRemove={() => removeSection(section.id)}
            onSaveContent={async (next) => {
              try {
                await api.updateSection(page.id, section.id, next);
                load();
              } catch (err) {
                setError((err as Error).message);
              }
            }}
          />
        ))}
        {sections.length === 0 && (
          <Card className="text-center text-sm text-slate-400">No sections yet — add one above.</Card>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-500">{label}</label>
      {children}
    </div>
  );
}

function SectionRow({
  section,
  index,
  count,
  onMove,
  onToggleVisible,
  onRemove,
  onSaveContent,
}: {
  section: AdminSection;
  index: number;
  count: number;
  onMove: (index: number, dir: -1 | 1) => void;
  onToggleVisible: () => void;
  onRemove: () => void;
  onSaveContent: (next: { enContent: Record<string, unknown>; arContent: Record<string, unknown> }) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState({ enContent: section.enContent, arContent: section.arContent });
  const [dirty, setDirty] = useState(false);

  return (
    <Card>
      <div className="flex items-center justify-between">
        <button className="flex items-center gap-2 text-left" onClick={() => setExpanded((v) => !v)}>
          <span className="text-xs text-slate-400">{expanded ? "▾" : "▸"}</span>
          <Badge tone="neutral">{section.sectionType}</Badge>
          {!section.isVisible && <Badge tone="warning">Hidden</Badge>}
        </button>
        <div className="flex items-center gap-1">
          <IconButton label="Move up" disabled={index === 0} onClick={() => onMove(index, -1)}>
            ↑
          </IconButton>
          <IconButton label="Move down" disabled={index === count - 1} onClick={() => onMove(index, 1)}>
            ↓
          </IconButton>
          <IconButton label={section.isVisible ? "Hide" : "Show"} onClick={onToggleVisible}>
            {section.isVisible ? "🙈" : "👁"}
          </IconButton>
          <IconButton label="Delete" onClick={onRemove}>
            🗑
          </IconButton>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 space-y-3 border-t border-surface-border pt-4">
          <SectionContentEditor
            sectionType={section.sectionType}
            enContent={draft.enContent}
            arContent={draft.arContent}
            onChange={(next) => {
              setDraft(next);
              setDirty(true);
            }}
          />
          <Button
            onClick={() => {
              onSaveContent(draft);
              setDirty(false);
            }}
            disabled={!dirty}
          >
            Save section
          </Button>
        </div>
      )}
    </Card>
  );
}

function IconButton({
  children,
  label,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="rounded p-1.5 text-sm hover:bg-surface-subtle disabled:opacity-30"
    >
      {children}
    </button>
  );
}
