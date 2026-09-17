"use client";

import { useEffect, useMemo, useState } from "react";
import { api, type AdminContactSubmission } from "@/lib/api-client";
import { whatsappApi } from "@/lib/whatsapp-api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function statusTone(status: AdminContactSubmission["status"]) {
  if (status === "NEW") return "info" as const;
  if (status === "READ") return "success" as const;
  return "neutral" as const;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function programFromSubject(subject: string | null) {
  if (!subject?.startsWith("Program Interest — ")) return "";
  return subject.replace("Program Interest — ", "").trim();
}

function whatsappHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : "#";
}

export default function CmsContactPage() {
  const [submissions, setSubmissions] = useState<AdminContactSubmission[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | AdminContactSubmission["status"]>("ALL");
  const [programFilter, setProgramFilter] = useState("ALL");
  const [whatsappLead, setWhatsappLead] = useState<AdminContactSubmission | null>(null);
  const [whatsappText, setWhatsappText] = useState("");
  const [whatsappBusy, setWhatsappBusy] = useState(false);
  const [whatsappError, setWhatsappError] = useState<string | null>(null);

  const load = () => {
    api.listContactSubmissions().then(setSubmissions).catch((err) => setError(err.message));
  };

  useEffect(() => { load(); }, []);

  const programs = useMemo(
    () => Array.from(new Set(submissions.map((s) => programFromSubject(s.subject)).filter(Boolean))).sort(),
    [submissions],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return submissions.filter((s) => {
      const program = programFromSubject(s.subject);
      if (statusFilter !== "ALL" && s.status !== statusFilter) return false;
      if (programFilter !== "ALL" && program !== programFilter) return false;
      if (!q) return true;
      return [s.name, s.email, s.phone ?? "", s.subject ?? "", s.message].some((value) => value.toLowerCase().includes(q));
    });
  }, [submissions, search, statusFilter, programFilter]);

  const toggleExpand = (submission: AdminContactSubmission) => {
    const nowExpanding = expandedId !== submission.id;
    setExpandedId(nowExpanding ? submission.id : null);
    if (nowExpanding && submission.status === "NEW") setStatus(submission, "READ");
  };

  const setStatus = async (submission: AdminContactSubmission, status: AdminContactSubmission["status"]) => {
    setBusyId(submission.id);
    setError(null);
    try {
      await api.updateContactSubmissionStatus(submission.id, status);
      load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (submission: AdminContactSubmission) => {
    setBusyId(submission.id);
    setError(null);
    try {
      await api.deleteContactSubmission(submission.id);
      if (expandedId === submission.id) setExpandedId(null);
      load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusyId(null);
    }
  };

  const openWhatsApp = (submission: AdminContactSubmission) => {
    setWhatsappLead(submission);
    setWhatsappText("");
    setWhatsappError(null);
  };

  const sendWhatsApp = async () => {
    if (!whatsappLead || !whatsappText.trim()) return;
    setWhatsappBusy(true);
    setWhatsappError(null);
    try {
      await whatsappApi.send(whatsappLead.phone ?? "", whatsappText.trim());
      setWhatsappText("");
      setWhatsappLead(null);
    } catch (err) {
      setWhatsappError((err as Error).message);
    } finally {
      setWhatsappBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Sales Leads</h1>
          <p className="mt-1 text-sm text-slate-500">Program interest and website enquiries</p>
        </div>
        <span className="text-sm text-slate-500">{filtered.length} of {submissions.length}</span>
      </div>

      <div className="grid gap-2 md:grid-cols-[1fr_180px_240px]">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name, email, phone or message" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-slate-400" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none">
          <option value="ALL">All statuses</option><option value="NEW">New</option><option value="READ">Read</option><option value="ARCHIVED">Archived</option>
        </select>
        <select value={programFilter} onChange={(e) => setProgramFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none">
          <option value="ALL">All programs</option>
          {programs.map((program) => <option key={program} value={program}>{program}</option>)}
        </select>
      </div>

      {error && <p className="text-sm text-status-danger">{error}</p>}

      <Card className="divide-y divide-surface-border p-0">
        {filtered.map((s) => {
          const program = programFromSubject(s.subject);
          return <div key={s.id}>
            <button onClick={() => toggleExpand(s)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-surface-subtle">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <Badge tone={statusTone(s.status)}>{s.status}</Badge>
                {program && <Badge tone="neutral">{program}</Badge>}
                <span className="shrink-0 text-sm font-medium text-slate-800">{s.name}</span>
                <span className="shrink-0 text-sm text-slate-400">{s.email}</span>
                <span className="truncate text-sm text-slate-500">{program ? "Program interest" : s.subject || s.message}</span>
              </div>
              <span className="shrink-0 text-xs text-slate-400">{formatDate(s.createdAt)}</span>
            </button>

            {expandedId === s.id && <div className="border-t border-surface-border bg-surface-subtle px-4 py-4">
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div><dt className="font-medium text-slate-700">Name</dt><dd className="text-slate-600">{s.name}</dd></div>
                <div><dt className="font-medium text-slate-700">Email</dt><dd className="text-slate-600">{s.email}</dd></div>
                {s.phone && <div><dt className="font-medium text-slate-700">Phone</dt><dd className="text-slate-600">{s.phone}</dd></div>}
                {program && <div><dt className="font-medium text-slate-700">Program</dt><dd className="text-slate-600">{program}</dd></div>}
                {s.subject && <div><dt className="font-medium text-slate-700">Subject</dt><dd className="text-slate-600">{s.subject}</dd></div>}
              </dl>
              <div className="mt-3"><dt className="text-sm font-medium text-slate-700">Message</dt><dd className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{s.message}</dd></div>

              <div className="mt-4 flex flex-wrap gap-2">
                <a href={`mailto:${s.email}?subject=${encodeURIComponent(s.subject || "Follow-up from BXBII")}`} className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Email</a>
                {s.phone && <a href={`tel:${s.phone}`} className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Call</a>}
                {s.phone && <a href={whatsappHref(s.phone)} target="_blank" rel="noreferrer" className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">WhatsApp</a>}
                {s.phone && <Button variant="secondary" onClick={() => openWhatsApp(s)}>Reply in site</Button>}
                <Button variant="secondary" disabled={busyId === s.id || s.status === "READ"} onClick={() => setStatus(s, "READ")}>Mark read</Button>
                <Button variant="secondary" disabled={busyId === s.id || s.status === "ARCHIVED"} onClick={() => setStatus(s, "ARCHIVED")}>Archive</Button>
                <Button variant="ghost" disabled={busyId === s.id} onClick={() => remove(s)}>Delete</Button>
              </div>
            </div>}
          </div>;
        })}
        {filtered.length === 0 && <p className="px-4 py-8 text-center text-sm text-slate-400">No leads match the current filters</p>}
      </Card>

      {whatsappLead && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" onMouseDown={(e) => { if (e.target === e.currentTarget) setWhatsappLead(null); }}>
        <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div><h2 className="text-lg font-semibold text-slate-900">Reply on WhatsApp</h2><p className="mt-1 text-sm text-slate-500">{whatsappLead.name} · {whatsappLead.phone}</p></div>
            <button onClick={() => setWhatsappLead(null)} className="text-slate-400 hover:text-slate-700">×</button>
          </div>
          <textarea value={whatsappText} onChange={(e) => setWhatsappText(e.target.value)} rows={6} placeholder="Write your reply..." className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400" />
          {whatsappError && <p className="mt-2 text-sm text-status-danger">{whatsappError}</p>}
          <div className="mt-4 flex justify-end gap-2"><Button variant="ghost" onClick={() => setWhatsappLead(null)}>Cancel</Button><Button disabled={whatsappBusy || !whatsappText.trim()} onClick={sendWhatsApp}>{whatsappBusy ? "Sending…" : "Send WhatsApp"}</Button></div>
        </div>
      </div>}
    </div>
  );
}
