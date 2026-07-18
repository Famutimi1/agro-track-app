"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search, ChevronLeft, ChevronRight, RefreshCw, Download, Eye, Check,
  AlertTriangle, Clock, DollarSign, TrendingUp, Bell, XCircle, RotateCcw,
  CheckSquare, Square, Calendar, CreditCard
} from "lucide-react";
import {
  repaymentsApi,
  type Repayment,
  type RepaymentStats,
  type RepaymentsQuery,
  REPAYMENT_STATUSES,
  PAYMENT_METHODS,
  WAIVER_REASONS,
} from "@/lib/api/repayments";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("en-NG", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function RepaymentsPage() {
  const [repayments, setRepayments] = useState<Repayment[]>([]);
  const [stats, setStats] = useState<RepaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"all" | "overdue" | "scheduled">("all");

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [showWaiveModal, setShowWaiveModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [activeRepaymentId, setActiveRepaymentId] = useState<string | null>(null);

  // Record payment form
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentRef, setPaymentRef] = useState("");

  // Waiver form
  const [waiverReason, setWaiverReason] = useState("");
  const [customWaiverReason, setCustomWaiverReason] = useState("");

  // Reminder form
  const [reminderChannels, setReminderChannels] = useState<string[]>(["SMS"]);
  const [reminderMessage, setReminderMessage] = useState("");

  const fetchRepayments = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      let listResponse;
      if (viewMode === "overdue") {
        listResponse = await repaymentsApi.getOverdue({ page, limit: 20 });
      } else if (viewMode === "scheduled") {
        listResponse = await repaymentsApi.getScheduled({ page, limit: 20, days: 30 });
      } else {
        const query: RepaymentsQuery = { page, limit: 20 };
        if (statusFilter !== "ALL") query.status = statusFilter;
        if (methodFilter !== "ALL") query.method = methodFilter;
        listResponse = await repaymentsApi.list(query);
      }

      const statsResponse = await repaymentsApi.getStats();

      setRepayments(listResponse.data);
      setTotalPages(listResponse.pagination.totalPages);
      setTotal(listResponse.pagination.total);
      setStats(statsResponse);
    } catch (err) {
      console.error("Failed to fetch repayments:", err);
      setError("Failed to load repayments. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, statusFilter, methodFilter, viewMode]);

  useEffect(() => {
    fetchRepayments();
  }, [fetchRepayments]);

  const handleRecordPayment = async () => {
    if (!activeRepaymentId || !paymentAmount || !paymentMethod) return;

    setActionLoading(true);
    try {
      await repaymentsApi.recordPayment(activeRepaymentId, {
        amount: parseFloat(paymentAmount),
        method: paymentMethod,
        reference: paymentRef || undefined,
      });
      setShowRecordModal(false);
      resetForms();
      fetchRepayments(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to record payment");
    } finally {
      setActionLoading(false);
    }
  };

  const handleWaive = async () => {
    if (!activeRepaymentId || !waiverReason) return;
    const reason = waiverReason === "OTHER" ? customWaiverReason : waiverReason;
    if (!reason) return;

    setActionLoading(true);
    try {
      await repaymentsApi.waive(activeRepaymentId, reason);
      setShowWaiveModal(false);
      resetForms();
      fetchRepayments(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to waive repayment");
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkDefaulted = async (id: string) => {
    if (!confirm("Are you sure you want to mark this repayment as defaulted? This will affect the borrower's FarmScore.")) {
      return;
    }

    setActionLoading(true);
    try {
      await repaymentsApi.markDefaulted(id);
      fetchRepayments(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to mark as defaulted");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendReminders = async () => {
    if (selectedIds.length === 0 || reminderChannels.length === 0) return;

    const borrowerIds = repayments
      .filter((r) => selectedIds.includes(r.id))
      .map((r) => r.loan.borrower.id);

    setActionLoading(true);
    try {
      const result = await repaymentsApi.sendReminders(
        borrowerIds,
        reminderChannels,
        reminderMessage || undefined
      );
      setShowReminderModal(false);
      setSelectedIds([]);
      resetForms();
      alert(`Sent reminders to ${result.sent} borrowers`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send reminders");
    } finally {
      setActionLoading(false);
    }
  };

  const resetForms = () => {
    setActiveRepaymentId(null);
    setPaymentAmount("");
    setPaymentMethod("");
    setPaymentRef("");
    setWaiverReason("");
    setCustomWaiverReason("");
    setReminderMessage("");
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    const eligibleIds = repayments
      .filter((r) => ["PENDING", "LATE", "OVERDUE"].includes(r.status))
      .map((r) => r.id);
    if (selectedIds.length === eligibleIds.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(eligibleIds);
    }
  };

  const getStatusStyle = (status: string) => {
    return REPAYMENT_STATUSES.find((s) => s.value === status) || REPAYMENT_STATUSES[0];
  };

  const exportToCsv = () => {
    const headers = ["ID", "Borrower", "Program", "Amount Due", "Due Date", "Status", "Paid Amount", "Paid Date", "Method", "Days Late"];
    const rows = repayments.map((r) => [
      r.id,
      `${r.loan.borrower.user.firstName} ${r.loan.borrower.user.lastName}`,
      r.loan.program.name,
      r.amount,
      formatDate(r.dueDate),
      r.status,
      r.paidAmount || "",
      r.paidAt ? formatDate(r.paidAt) : "",
      r.paymentMethod || "",
      r.daysLate || 0,
    ]);
    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `repayments-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Repayments</h1>
          <p className="text-sm text-[var(--muted)]">
            {loading ? "Loading..." : `${total} repayment records`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fetchRepayments(true)}
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
              <span className="text-xs text-[var(--muted)] uppercase font-semibold">Collected This Month</span>
              <DollarSign size={16} className="text-green-500" />
            </div>
            <p className="text-2xl font-bold text-[var(--text)]">{formatCurrency(stats.collectedThisMonth.amount)}</p>
            <p className="text-xs text-[var(--muted)]">{stats.collectedThisMonth.count} payments</p>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--muted)] uppercase font-semibold">On-Time Rate</span>
              <TrendingUp size={16} className="text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-[var(--text)]">{stats.onTimeRate}%</p>
            <p className="text-xs text-[var(--muted)]">payments by due date</p>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--muted)] uppercase font-semibold">Overdue Balance</span>
              <AlertTriangle size={16} className="text-red-500" />
            </div>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.overdueBalance)}</p>
            <p className="text-xs text-[var(--muted)]">{stats.overdueCount} overdue payments</p>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--muted)] uppercase font-semibold">Payment Methods</span>
              <CreditCard size={16} className="text-purple-500" />
            </div>
            <div className="space-y-1">
              {stats.methodBreakdown.slice(0, 3).map((m) => (
                <div key={m.method} className="flex justify-between text-xs">
                  <span className="text-[var(--muted)]">{m.method.replace("_", " ")}</span>
                  <span className="font-medium">{m.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Repayment Trend Chart */}
      {stats && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 mb-6">
          <h3 className="text-sm font-semibold text-[var(--text)] mb-3">Repayment Trend (Last 6 Months)</h3>
          <div className="flex items-end gap-2 h-32">
            {stats.monthlyTrend.map((month, idx) => {
              const total = month.onTime + month.late + month.defaulted;
              const maxTotal = Math.max(...stats.monthlyTrend.map((m) => m.onTime + m.late + m.defaulted), 1);
              const heightPct = (total / maxTotal) * 100;
              const onTimePct = total > 0 ? (month.onTime / total) * 100 : 0;
              const latePct = total > 0 ? (month.late / total) * 100 : 0;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t overflow-hidden flex flex-col-reverse"
                    style={{ height: `${heightPct}%`, minHeight: total > 0 ? 4 : 0 }}
                  >
                    <div className="bg-green-500" style={{ height: `${onTimePct}%` }} />
                    <div className="bg-yellow-500" style={{ height: `${latePct}%` }} />
                    <div className="bg-red-500" style={{ height: `${100 - onTimePct - latePct}%` }} />
                  </div>
                  <span className="text-[10px] text-[var(--muted)]">{month.month}</span>
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 mt-3 justify-center text-xs">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded" /> On-time</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-500 rounded" /> Late</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500 rounded" /> Defaulted</span>
          </div>
        </div>
      )}

      {/* View Mode Tabs & Filters */}
      <div className="flex gap-3 mb-4 flex-wrap items-center">
        <div className="flex rounded-lg border border-[var(--border)] overflow-hidden">
          {[
            { value: "all", label: "All" },
            { value: "overdue", label: "Overdue" },
            { value: "scheduled", label: "Upcoming" },
          ].map((mode) => (
            <button
              key={mode.value}
              onClick={() => { setViewMode(mode.value as any); setPage(1); }}
              className={`px-4 py-2 text-sm font-medium ${
                viewMode === mode.value
                  ? "bg-brand-green text-white"
                  : "bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {viewMode === "all" && (
          <>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="px-4 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm"
            >
              <option value="ALL">All Statuses</option>
              {REPAYMENT_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>

            <select
              value={methodFilter}
              onChange={(e) => { setMethodFilter(e.target.value); setPage(1); }}
              className="px-4 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm"
            >
              <option value="ALL">All Methods</option>
              {PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </>
        )}

        {selectedIds.length > 0 && (
          <button
            onClick={() => setShowReminderModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 ml-auto"
          >
            <Bell size={14} /> Send Reminder ({selectedIds.length})
          </button>
        )}
      </div>

      {/* Repayments Table */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-[var(--background)]">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase w-10">
                <button onClick={toggleSelectAll} className="hover:text-[var(--text)]">
                  {selectedIds.length === repayments.filter((r) => ["PENDING", "LATE", "OVERDUE"].includes(r.status)).length &&
                   repayments.some((r) => ["PENDING", "LATE", "OVERDUE"].includes(r.status)) ? (
                    <CheckSquare size={16} />
                  ) : (
                    <Square size={16} />
                  )}
                </button>
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase">Borrower</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase">Program</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase">Amount Due</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase">Due Date</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase">
                {viewMode === "scheduled" ? "Days Until Due" : "Days Late"}
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase">Status</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-[var(--muted)]">Loading...</td>
              </tr>
            ) : repayments.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-[var(--muted)]">No repayments found</td>
              </tr>
            ) : repayments.map((r) => {
              const borrowerName = `${r.loan.borrower.user.firstName} ${r.loan.borrower.user.lastName}`;
              const statusStyle = getStatusStyle(r.status);
              const canSelect = ["PENDING", "LATE", "OVERDUE"].includes(r.status);

              return (
                <tr key={r.id} className="hover:bg-[var(--background)] transition-colors">
                  <td className="px-4 py-4">
                    {canSelect && (
                      <button onClick={() => toggleSelect(r.id)} className="hover:text-[var(--text)]">
                        {selectedIds.includes(r.id) ? <CheckSquare size={16} /> : <Square size={16} />}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <Link href={`/lender/borrowers/${r.loan.borrower.id}`} className="hover:underline">
                      <p className="font-medium text-sm text-[var(--text)]">{borrowerName}</p>
                      {r.loan.borrower.user.phone && (
                        <p className="text-xs text-[var(--muted)]">{r.loan.borrower.user.phone}</p>
                      )}
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-sm text-[var(--muted)]">{r.loan.program.name}</td>
                  <td className="px-4 py-4">
                    <p className="text-sm font-semibold text-[var(--text)]">{formatCurrency(r.amount)}</p>
                    {r.paidAmount && r.status === "PAID" && (
                      <p className="text-xs text-green-600">Paid: {formatCurrency(r.paidAmount)}</p>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-[var(--muted)]">{formatDate(r.dueDate)}</td>
                  <td className="px-4 py-4 text-sm">
                    {viewMode === "scheduled" ? (
                      <span className="text-blue-600">{r.daysUntilDue} days</span>
                    ) : r.daysLate !== undefined && r.daysLate > 0 ? (
                      <span className={r.daysLate > 30 ? "text-red-600 font-medium" : "text-yellow-600"}>
                        {r.daysLate} days
                      </span>
                    ) : (
                      <span className="text-[var(--muted)]">-</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${statusStyle.bg} ${statusStyle.color}`}>
                      {statusStyle.label}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      {["PENDING", "LATE", "OVERDUE"].includes(r.status) && (
                        <>
                          <button
                            onClick={() => { setActiveRepaymentId(r.id); setPaymentAmount(r.amount.toString()); setShowRecordModal(true); }}
                            disabled={actionLoading}
                            className="w-7 h-7 rounded bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200"
                            title="Record Payment"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => { setActiveRepaymentId(r.id); setShowWaiveModal(true); }}
                            disabled={actionLoading}
                            className="w-7 h-7 rounded bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200"
                            title="Waive"
                          >
                            <XCircle size={14} />
                          </button>
                        </>
                      )}
                      {["LATE", "OVERDUE"].includes(r.status) && r.daysLate && r.daysLate > 30 && (
                        <button
                          onClick={() => handleMarkDefaulted(r.id)}
                          disabled={actionLoading}
                          className="w-7 h-7 rounded bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200"
                          title="Mark Defaulted"
                        >
                          <AlertTriangle size={14} />
                        </button>
                      )}
                      <Link
                        href={`/lender/loans/${r.loanId}`}
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

      {/* Record Payment Modal */}
      {showRecordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--surface)] rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-[var(--text)] mb-4">Record Payment</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">Amount (₦)</label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full p-3 border border-[var(--border)] rounded-lg bg-[var(--background)] text-sm"
                  placeholder="Enter amount"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full p-3 border border-[var(--border)] rounded-lg bg-[var(--background)] text-sm"
                >
                  <option value="">Select method</option>
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">Reference (Optional)</label>
                <input
                  type="text"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className="w-full p-3 border border-[var(--border)] rounded-lg bg-[var(--background)] text-sm"
                  placeholder="e.g., NEFT-2025-06-12-00432"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => { setShowRecordModal(false); resetForms(); }}
                className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleRecordPayment}
                disabled={!paymentAmount || !paymentMethod || actionLoading}
                className="px-4 py-2 rounded-lg bg-brand-green text-white text-sm font-medium disabled:opacity-50"
              >
                {actionLoading ? "Recording..." : "Record Payment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Waive Modal */}
      {showWaiveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--surface)] rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-[var(--text)] mb-4">Waive Repayment</h3>
            <p className="text-sm text-[var(--muted)] mb-4">
              Select a reason for waiving this repayment. This action cannot be undone.
            </p>

            <div className="space-y-2 mb-4">
              {WAIVER_REASONS.map((reason) => (
                <label key={reason.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="waiverReason"
                    value={reason.value}
                    checked={waiverReason === reason.value}
                    onChange={(e) => setWaiverReason(e.target.value)}
                    className="accent-brand-green"
                  />
                  <span className="text-sm text-[var(--text)]">{reason.label}</span>
                </label>
              ))}
            </div>

            {waiverReason === "OTHER" && (
              <textarea
                placeholder="Enter custom reason..."
                value={customWaiverReason}
                onChange={(e) => setCustomWaiverReason(e.target.value)}
                className="w-full p-3 border border-[var(--border)] rounded-lg bg-[var(--background)] text-sm mb-4"
                rows={3}
              />
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setShowWaiveModal(false); resetForms(); }}
                className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleWaive}
                disabled={!waiverReason || (waiverReason === "OTHER" && !customWaiverReason) || actionLoading}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium disabled:opacity-50"
              >
                {actionLoading ? "Waiving..." : "Waive Repayment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Reminder Modal */}
      {showReminderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--surface)] rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-[var(--text)] mb-4">
              Send Reminder ({selectedIds.length} borrowers)
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-2">Channels</label>
                <div className="flex gap-3">
                  {["SMS", "WHATSAPP", "IN_APP"].map((channel) => (
                    <label key={channel} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={reminderChannels.includes(channel)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setReminderChannels([...reminderChannels, channel]);
                          } else {
                            setReminderChannels(reminderChannels.filter((c) => c !== channel));
                          }
                        }}
                        className="accent-brand-green"
                      />
                      <span className="text-sm">{channel.replace("_", "-")}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">
                  Custom Message (Optional)
                </label>
                <textarea
                  value={reminderMessage}
                  onChange={(e) => setReminderMessage(e.target.value)}
                  className="w-full p-3 border border-[var(--border)] rounded-lg bg-[var(--background)] text-sm"
                  rows={3}
                  placeholder="Leave empty to use default template"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => { setShowReminderModal(false); resetForms(); }}
                className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSendReminders}
                disabled={reminderChannels.length === 0 || actionLoading}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium disabled:opacity-50"
              >
                {actionLoading ? "Sending..." : "Send Reminders"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
