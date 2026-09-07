"use client";

import { useState } from "react";

type FieldKind = "text" | "textarea" | "url" | "select-level";

interface FieldDef {
  key: string;
  label: string;
  kind: FieldKind;
  /** Bilingual fields get separate EN/AR inputs; non-bilingual fields (a
   * URL, a numeric level) are edited once and mirrored into both content
   * blobs, since the renderer picks whichever language blob is active. */
  bilingual: boolean;
}

/**
 * Field layout per Page Builder block type (brief Section 30). The simple,
 * flat blocks (Hero, Heading, Text, Image, Video, Button, PDF, Contact
 * Form, and the placeholder Products/Programs/Courses/Projects titles) get
 * real per-field inputs. List-shaped blocks (Gallery, Team, Partners, Files)
 * are edited as raw JSON below instead of hand-built repeaters — the
 * pragmatic Phase 2 tradeoff; a proper array editor is follow-up work.
 */
const SECTION_FIELDS: Record<string, FieldDef[]> = {
  HERO: [
    { key: "eyebrow", label: "Eyebrow (small label above the title)", kind: "text", bilingual: true },
    { key: "title", label: "Title", kind: "text", bilingual: true },
    { key: "subtitle", label: "Subtitle", kind: "textarea", bilingual: true },
    { key: "ctaLabel", label: "Button label", kind: "text", bilingual: true },
    { key: "ctaHref", label: "Button link", kind: "url", bilingual: false },
  ],
  HEADING: [
    { key: "text", label: "Heading text", kind: "text", bilingual: true },
    { key: "level", label: "Size (2 = large, 3 = smaller)", kind: "select-level", bilingual: false },
  ],
  TEXT: [{ key: "text", label: "Paragraph text (leave a blank line between paragraphs)", kind: "textarea", bilingual: true }],
  IMAGE: [
    { key: "url", label: "Image URL", kind: "url", bilingual: false },
    { key: "alt", label: "Alt text", kind: "text", bilingual: true },
    { key: "caption", label: "Caption", kind: "text", bilingual: true },
  ],
  VIDEO: [
    { key: "url", label: "Embed URL", kind: "url", bilingual: false },
    { key: "caption", label: "Caption", kind: "text", bilingual: true },
  ],
  BUTTON: [
    { key: "label", label: "Button label", kind: "text", bilingual: true },
    { key: "href", label: "Link", kind: "url", bilingual: false },
  ],
  PDF: [
    { key: "title", label: "Title", kind: "text", bilingual: true },
    { key: "url", label: "PDF URL", kind: "url", bilingual: false },
  ],
  CONTACT_FORM: [
    { key: "title", label: "Title", kind: "text", bilingual: true },
    { key: "description", label: "Description", kind: "textarea", bilingual: true },
    { key: "submitLabel", label: "Submit button label", kind: "text", bilingual: true },
  ],
  PRODUCTS: [{ key: "title", label: "Section title", kind: "text", bilingual: true }],
  PROGRAMS: [{ key: "title", label: "Section title", kind: "text", bilingual: true }],
  COURSES: [{ key: "title", label: "Section title", kind: "text", bilingual: true }],
  PROJECTS: [{ key: "title", label: "Section title", kind: "text", bilingual: true }],
  CUSTOM: [{ key: "html", label: "Custom HTML", kind: "textarea", bilingual: true }],
};

const JSON_TYPES = new Set(["GALLERY", "TEAM", "PARTNERS", "FILES"]);

const JSON_PLACEHOLDERS: Record<string, string> = {
  GALLERY: '{\n  "title": "Gallery",\n  "images": [{ "url": "https://...", "alt": "..." }]\n}',
  TEAM: '{\n  "title": "Our Team",\n  "members": [{ "name": "...", "role": "...", "photoUrl": "https://..." }]\n}',
  PARTNERS: '{\n  "title": "Partners",\n  "logos": [{ "name": "...", "logoUrl": "https://...", "url": "https://..." }]\n}',
  FILES: '{\n  "title": "Downloads",\n  "files": [{ "name": "...", "url": "https://..." }]\n}',
};

export function SectionContentEditor({
  sectionType,
  enContent,
  arContent,
  onChange,
}: {
  sectionType: string;
  enContent: Record<string, unknown>;
  arContent: Record<string, unknown>;
  onChange: (next: { enContent: Record<string, unknown>; arContent: Record<string, unknown> }) => void;
}) {
  if (JSON_TYPES.has(sectionType)) {
    return (
      <JsonEditor
        sectionType={sectionType}
        enContent={enContent}
        arContent={arContent}
        onChange={onChange}
      />
    );
  }

  const fields = SECTION_FIELDS[sectionType] ?? [];
  if (fields.length === 0) {
    return <p className="text-sm text-slate-400">This block type has no editable content.</p>;
  }

  const setField = (key: string, bilingual: boolean, lang: "en" | "ar", value: string) => {
    if (!bilingual) {
      onChange({ enContent: { ...enContent, [key]: value }, arContent: { ...arContent, [key]: value } });
      return;
    }
    if (lang === "en") onChange({ enContent: { ...enContent, [key]: value }, arContent });
    else onChange({ enContent, arContent: { ...arContent, [key]: value } });
  };

  return (
    <div className="space-y-4">
      {fields.map((f) => (
        <div key={f.key}>
          <label className="mb-1 block text-xs font-medium text-slate-500">{f.label}</label>
          {f.bilingual ? (
            <div className="grid gap-2 sm:grid-cols-2">
              <Input kind={f.kind} value={String(enContent[f.key] ?? "")} onChange={(v) => setField(f.key, true, "en", v)} placeholder="English" />
              <Input kind={f.kind} value={String(arContent[f.key] ?? "")} onChange={(v) => setField(f.key, true, "ar", v)} placeholder="Arabic" dir="rtl" />
            </div>
          ) : (
            <Input
              kind={f.kind}
              value={String(enContent[f.key] ?? arContent[f.key] ?? "")}
              onChange={(v) => setField(f.key, false, "en", v)}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function Input({
  kind,
  value,
  onChange,
  placeholder,
  dir,
}: {
  kind: FieldKind;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  dir?: "rtl";
}) {
  const cls = "w-full rounded border border-surface-border px-3 py-1.5 text-sm";
  if (kind === "textarea") {
    return (
      <textarea
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        dir={dir}
        className={cls}
      />
    );
  }
  if (kind === "select-level") {
    return (
      <select value={value || "2"} onChange={(e) => onChange(e.target.value)} className={cls}>
        <option value="2">2 — Large</option>
        <option value="3">3 — Smaller</option>
      </select>
    );
  }
  return (
    <input
      type={kind === "url" ? "url" : "text"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      dir={dir}
      className={cls}
    />
  );
}

function JsonEditor({
  sectionType,
  enContent,
  arContent,
  onChange,
}: {
  sectionType: string;
  enContent: Record<string, unknown>;
  arContent: Record<string, unknown>;
  onChange: (next: { enContent: Record<string, unknown>; arContent: Record<string, unknown> }) => void;
}) {
  const [enText, setEnText] = useState(JSON.stringify(enContent, null, 2));
  const [arText, setArText] = useState(JSON.stringify(arContent, null, 2));
  const [enError, setEnError] = useState<string | null>(null);
  const [arError, setArError] = useState<string | null>(null);

  const commit = (which: "en" | "ar", text: string) => {
    try {
      const parsed = text.trim() === "" ? {} : JSON.parse(text);
      if (which === "en") {
        setEnError(null);
        onChange({ enContent: parsed, arContent });
      } else {
        setArError(null);
        onChange({ enContent, arContent: parsed });
      }
    } catch {
      if (which === "en") setEnError("Invalid JSON — not saved until this is fixed.");
      else setArError("Invalid JSON — not saved until this is fixed.");
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-400">
        Advanced: edit this block&apos;s content as JSON. Example shape:
      </p>
      <pre className="whitespace-pre-wrap rounded bg-surface-subtle p-2 text-xs text-slate-500">
        {JSON_PLACEHOLDERS[sectionType]}
      </pre>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">English content (JSON)</label>
          <textarea
            rows={6}
            value={enText}
            onChange={(e) => {
              setEnText(e.target.value);
              commit("en", e.target.value);
            }}
            className="w-full rounded border border-surface-border px-3 py-1.5 font-mono text-xs"
          />
          {enError && <p className="mt-1 text-xs text-status-danger">{enError}</p>}
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Arabic content (JSON)</label>
          <textarea
            rows={6}
            dir="ltr"
            value={arText}
            onChange={(e) => {
              setArText(e.target.value);
              commit("ar", e.target.value);
            }}
            className="w-full rounded border border-surface-border px-3 py-1.5 font-mono text-xs"
          />
          {arError && <p className="mt-1 text-xs text-status-danger">{arError}</p>}
        </div>
      </div>
    </div>
  );
}
