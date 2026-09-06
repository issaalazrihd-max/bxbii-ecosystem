"use client";

import { useEffect, useState } from "react";
import { api, type AdminContactSubmission } from "@/lib/api-client";
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

/**
 * Contact submissions inbox (Contact module) — the CMS backing the public
 * /contact-us page's form. Modeled directly on the Programs list
 * (cms/programs/page.tsx): a flat list with inline click-to-expand rather
 * than a separate [submissionId] route, since a submission has no nested
 * sub-resource. Unlike Programs there is no create form here — every row
 * comes from a real visitor submitting the public form — and no reorder,
 * since the list is always sorted by recency (newest first) server-side.
 */
export default function CmsContactPage() {
  const [submissions, setSubmissions] = useState<AdminContactSubmission[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = () => {
    api
      .listContactSubmissions()
      .then(setSubmissions)
      .catch((err) => setError(err.message));
  };

  useEffect(load, []);

  const toggleExpand = (submission: AdminContactSubmission) => {
    const nowExpanding = expandedId !== submission.id;
    setExpandedId(nowExpanding ? submission.id : null);
    // Reading a message marks it read, same as any real inbox.
    if (nowExpanding && submission.status === "NEW") {
      setStatus(submission, "READ");
    }
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Messages</h1>
      </div>

      {error && <p className="text-sm text-status-danger">{error}</p>}

      <Card className="divide-y divide-surface-border p-0">
        {submissions.map((s) => (
          <div key={s.id}>
            <button
              onClick={() => toggleExpand(s)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-surface-subtle"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <Badge tone={statusTone(s.status)}>{s.status}</Badge>
                <span className="shrink-0 text-sm font-medium text-slate-800">{s.name}</span>
                <span className="shrink-0 text-sm text-slate-400">{s.email}</span>
                <span className="truncate text-sm text-slate-500">{s.subject || s.message}</span>
              </div>
              <span className="shrink-0 text-xs text-slate-400">{formatDate(s.createdAt)}</span>
            </button>

            {expandedId === s.id && (
              <div className="border-t border-surface-border bg-surface-subtle px-4 py-4">
                <dl className="grid gap-2 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="font-medium text-slate-700">Name</dt>
                    <dd className="text-slate-600">{s.name}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-700">Email</dt>
                    <dd className="text-slate-600">{s.email}</dd>
                  </div>
                  {s.phone && (
                    <div>
                      <dt className="font-medium text-slate-700">Phone</dt>
                      <dd className="text-slate-600">{s.phone}</dd>
                    </div>
                  )}
                  {s.subject && (
                    <div>
                      <dt className="font-medium text-slate-700">Subject</dt>
                      <dd className="text-slate-600">{s.subject}</dd>
                    </div>
                  )}
                </dl>
                <div className="mt-3">
                  <dt className="text-sm font-medium text-slate-700">Message</dt>
                  <dd className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{s.message}</dd>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    disabled={busyId === s.id || s.status === "READ"}
                    onClick={() => setStatus(s, "READ")}
                  >
                    Mark read
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={busyId === s.id || s.status === "ARCHIVED"}
                    onClick={() => setStatus(s, "ARCHIVED")}
                  >
                    Archive
                  </Button>
                  <Button variant="ghost" disabled={busyId === s.id} onClick={() => remove(s)}>
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
        {submissions.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-slate-400">
            No messages yet — submissions from the /contact-us page will show up here.
          </p>
        )}
      </Card>
    </div>
  );
}
