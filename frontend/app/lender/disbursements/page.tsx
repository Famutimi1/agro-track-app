"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search, Filter, ChevronLeft, ChevronRight, RefreshCw, Download,
  Check, X, Eye, TrendingUp, Clock, DollarSign, AlertCircle, RotateCcw,
  CheckSquare, Square, Layers
} from "lucide-react";
import {
  disbursementsApi,
  type Disbursement,
  type DisbursementStats,
  type DisbursementsQuery,
  DISBURSEMENT_STATUSES,
  REJECTION_REASONS,
} from "@/lib/api/disbursements";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function DisbursementsPage() {
  const [disbursements, setDisbursements] = useState<Disbursement[]>([]);
  const [stats, setStats] = useState<DisbursementStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [layerFilter, setLayerFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const [showBulkRejectModal, setShowBulkRejectModal] = useState(false);

  const fetchDisbursements = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const query: DisbursementsQuery = { page, limit: 20 };
      if (statusFilter !== "ALL") query.status = statusFilter;
      if (layerFilter !== "ALL") query.trancheNumber = parseInt(layerFilter);

      const [listResponse, statsResponse] = await Promise.all([
        disbursementsApi.list(query),
        disbursementsApi.getStats(),
      ]);

      setDisbursements(listResponse.data);
      setTotalPages(listResponse.pagination.totalPages);
      setTotal(listResponse.pagination.total);
      setStats(statsResponse);
    } catch (err) {
      console.error("Failed to fetch disbursements:", err);
      setError("Failed to load disbursements. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, statusFilter, layerFilter]);

  useEffect(() => {
    fetchDisbursements();
  }, [fetchDisbursements]);

  const handleApprove = async (id: string) => {
    setActionLoading(true);
    try {
      await disbursementsApi.approve(id);
      fetchDisbursements(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to approve disbursement");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectingId) return;
    const reason = rejectReason === "OTHER" ? customReason : rejectReason;
    if (!reason) return;

    setActionLoading(true);
    try {
      await disbursementsApi.reject(rejectingId, reason);
      setShowRejectModal(false);
      setRejectingId(null);
      setRejectReason("");
      setCustomReason("");
      fetchDisbursements(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reject disbursement");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRetry = async (id: string) => {
    setActionLoading(true);
    try {
      await disbursementsApi.retry(id);
      fetchDisbursements(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to retry disbursement");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    setActionLoading(true);
    try {
      const result = await disbursementsApi.bulkApprove(selectedIds);
      setSelectedIds([]);
      fetchDisbursements(true);
      alert(`Approved ${result.succeeded} of ${result.total} disbursements`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to bulk approve");
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkReject = async () => {
    const reason = rejectReason === "OTHER" ? customReason : rejectReason;
    if (!reason || selectedIds.length === 0) return;

    setActionLoading(true);
    try {
      const result = await disbursementsApi.bulkReject(selectedIds, reason);
      setSelectedIds([]);
      setShowBulkRejectModal(false);
      setRejectReason("");
      setCustomReason("");
      fetchDisbursements(true);
      alert(`Rejected ${result.succeeded} of ${result.total} disbursements`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to bulk reject");
    } finally {
      setActionLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const pendingIds = disbursements.filter((d) => d.status === "PENDING").map((d) => d.id);
    if (selectedIds.length === pendingIds.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendingIds);
    }
  };

  const getStatusStyle = (status: string) => {
    const config = DISBURSEMENT_STATUSES.find((s) => s.value === status);
    return config || DISBURSEMENT_STATUSES[0];
  };

  const exportToCsv = () => {
    const headers = ["ID", "Borrower", "Farmer ID", "Program", "Layer", "Amount", "Status", "Days Waiting", "Created At"];
    const rows = disbursements.map((d) => [
      d.id,
      `${d.loan.borrower.user.firstName} ${d.loan.borrower.user.lastName}`,
      d.loan.borrower.farmerId,
      d.loan.program.name,
      d.trancheNumber,
      d.amount,
      d.status,
      d.daysWaiting || 0,
      new Date(d.createdAt).toLocaleDateString(),
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `disbursements-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Disbursements</h1>
          <p className="text-sm text-[var(--muted)]">
            {loading ? "Loading..." : `${total} disbursement records`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fetchDisbursements(true)}
            disabled={refreshing}
            className="p-2 rounded-lg border border-[var(--border)] hover:bg-[var(--surface)]"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          </button>
          <button
            onClick={exportToCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--border)] text-sm"
          >
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--muted)] uppercase font-semibold">Pending Approval</span>
              <Clock size={16} className="text-yellow-500" />
            </div>
            <p className="text-2xl font-bold text-[var(--text)]">{formatCurrency(stats.pendingApproval.amount)}</p>
            <p className="text-xs text-[var(--muted)]">{stats.pendingApproval.count} disbursements</p>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--muted)] uppercase font-semibold">Approved Today</span>
              <Check size={16} className="text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-[var(--text)]">{formatCurrency(stats.approvedToday.amount)}</p>
            <p className="text-xs text-[var(--muted)]">{stats.approvedToday.count} disbursements</p>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--muted)] uppercase font-semibold">Released This Month</span>
              <DollarSign size={16} className="text-green-500" />
            </div>
            <p className="text-2xl font-bold text-[var(--text)]">{formatCurrency(stats.releasedThisMonth.amount)}</p>
            <p className="text-xs text-[var(--muted)]">{stats.releasedThisMonth.count} disbursements</p>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--muted)] uppercase font-semibold">Avg Processing Time</span>
              <TrendingUp size={16} className="text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-[var(--text)]">{stats.avgProcessingDays} days</p>
            <p className="text-xs text-[var(--muted)]">from approval to release</p>
          </div>
        </div>
      )}

      {/* Layer Breakdown and Monthly Chart */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <h3 className="text-sm font-semibold text-[var(--text)] mb-3 flex items-center gap-2">
              <Layers size={16} /> Layer Breakdown
            </h3>
            <div className="space-y-2">
              {stats.layerBreakdown.map((layer) => {
                const totalAmount = stats.layerBreakdown.reduce((s, l) => s + l.amount, 0);
                const pct = totalAmount > 0 ? (layer.amount / totalAmount) * 100 : 0;
                return (
                  <div key={layer.layer} className="flex items-center gap-3">
                    <span className="text-xs font-medium w-16">Layer {layer.layer}</span>
                    <div className="flex-1 h-6 bg-[var(--background)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-green rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-[var(--muted)] w-20 text-right">
                      {formatCurrency(layer.amount)}
                    </span>
                    <span className="text-xs font-bold w-12 text-right">{pct.toFixed(0)}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <h3 className="text-sm font-semibold text-[var(--text)] mb-3 flex items-center gap-2">
              <TrendingUp size={16} /> Monthly Releases (Last 6 Months)
            </h3>
            <div className="flex items-end gap-2 h-32">
              {stats.monthlyTrend.map((month, idx) => {
                const maxAmount = Math.max(...stats.monthlyTrend.map((m) => m.amount), 1);
                const height = (month.amount / maxAmount) * 100;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-brand-green rounded-t"
                      style={{ height: `${height}%`, minHeight: month.amount > 0 ? 4 : 0 }}
                      title={formatCurrency(month.amount)}
                    />
                    <span className="text-[10px] text-[var(--muted)]">{month.month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap items-center">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm"
        >
          <option value="ALL">All Statuses</option>
          {DISBURSEMENT_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        <select
          value={layerFilter}
          onChange={(e) => { setLayerFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm"
        >
          <option value="ALL">All Layers</option>
          <option value="1">Layer 1</option>
          <option value="2">Layer 2</option>
          <option value="3">Layer 3</option>
        </select>

        {selectedIds.length > 0 && (
          <div className="flex gap-2 ml-auto">
            <button
              onClick={handleBulkApprove}
              disabled={actionLoading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700"
            >
              <Check size={14} /> Approve ({selectedIds.length})
            </button>
            <button
              onClick={() => setShowBulkRejectModal(true)}
              disabled={actionLoading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700"
            >
              <X size={14} /> Reject ({selectedIds.length})
            </button>
          </div>
        )}
      </div>

      {/* Disbursements Table */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-[var(--background)]">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase w-10">
                <button onClick={toggleSelectAll} className="hover:text-[var(--text)]">
                  {selectedIds.length === disbursements.filter((d) => d.status === "PENDING").length &&
                   disbursements.some((d) => d.status === "PENDING") ? (
                    <CheckSquare size={16} />
                  ) : (
                    <Square size={16} />
                  )}
                </button>
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase">Borrower</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase">Program</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase">Layer</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase">Amount</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase">Days Waiting</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase">FarmScore</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase">Status</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {loading ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-[var(--muted)]">Loading...</td>
              </tr>
            ) : disbursements.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-[var(--muted)]">No disbursements found</td>
              </tr>
            ) : disbursements.map((d) => {
              const borrowerName = `${d.loan.borrower.user.firstName} ${d.loan.borrower.user.lastName}`;
              const statusStyle = getStatusStyle(d.status);

              return (
                <tr key={d.id} className="hover:bg-[var(--background)] transition-colors">
                  <td className="px-4 py-4">
                    {d.status === "PENDING" && (
                      <button onClick={() => toggleSelect(d.id)} className="hover:text-[var(--text)]">
                        {selectedIds.includes(d.id) ? <CheckSquare size={16} /> : <Square size={16} />}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <Link href={`/lender/borrowers/${d.loan.borrower.id}`} className="hover:underline">
                      <p className="font-medium text-sm text-[var(--text)]">{borrowerName}</p>
                      <p className="text-xs text-[var(--muted)]">{d.loan.borrower.farmerId}</p>
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-sm text-[var(--muted)]">{d.loan.program.name}</td>
                  <td className="px-4 py-4">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      Layer {d.trancheNumber}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-[var(--text)]">
                    {formatCurrency(d.amount)}
                  </td>
                  <td className="px-4 py-4 text-sm text-[var(--muted)]">
                    {d.daysWaiting !== undefined ? (
                      <span className={d.daysWaiting > 7 ? "text-red-600 font-medium" : ""}>
                        {d.daysWaiting} days
                      </span>
                    ) : "-"}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-sm font-bold ${
                      d.loan.borrower.farmScore >= 700 ? "text-green-600" :
                      d.loan.borrower.farmScore >= 500 ? "text-yellow-600" : "text-red-600"
                    }`}>
                      {d.loan.borrower.farmScore}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${statusStyle.bg} ${statusStyle.color}`}>
                      {statusStyle.label}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      {d.status === "PENDING" && (
                        <>
                          <button
                            onClick={() => handleApprove(d.id)}
                            disabled={actionLoading}
                            className="w-7 h-7 rounded bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200"
                            title="Approve"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => { setRejectingId(d.id); setShowRejectModal(true); }}
                            disabled={actionLoading}
                            className="w-7 h-7 rounded bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200"
                            title="Reject"
                          >
                            <X size={14} />
                          </button>
                        </>
                      )}
                      {d.status === "FAILED" && (
                        <button
                          onClick={() => handleRetry(d.id)}
                          disabled={actionLoading}
                          className="w-7 h-7 rounded bg-yellow-100 text-yellow-600 flex items-center justify-center hover:bg-yellow-200"
                          title="Retry"
                        >
                          <RotateCcw size={14} />
                        </button>
                      )}
                      <Link
                        href={`/lender/loans/${d.loanId}`}
                        className="w-7 h-7 rounded bg-[var(--background)] text-[var(--muted)] flex items-center justify-center hover:bg-[var(--border)]"
                        title="View Loan"
                      >
                        <Eye size={14} />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-[var(--muted)]">
            Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, total)} of {total}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-[var(--border)] disabled:opacity-50"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-4 py-2 text-sm">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 rounded-lg border border-[var(--border)] disabled:opacity-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--surface)] rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-[var(--text)] mb-4">Reject Disbursement</h3>
            <p className="text-sm text-[var(--muted)] mb-4">
              Select a reason for rejecting this disbursement proof.
            </p>

            <div className="space-y-2 mb-4">
              {REJECTION_REASONS.map((reason) => (
                <label key={reason.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="rejectReason"
                    value={reason.value}
                    checked={rejectReason === reason.value}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="accent-brand-green"
                  />
                  <span className="text-sm text-[var(--text)]">{reason.label}</span>
                </label>
              ))}
            </div>

            {rejectReason === "OTHER" && (
              <textarea
                placeholder="Enter custom rejection reason..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="w-full p-3 border border-[var(--border)] rounded-lg bg-[var(--background)] text-sm mb-4"
                rows={3}
              />
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setShowRejectModal(false); setRejectingId(null); setRejectReason(""); }}
                className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason || (rejectReason === "OTHER" && !customReason) || actionLoading}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium disabled:opacity-50"
              >
                {actionLoading ? "Rejecting..." : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Reject Modal */}
      {showBulkRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--surface)] rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-[var(--text)] mb-4">
              Bulk Reject ({selectedIds.length} Disbursements)
            </h3>
            <p className="text-sm text-[var(--muted)] mb-4">
              Select a common reason for rejecting these disbursements.
            </p>

            <div className="space-y-2 mb-4">
              {REJECTION_REASONS.map((reason) => (
                <label key={reason.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="bulkRejectReason"
                    value={reason.value}
                    checked={rejectReason === reason.value}
                    onChange={(e) => setRejectReason(e.target.value)}
                    className="accent-brand-green"
                  />
                  <span className="text-sm text-[var(--text)]">{reason.label}</span>
                </label>
              ))}
            </div>

            {rejectReason === "OTHER" && (
              <textarea
                placeholder="Enter custom rejection reason..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="w-full p-3 border border-[var(--border)] rounded-lg bg-[var(--background)] text-sm mb-4"
                rows={3}
              />
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setShowBulkRejectModal(false); setRejectReason(""); }}
                className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkReject}
                disabled={!rejectReason || (rejectReason === "OTHER" && !customReason) || actionLoading}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium disabled:opacity-50"
              >
                {actionLoading ? "Rejecting..." : `Reject ${selectedIds.length}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
