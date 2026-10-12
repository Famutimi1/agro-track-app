"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { StatusPill } from "@/components/ui/badge";
import { adminApi, TICKET_STATUSES, type AdminTicket } from "@/lib/api";
import { AxiosError } from "axios";

const titleCase = (v: string) =>
  v
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const priorityClass = (p: string) => {
  if (p === "HIGH" || p === "CRITICAL") return "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400";
  if (p === "MEDIUM") return "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400";
  return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400";
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

const LIMIT = 20;

export default function SupportTicketsPage() {
  const [tickets, setTickets] = useState<AdminTicket[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  // Manage/detail modal state
  const [editing, setEditing] = useState<AdminTicket | null>(null);
  const [detail, setDetail] = useState<AdminTicket | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Reply state
  const [reply, setReply] = useState("");
  const [replying, setReplying] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getTickets({
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        page,
        limit: LIMIT,
      });
      setTickets(res.data);
      setTotal(res.pagination.total);
      setTotalPages(res.pagination.totalPages);
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || "Failed to load support tickets");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, priorityFilter, page]);

  useEffect(() => {
    load();
  }, [load]);

  // Reset to first page whenever a filter changes.
  useEffect(() => {
    setPage(1);
  }, [statusFilter, priorityFilter]);

  const needAttention = tickets.filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS").length;

  const openEdit = async (t: AdminTicket) => {
    setEditing(t);
    setSelectedStatus(t.status);
    setModalError(null);
    setReply("");
    setDetail(null);
    setDetailLoading(true);
    try {
      const full = await adminApi.getTicket(t.id);
      setDetail(full);
    } catch {
      // Fall back to the row data; thread simply won't render.
      setDetail(t);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeEdit = () => {
    if (saving || replying) return;
    setEditing(null);
    setDetail(null);
  };

  const save = async () => {
    if (!editing || selectedStatus === editing.status) return;
    setSaving(true);
    setModalError(null);
    try {
      const updated = await adminApi.updateTicket(editing.id, selectedStatus);
      setTickets((prev) => prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)));
      setEditing(null);
      setDetail(null);
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setModalError(axiosError.response?.data?.message || "Failed to update ticket");
    } finally {
      setSaving(false);
    }
  };

  const sendReply = async () => {
    if (!editing || !reply.trim()) return;
    setReplying(true);
    setModalError(null);
    try {
      const updated = await adminApi.replyTicket(editing.id, reply.trim());
      setDetail(updated);
      setReply("");
      setSelectedStatus(updated.status);
      // Reflect any status bump (OPEN → IN_PROGRESS) in the list.
      setTickets((prev) => prev.map((t) => (t.id === updated.id ? { ...t, status: updated.status } : t)));
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setModalError(axiosError.response?.data?.message || "Failed to send reply");
    } finally {
      setReplying(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-extrabold text-[var(--text)] mb-1">Support Tickets</h1>
        <p className="text-[13px] text-[var(--muted)]">
          {total} ticket{total === 1 ? "" : "s"} · {needAttention} on this page require attention
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[var(--input-bg)] border border-[var(--border)] rounded-[10px] px-3 py-2 text-[13px] text-[var(--text)] outline-none"
        >
          <option value="">All statuses</option>
          {["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"].map((s) => (
            <option key={s} value={s}>{titleCase(s)}</option>
          ))}
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="bg-[var(--input-bg)] border border-[var(--border)] rounded-[10px] px-3 py-2 text-[13px] text-[var(--text)] outline-none"
        >
          <option value="">All priorities</option>
          {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((p) => (
            <option key={p} value={p}>{titleCase(p)}</option>
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
        ) : tickets.length === 0 ? (
          <div className="py-16 text-center text-sm text-[var(--muted)]">No tickets found</div>
        ) : (
          <>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Requester</th>
                  <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Subject</th>
                  <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Priority</th>
                  <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Status</th>
                  <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Created</th>
                  <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--input-bg)] transition-colors">
                    <td className="py-3 text-xs font-medium text-[var(--text)]">
                      {t.user.firstName} {t.user.lastName}
                      <span className="block text-[10px] text-[var(--muted)] font-normal">{t.user.email}</span>
                    </td>
                    <td className="py-3 text-xs text-[var(--text)] max-w-[250px] truncate">{t.subject}</td>
                    <td className="py-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${priorityClass(t.priority)}`}>
                        {titleCase(t.priority)}
                      </span>
                    </td>
                    <td className="py-3"><StatusPill status={titleCase(t.status)} /></td>
                    <td className="py-3 text-xs text-[var(--muted)]">{fmtDate(t.createdAt)}</td>
                    <td className="py-3 text-right">
                      <Button size="sm" variant="secondary" onClick={() => openEdit(t)}>
                        Manage
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </Card>

      <Modal open={!!editing} onClose={closeEdit} title="Manage ticket">
        {editing && (
          <div className="space-y-4">
            <div className="p-3 bg-[var(--input-bg)] rounded-lg">
              <p className="text-sm font-semibold text-[var(--text)]">{editing.subject}</p>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                {editing.user.firstName} {editing.user.lastName} · {editing.user.email}
              </p>
              {editing.description && (
                <p className="text-xs text-[var(--text)] mt-2 whitespace-pre-wrap">{editing.description}</p>
              )}
            </div>

            {/* Conversation thread */}
            <div>
              <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">Conversation</label>
              {detailLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-brand-green" />
                </div>
              ) : detail?.messages && detail.messages.length > 0 ? (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {detail.messages.map((m) => (
                    <div
                      key={m.id}
                      className={`p-2.5 rounded-lg text-xs ${
                        m.isStaff
                          ? "bg-brand-green/[0.08] border border-brand-green/20"
                          : "bg-[var(--input-bg)]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-semibold text-[var(--text)]">
                          {m.author ? `${m.author.firstName} ${m.author.lastName}` : "User"}
                          {m.isStaff && <span className="ml-1 text-[10px] text-brand-green font-bold">· Staff</span>}
                        </span>
                        <span className="text-[10px] text-[var(--muted)]">{fmtDateTime(m.createdAt)}</span>
                      </div>
                      <p className="text-[var(--text)] whitespace-pre-wrap">{m.body}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-[var(--muted)] py-2">No replies yet.</p>
              )}
            </div>

            {/* Reply composer */}
            <div>
              <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">Reply</label>
              <textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={3}
                placeholder="Write a reply to the requester..."
                className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-[10px] px-3 py-2.5 text-sm text-[var(--text)] outline-none resize-none placeholder:text-[var(--muted)]"
              />
              <div className="flex justify-end mt-2">
                <Button size="sm" onClick={sendReply} disabled={replying || !reply.trim()}>
                  {replying ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>
                  ) : (
                    <><Send className="mr-2 h-4 w-4" /> Send reply</>
                  )}
                </Button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-[10px] px-3 py-2.5 text-sm text-[var(--text)] outline-none"
              >
                {TICKET_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <p className="text-[11px] text-[var(--muted)] mt-1.5">
                Marking Resolved or Closed records a resolution time.
              </p>
            </div>

            {modalError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {modalError}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={closeEdit} disabled={saving || replying}>
                Cancel
              </Button>
              <Button onClick={save} disabled={saving || replying || selectedStatus === editing.status}>
                {saving ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                ) : (
                  "Update status"
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
