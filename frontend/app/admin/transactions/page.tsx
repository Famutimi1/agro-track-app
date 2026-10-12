"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { StatusPill } from "@/components/ui/badge";
import {
  adminApi,
  TRANSACTION_TYPES,
  TRANSACTION_STATUSES,
  type AdminTransaction,
  type TransactionSummary,
} from "@/lib/api";
import { formatCompactCurrency } from "@/lib/utils";
import { AxiosError } from "axios";

const titleCase = (v: string) =>
  v
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });

const LIMIT = 20;

const SUMMARY_CARDS = [
  { key: "SUCCESS", label: "Successful", accent: "text-green-600" },
  { key: "PENDING", label: "Pending", accent: "text-yellow-600" },
  { key: "FAILED", label: "Failed", accent: "text-red-600" },
  { key: "REVERSED", label: "Reversed", accent: "text-gray-500" },
];

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary>({});
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getTransactions({
        search: search || undefined,
        type: typeFilter || undefined,
        status: statusFilter || undefined,
        page,
        limit: LIMIT,
      });
      setTransactions(res.data);
      setSummary(res.summary ?? {});
      setTotal(res.pagination.total);
      setTotalPages(res.pagination.totalPages);
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter, statusFilter, page]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  // Reset to first page whenever a filter changes.
  useEffect(() => {
    setPage(1);
  }, [search, typeFilter, statusFilter]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-extrabold text-[var(--text)] mb-1">Transactions</h1>
        <p className="text-[13px] text-[var(--muted)]">
          {total} transaction{total === 1 ? "" : "s"} in the ledger
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {SUMMARY_CARDS.map((c) => {
          const s = summary[c.key];
          return (
            <Card key={c.key} className="p-4">
              <p className="text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wide">{c.label}</p>
              <p className={`text-lg font-extrabold mt-1 ${c.accent}`}>
                {formatCompactCurrency(s?.amount ?? 0)}
              </p>
              <p className="text-[11px] text-[var(--muted)] mt-0.5">{s?.count ?? 0} txn{(s?.count ?? 0) === 1 ? "" : "s"}</p>
            </Card>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center gap-2 bg-[var(--input-bg)] border border-[var(--border)] rounded-[10px] px-3 py-2 flex-1 min-w-[220px] max-w-sm">
          <Search size={14} className="text-[var(--muted)]" />
          <input
            className="bg-transparent border-none outline-none text-[13px] flex-1 text-[var(--text)] placeholder:text-[var(--muted)]"
            placeholder="Search by reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-[var(--input-bg)] border border-[var(--border)] rounded-[10px] px-3 py-2 text-[13px] text-[var(--text)] outline-none"
        >
          <option value="">All types</option>
          {TRANSACTION_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[var(--input-bg)] border border-[var(--border)] rounded-[10px] px-3 py-2 text-[13px] text-[var(--text)] outline-none"
        >
          <option value="">All statuses</option>
          {TRANSACTION_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
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
        ) : transactions.length === 0 ? (
          <div className="py-16 text-center text-sm text-[var(--muted)]">No transactions found</div>
        ) : (
          <>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Reference</th>
                  <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Type</th>
                  <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Status</th>
                  <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide text-right">Amount</th>
                  <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Provider</th>
                  <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--input-bg)] transition-colors">
                    <td className="py-3 text-xs font-mono text-[var(--text)] max-w-[180px] truncate">{t.reference}</td>
                    <td className="py-3 text-xs text-[var(--text)]">{titleCase(t.type)}</td>
                    <td className="py-3"><StatusPill status={titleCase(t.status)} /></td>
                    <td className="py-3 text-xs font-semibold text-[var(--text)] text-right">
                      {t.currency} {formatCompactCurrency(Number(t.amount || 0))}
                    </td>
                    <td className="py-3 text-xs text-[var(--muted)]">{t.provider || "—"}</td>
                    <td className="py-3 text-xs text-[var(--muted)]">{fmtDateTime(t.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        )}
      </Card>
    </div>
  );
}
