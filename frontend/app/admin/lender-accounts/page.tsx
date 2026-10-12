"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { StatusPill, PlanBadge } from "@/components/ui/badge";
import { adminApi, LENDER_STATUSES, LENDER_PLANS, type AdminLenderAccount } from "@/lib/api";
import { formatCompactCurrency } from "@/lib/utils";
import { AxiosError } from "axios";

// Backend enums are UPPER_SNAKE; the badge components key on Title Case.
const titleCase = (v: string) =>
  v
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const LIMIT = 20;

export default function LenderAccountsPage() {
  const [lenders, setLenders] = useState<AdminLenderAccount[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [planFilter, setPlanFilter] = useState("");

  // Manage modal state
  const [editing, setEditing] = useState<AdminLenderAccount | null>(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getLenders({
        search: search || undefined,
        status: statusFilter || undefined,
        plan: planFilter || undefined,
        page,
        limit: LIMIT,
      });
      setLenders(res.data);
      setTotal(res.pagination.total);
      setTotalPages(res.pagination.totalPages);
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || "Failed to load lender accounts");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, planFilter, page]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  // Reset to first page whenever a filter changes.
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, planFilter]);

  const openEdit = (l: AdminLenderAccount) => {
    setEditing(l);
    setSelectedStatus(l.status);
    setSelectedPlan(l.plan);
    setModalError(null);
  };

  const closeEdit = () => {
    if (saving) return;
    setEditing(null);
  };

  const save = async () => {
    if (!editing) return;
    const statusChanged = selectedStatus !== editing.status;
    const planChanged = selectedPlan !== editing.plan;
    if (!statusChanged && !planChanged) return;

    setSaving(true);
    setModalError(null);
    try {
      let updated = editing;
      if (statusChanged) updated = await adminApi.setLenderStatus(editing.id, selectedStatus);
      if (planChanged) updated = await adminApi.changeLenderPlan(editing.id, selectedPlan);
      const finalRow = updated;
      setLenders((prev) => prev.map((l) => (l.id === finalRow.id ? { ...l, ...finalRow } : l)));
      setEditing(null);
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setModalError(axiosError.response?.data?.message || "Failed to update lender");
      // Reload to reconcile if a partial (status-only) update went through.
      load();
    } finally {
      setSaving(false);
    }
  };

  const dirty = editing && (selectedStatus !== editing.status || selectedPlan !== editing.plan);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-extrabold text-[var(--text)] mb-1">
          Lender Accounts
        </h1>
        <p className="text-[13px] text-[var(--muted)]">
          {total} registered lender organization{total === 1 ? "" : "s"}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center gap-2 bg-[var(--input-bg)] border border-[var(--border)] rounded-[10px] px-3 py-2 flex-1 min-w-[220px] max-w-sm">
          <Search size={14} className="text-[var(--muted)]" />
          <input
            className="bg-transparent border-none outline-none text-[13px] flex-1 text-[var(--text)] placeholder:text-[var(--muted)]"
            placeholder="Search lenders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[var(--input-bg)] border border-[var(--border)] rounded-[10px] px-3 py-2 text-[13px] text-[var(--text)] outline-none"
        >
          <option value="">All statuses</option>
          {LENDER_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="bg-[var(--input-bg)] border border-[var(--border)] rounded-[10px] px-3 py-2 text-[13px] text-[var(--text)] outline-none"
        >
          <option value="">All plans</option>
          {LENDER_PLANS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
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
        ) : lenders.length === 0 ? (
          <div className="py-16 text-center text-sm text-[var(--muted)]">No lenders found</div>
        ) : (
          <>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Organization</th>
                  <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Type</th>
                  <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Plan</th>
                  <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Status</th>
                  <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Programs</th>
                  <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Users</th>
                  <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Borrowers</th>
                  <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Disbursed</th>
                  <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {lenders.map((l) => (
                  <tr key={l.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--input-bg)] transition-colors">
                    <td className="py-3 text-xs font-medium text-[var(--text)] max-w-[200px] truncate">{l.name}</td>
                    <td className="py-3 text-xs text-[var(--muted)]">{l.type}</td>
                    <td className="py-3"><PlanBadge plan={titleCase(l.plan)} /></td>
                    <td className="py-3"><StatusPill status={titleCase(l.status)} /></td>
                    <td className="py-3 text-xs text-[var(--text)]">{l._count?.programs ?? 0}</td>
                    <td className="py-3 text-xs text-[var(--text)]">{l._count?.users ?? 0}</td>
                    <td className="py-3 text-xs text-[var(--text)]">{l.activeBorrowers.toLocaleString()}</td>
                    <td className="py-3 text-xs font-semibold text-[var(--text)]">{formatCompactCurrency(Number(l.totalDisbursed || 0))}</td>
                    <td className="py-3 text-right">
                      <Button size="sm" variant="secondary" onClick={() => openEdit(l)}>
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

      <Modal open={!!editing} onClose={closeEdit} title="Manage lender">
        {editing && (
          <div className="space-y-4">
            <div className="p-3 bg-[var(--input-bg)] rounded-lg">
              <p className="text-sm font-semibold text-[var(--text)]">{editing.name}</p>
              <p className="text-xs text-[var(--muted)] mt-0.5">{editing.type} · {editing.email}</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-[10px] px-3 py-2.5 text-sm text-[var(--text)] outline-none"
              >
                {LENDER_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <p className="text-[11px] text-[var(--muted)] mt-1.5">
                Suspending or deactivating blocks the organization&apos;s access. Activating marks it verified.
              </p>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">Plan</label>
              <select
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-[10px] px-3 py-2.5 text-sm text-[var(--text)] outline-none"
              >
                {LENDER_PLANS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            {modalError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {modalError}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={closeEdit} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={save} disabled={saving || !dirty}>
                {saving ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                ) : (
                  "Save changes"
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
