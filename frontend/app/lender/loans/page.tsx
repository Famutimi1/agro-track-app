"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search, Filter, Eye, TrendingUp, TrendingDown,
  DollarSign, Calendar, ChevronRight, ChevronLeft, AlertTriangle,
  CheckCircle, Clock, XCircle, RefreshCw, Download, MapPin
} from "lucide-react";
import { loansApi, type Loan, type LoansQuery, type LoanStats } from "@/lib/api/loans";
import { programsApi } from "@/lib/api/programs";

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  ACTIVE: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400", label: "Active" },
  PENDING: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-400", label: "Pending" },
  COMPLETED: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-400", label: "Completed" },
  DEFAULTED: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400", label: "Defaulted" },
  CANCELLED: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-600 dark:text-gray-400", label: "Cancelled" },
};

interface Program {
  id: string;
  name: string;
}

export default function LoansPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loans, setLoans] = useState<Loan[]>([]);
  const [stats, setStats] = useState<LoanStats | null>(null);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "ALL");
  const [programFilter, setProgramFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState<LoansQuery["sortBy"]>("newest");

  const fetchLoans = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const query: LoansQuery = {
        page,
        limit: 20,
        sortBy,
        search: search || undefined,
      };
      if (statusFilter !== "ALL") query.status = statusFilter;
      if (programFilter !== "ALL") query.programId = programFilter;

      const [loansRes, statsRes] = await Promise.all([
        loansApi.list(query),
        loansApi.getStats(),
      ]);

      setLoans(loansRes.data);
      setTotalPages(loansRes.pagination.totalPages);
      setTotal(loansRes.pagination.total);
      setStats(statsRes);
    } catch (err) {
      console.error("Failed to fetch loans:", err);
      setError("Failed to load loans. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, statusFilter, programFilter, sortBy, search]);

  useEffect(() => {
    programsApi.list({ limit: 100 }).then((res) => {
      setPrograms(res.data.map((p) => ({ id: p.id, name: p.name })));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  const exportToCsv = () => {
    const headers = ["Loan ID", "Borrower", "Program", "Amount", "Disbursed", "Repaid", "Outstanding", "Status", "Start Date"];
    const rows = loans.map((loan) => [
      loan.id,
      loan.borrower ? `${loan.borrower.user.firstName} ${loan.borrower.user.lastName}` : "",
      loan.program?.name || "",
      loan.amount,
      loan.totalDisbursed || 0,
      loan.totalRepaid || 0,
      loan.outstandingBalance || 0,
      loan.status,
      loan.startDate ? new Date(loan.startDate).toLocaleDateString() : "",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `loans-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Loan Portfolio</h1>
          <p className="text-sm text-[var(--muted)]">Monitor and manage all active loans</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fetchLoans(true)}
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

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <DollarSign size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-[var(--muted)]">Total Disbursed</p>
              <p className="text-xl font-bold text-[var(--text)]">
                {loading ? "..." : `₦${((stats?.totalDisbursed || 0) / 1000000).toFixed(2)}M`}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <TrendingUp size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-[var(--muted)]">Total Repaid</p>
              <p className="text-xl font-bold text-[var(--text)]">
                {loading ? "..." : `₦${((stats?.totalRepaid || 0) / 1000000).toFixed(2)}M`}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-green/10 flex items-center justify-center">
              <CheckCircle size={20} className="text-brand-green" />
            </div>
            <div>
              <p className="text-sm text-[var(--muted)]">Active Loans</p>
              <p className="text-xl font-bold text-[var(--text)]">
                {loading ? "..." : stats?.activeLoans || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertTriangle size={20} className="text-red-600" />
            </div>
            <div>
              <p className="text-sm text-[var(--muted)]">Defaulted</p>
              <p className="text-xl font-bold text-red-600">
                {loading ? "..." : stats?.defaultedLoans || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="text"
            placeholder="Search by loan ID or borrower name..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm"
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="PENDING">Pending</option>
          <option value="COMPLETED">Completed</option>
          <option value="DEFAULTED">Defaulted</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <select
          value={programFilter}
          onChange={(e) => { setProgramFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm"
        >
          <option value="ALL">All Programs</option>
          {programs.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => { setSortBy(e.target.value as LoansQuery["sortBy"]); setPage(1); }}
          className="px-4 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="highestAmount">Highest Amount</option>
          <option value="lowestAmount">Lowest Amount</option>
          <option value="nextPayment">Next Payment Due</option>
        </select>
      </div>

      {/* Loans Table */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-[var(--background)]">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase">Loan ID</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase">Borrower</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase">Amount</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase">Progress</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase">Next Payment</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase">Status</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[var(--muted)]">Loading...</td>
              </tr>
            ) : loans.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[var(--muted)]">No loans found</td>
              </tr>
            ) : loans.map((loan) => {
              const status = statusConfig[loan.status] || statusConfig.PENDING;
              const repaymentPercent = loan.totalRepayable > 0
                ? Math.round(((loan.totalRepaid || 0) / loan.totalRepayable) * 100)
                : 0;
              const disbursementPercent = Math.round((loan.disbursementProgress || 0) * 100);
              const borrowerName = loan.borrower
                ? `${loan.borrower.user.firstName} ${loan.borrower.user.lastName}`
                : "Unknown";
              const initials = borrowerName.split(" ").map((n) => n[0]).join("").toUpperCase();
              const isOverdue = loan.daysToNextPayment != null && loan.daysToNextPayment < 0;

              return (
                <tr key={loan.id} className="hover:bg-[var(--background)] transition-colors">
                  <td className="px-4 py-4">
                    <p className="font-mono font-semibold text-[var(--text)] text-sm">{loan.id.slice(0, 12)}</p>
                    <p className="text-xs text-[var(--muted)]">{loan.program?.name || "—"}</p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-green flex items-center justify-center text-white font-semibold text-sm">
                        {initials}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-[var(--text)]">{borrowerName}</p>
                        <div className="flex items-center gap-1 text-xs text-[var(--muted)]">
                          <MapPin size={10} />
                          <span>{loan.borrower?.state || "—"}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-[var(--text)]">₦{loan.amount.toLocaleString()}</p>
                    <p className="text-xs text-[var(--muted)]">{loan.interestRate}% interest</p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-1.5 w-32">
                      <div>
                        <div className="flex justify-between text-xs mb-0.5">
                          <span className="text-[var(--muted)]">Disbursed</span>
                          <span className="font-medium text-[var(--text)]">{disbursementPercent}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${disbursementPercent}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-0.5">
                          <span className="text-[var(--muted)]">Repaid</span>
                          <span className="font-medium text-[var(--text)]">{repaymentPercent}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: `${repaymentPercent}%` }} />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {loan.nextPaymentAmount ? (
                      <div>
                        <p className={`font-semibold ${isOverdue ? "text-red-600" : "text-[var(--text)]"}`}>
                          ₦{loan.nextPaymentAmount.toLocaleString()}
                        </p>
                        <p className={`text-xs ${isOverdue ? "text-red-500" : "text-[var(--muted)]"}`}>
                          {isOverdue
                            ? `${Math.abs(loan.daysToNextPayment || 0)} days overdue`
                            : loan.nextPaymentDue
                            ? `Due ${new Date(loan.nextPaymentDue).toLocaleDateString()}`
                            : "—"
                          }
                        </p>
                      </div>
                    ) : (
                      <span className="text-sm text-[var(--muted)]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                      {status.label}
                    </span>
                    <p className="text-xs text-[var(--muted)] mt-1">
                      Tranche {loan.currentTranche}/{loan.trancheCount}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Link
                      href={`/lender/loans/${loan.id}`}
                      className="inline-flex items-center gap-1 text-sm text-brand-green hover:underline"
                    >
                      View <ChevronRight size={14} />
                    </Link>
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
            <span className="px-4 py-2 text-sm">
              Page {page} of {totalPages}
            </span>
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
    </div>
  );
}
