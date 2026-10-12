"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, ExternalLink, Check, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { StatusPill } from "@/components/ui/badge";
import {
  adminApi,
  DOCUMENT_STATUSES,
  DOCUMENT_TYPES,
  type AdminDocument,
} from "@/lib/api";
import { AxiosError } from "axios";

const titleCase = (v: string) =>
  v
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

// Backend maps the VerificationStatus enum onto human labels; FAILED reads as "Rejected".
const statusLabel = (s: string) => (s === "FAILED" ? "Rejected" : titleCase(s));

const ownerOf = (d: AdminDocument) => {
  const u = d.user ?? d.borrower?.user;
  if (!u) return { name: "—", email: "" };
  return { name: `${u.firstName} ${u.lastName}`.trim(), email: u.email };
};

const LIMIT = 20;

export default function VerificationPage() {
  const [documents, setDocuments] = useState<AdminDocument[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  // Review modal state
  const [reviewing, setReviewing] = useState<AdminDocument | null>(null);
  const [decision, setDecision] = useState<"APPROVED" | "REJECTED" | null>(null);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getDocuments({
        status: statusFilter || undefined,
        type: typeFilter || undefined,
        page,
        limit: LIMIT,
      });
      setDocuments(res.data);
      setTotal(res.pagination.total);
      setTotalPages(res.pagination.totalPages);
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || "Failed to load documents");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, page]);

  useEffect(() => {
    load();
  }, [load]);

  // Reset to first page whenever a filter changes.
  useEffect(() => {
    setPage(1);
  }, [statusFilter, typeFilter]);

  const pending = documents.filter((d) => d.status === "PENDING").length;

  const openReview = (d: AdminDocument) => {
    setReviewing(d);
    setDecision(null);
    setReason("");
    setModalError(null);
  };

  const closeReview = () => {
    if (saving) return;
    setReviewing(null);
  };

  const submit = async () => {
    if (!reviewing || !decision) return;
    if (decision === "REJECTED" && !reason.trim()) {
      setModalError("A rejection reason is required.");
      return;
    }
    setSaving(true);
    setModalError(null);
    try {
      const updated = await adminApi.verifyDocument(
        reviewing.id,
        decision,
        decision === "REJECTED" ? reason.trim() : undefined
      );
      setDocuments((prev) => prev.map((d) => (d.id === updated.id ? { ...d, ...updated } : d)));
      setReviewing(null);
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setModalError(axiosError.response?.data?.message || "Failed to update document");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-extrabold text-[var(--text)] mb-1">Verification Queue</h1>
        <p className="text-[13px] text-[var(--muted)]">
          {total} document{total === 1 ? "" : "s"} · {pending} pending on this page
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[var(--input-bg)] border border-[var(--border)] rounded-[10px] px-3 py-2 text-[13px] text-[var(--text)] outline-none"
        >
          <option value="">All statuses</option>
          {DOCUMENT_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-[var(--input-bg)] border border-[var(--border)] rounded-[10px] px-3 py-2 text-[13px] text-[var(--text)] outline-none"
        >
          <option value="">All types</option>
          {DOCUMENT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      <Card className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-brand-green" />
          </div>
        ) : documents.length === 0 ? (
          <div className="py-16 text-center text-sm text-[var(--muted)]">No documents found</div>
        ) : (
          <>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Owner</th>
                  <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Type</th>
                  <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">File</th>
                  <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Status</th>
                  <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Submitted</th>
                  <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((d) => {
                  const owner = ownerOf(d);
                  return (
                    <tr key={d.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--input-bg)] transition-colors">
                      <td className="py-3 text-xs font-medium text-[var(--text)]">
                        {owner.name}
                        {owner.email && <span className="block text-[10px] text-[var(--muted)] font-normal">{owner.email}</span>}
                      </td>
                      <td className="py-3 text-xs text-[var(--text)]">{titleCase(d.type)}</td>
                      <td className="py-3 text-xs">
                        <a
                          href={d.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-brand-green hover:underline max-w-[180px] truncate"
                        >
                          <span className="truncate">{d.fileName}</span>
                          <ExternalLink size={11} className="flex-shrink-0" />
                        </a>
                      </td>
                      <td className="py-3"><StatusPill status={statusLabel(d.status)} /></td>
                      <td className="py-3 text-xs text-[var(--muted)]">{fmtDate(d.createdAt)}</td>
                      <td className="py-3 text-right">
                        <Button size="sm" variant="secondary" onClick={() => openReview(d)}>
                          Review
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </Card>

      <Modal open={!!reviewing} onClose={closeReview} title="Review document">
        {reviewing && (
          <div className="space-y-4">
            <div className="p-3 bg-[var(--input-bg)] rounded-lg space-y-1">
              <p className="text-sm font-semibold text-[var(--text)]">{titleCase(reviewing.type)}</p>
              <p className="text-xs text-[var(--muted)]">
                {ownerOf(reviewing).name}
                {ownerOf(reviewing).email ? ` · ${ownerOf(reviewing).email}` : ""}
              </p>
              <a
                href={reviewing.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-brand-green hover:underline mt-1"
              >
                {reviewing.fileName}
                <ExternalLink size={11} />
              </a>
              <p className="text-[11px] text-[var(--muted)]">
                Current status: {statusLabel(reviewing.status)}
              </p>
              {reviewing.rejectionReason && (
                <p className="text-[11px] text-red-600">Reason: {reviewing.rejectionReason}</p>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">Decision</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDecision("APPROVED")}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-[10px] text-sm font-semibold border transition-colors ${
                    decision === "APPROVED"
                      ? "bg-green-600 text-white border-green-600"
                      : "bg-[var(--input-bg)] text-[var(--text)] border-[var(--border)] hover:border-green-500"
                  }`}
                >
                  <Check size={15} /> Approve
                </button>
                <button
                  type="button"
                  onClick={() => setDecision("REJECTED")}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-[10px] text-sm font-semibold border transition-colors ${
                    decision === "REJECTED"
                      ? "bg-red-600 text-white border-red-600"
                      : "bg-[var(--input-bg)] text-[var(--text)] border-[var(--border)] hover:border-red-500"
                  }`}
                >
                  <X size={15} /> Reject
                </button>
              </div>
            </div>

            {decision === "REJECTED" && (
              <div>
                <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">Rejection reason</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  placeholder="Explain why this document was rejected..."
                  className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-[10px] px-3 py-2.5 text-sm text-[var(--text)] outline-none resize-none placeholder:text-[var(--muted)]"
                />
              </div>
            )}

            {modalError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {modalError}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={closeReview} disabled={saving}>
                Cancel
              </Button>
              <Button
                onClick={submit}
                disabled={saving || !decision || (decision === "REJECTED" && !reason.trim())}
              >
                {saving ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                ) : (
                  "Submit decision"
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
