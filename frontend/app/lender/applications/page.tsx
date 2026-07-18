"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search, Filter, Eye, CheckCircle, XCircle, Clock,
  FileText, User, MapPin, TrendingUp, ChevronRight, ChevronLeft,
  Calendar, DollarSign, MoreHorizontal, MessageSquare,
  AlertTriangle, Download, RefreshCw
} from "lucide-react";
import Link from "next/link";
import {
  applicationsApi,
  type Application,
  type ApplicationsQuery,
  type RejectionCode,
  REJECTION_CODES,
  INFO_REQUEST_ITEMS,
} from "@/lib/api/applications";
import { programsApi } from "@/lib/api/programs";

const statusColors: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  DRAFT: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-600 dark:text-gray-400", icon: FileText },
  SUBMITTED: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-400", icon: Clock },
  UNDER_REVIEW: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-400", icon: Eye },
  APPROVED: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400", icon: CheckCircle },
  REJECTED: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400", icon: XCircle },
  WITHDRAWN: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-600 dark:text-gray-400", icon: FileText },
};

interface Program {
  id: string;
  name: string;
}

export default function ApplicationsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [applications, setApplications] = useState<Application[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "ALL");
  const [programFilter, setProgramFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState<ApplicationsQuery["sortBy"]>("newest");

  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modals
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showRequestInfoModal, setShowRequestInfoModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  // Modal form state
  const [approveAmount, setApproveAmount] = useState("");
  const [approveNotes, setApproveNotes] = useState("");
  const [rejectCode, setRejectCode] = useState<RejectionCode>("OTHER");
  const [rejectReason, setRejectReason] = useState("");
  const [requestItems, setRequestItems] = useState<string[]>([]);
  const [requestMessage, setRequestMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch applications
  const fetchApplications = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const query: ApplicationsQuery = {
        page,
        limit: 20,
        sortBy,
        search: search || undefined,
      };
      if (statusFilter !== "ALL") query.status = statusFilter;
      if (programFilter !== "ALL") query.programId = programFilter;

      const response = await applicationsApi.list(query);
      setApplications(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotal(response.pagination.total);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
      setError("Failed to load applications. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, statusFilter, programFilter, sortBy, search]);

  // Fetch programs for filter dropdown
  useEffect(() => {
    programsApi.list({ limit: 100 }).then((res) => {
      setPrograms(res.data.map((p) => ({ id: p.id, name: p.name })));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Stats
  const stats = {
    total: total,
    pending: applications.filter((a) => a.status === "SUBMITTED" || a.status === "UNDER_REVIEW").length,
    approved: applications.filter((a) => a.status === "APPROVED").length,
    rejected: applications.filter((a) => a.status === "REJECTED").length,
  };

  // Selection handlers
  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === applications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(applications.map((a) => a.id)));
    }
  };

  // Action handlers
  const openApproveModal = (app: Application) => {
    setSelectedApp(app);
    setApproveAmount(String(app.amount));
    setApproveNotes("");
    setShowApproveModal(true);
  };

  const openRejectModal = (app: Application) => {
    setSelectedApp(app);
    setRejectCode("OTHER");
    setRejectReason("");
    setShowRejectModal(true);
  };

  const openRequestInfoModal = (app: Application) => {
    setSelectedApp(app);
    setRequestItems([]);
    setRequestMessage("");
    setShowRequestInfoModal(true);
  };

  const handleApprove = async () => {
    if (!selectedApp) return;
    setSubmitting(true);
    try {
      await applicationsApi.approve(selectedApp.id, {
        approvedAmount: Number(approveAmount),
        reviewNotes: approveNotes || undefined,
      });
      setShowApproveModal(false);
      fetchApplications(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to approve application");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedApp || !rejectReason) return;
    setSubmitting(true);
    try {
      await applicationsApi.reject(selectedApp.id, {
        rejectionCode: rejectCode,
        reason: rejectReason,
      });
      setShowRejectModal(false);
      fetchApplications(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reject application");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestInfo = async () => {
    if (!selectedApp || requestItems.length === 0 || !requestMessage) return;
    setSubmitting(true);
    try {
      await applicationsApi.requestInfo(selectedApp.id, {
        requiredItems: requestItems,
        message: requestMessage,
      });
      setShowRequestInfoModal(false);
      fetchApplications(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedIds.size === 0) return;
    setSubmitting(true);
    try {
      const result = await applicationsApi.bulkAction({
        applicationIds: Array.from(selectedIds),
        action: "APPROVE",
      });
      setSelectedIds(new Set());
      fetchApplications(true);
      if (result.failed.length > 0) {
        setError(`${result.successful.length} approved, ${result.failed.length} failed`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Bulk action failed");
    } finally {
      setSubmitting(false);
    }
  };

  const exportToCsv = () => {
    const headers = ["ID", "Borrower", "Program", "Amount", "FarmScore", "Status", "Submitted", "Days in Queue"];
    const rows = applications.map((app) => [
      app.id,
      app.borrower ? `${app.borrower.user.firstName} ${app.borrower.user.lastName}` : "",
      app.program?.name || "",
      app.amount,
      app.farmScoreAtApply || "",
      app.status,
      app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : "",
      app.daysInQueue || "",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `applications-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Loan Applications</h1>
          <p className="text-sm text-[var(--muted)]">Review and process farmer loan applications</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fetchApplications(true)}
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
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Applications", value: stats.total, color: "text-[var(--text)]", bg: "bg-[var(--surface)]" },
          { label: "Pending Review", value: stats.pending, color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-900/20" },
          { label: "Approved", value: stats.approved, color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20" },
          { label: "Rejected", value: stats.rejected, color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20" },
        ].map((stat) => (
          <div key={stat.label} className={`${stat.bg} rounded-xl p-4 border border-[var(--border)]`}>
            <p className="text-sm text-[var(--muted)] mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{loading ? "..." : stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="text"
            placeholder="Search by name or farmer ID..."
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
          <option value="SUBMITTED">Submitted</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="WITHDRAWN">Withdrawn</option>
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
          onChange={(e) => { setSortBy(e.target.value as any); setPage(1); }}
          className="px-4 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="highestScore">Highest Score</option>
          <option value="highestAmount">Highest Amount</option>
        </select>
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.size > 0 && (
        <div className="mb-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 flex items-center justify-between">
          <span className="text-sm text-blue-700 dark:text-blue-300">
            {selectedIds.size} application{selectedIds.size !== 1 ? "s" : ""} selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={handleBulkApprove}
              disabled={submitting}
              className="px-3 py-1.5 rounded-lg bg-green-600 text-white text-sm font-medium disabled:opacity-50"
            >
              Bulk Approve
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              className="px-3 py-1.5 rounded-lg border border-[var(--border)] text-sm"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* Applications Table */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-[var(--background)]">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedIds.size === applications.length && applications.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded"
                />
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Applicant</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Program</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Amount</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">FarmScore</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Days</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-[var(--muted)]">Loading...</td>
              </tr>
            ) : applications.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-[var(--muted)]">No applications found</td>
              </tr>
            ) : applications.map((app) => {
              const statusStyle = statusColors[app.status] || statusColors.DRAFT;
              const StatusIcon = statusStyle.icon;
              const borrowerName = app.borrower
                ? `${app.borrower.user.firstName} ${app.borrower.user.lastName}`
                : "Unknown";
              const initials = borrowerName.split(" ").map((n) => n[0]).join("").toUpperCase();

              return (
                <tr key={app.id} className="hover:bg-[var(--background)] transition-colors">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(app.id)}
                      onChange={() => toggleSelect(app.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-green flex items-center justify-center text-white font-semibold text-sm">
                        {initials}
                      </div>
                      <div>
                        <p className="font-medium text-[var(--text)]">{borrowerName}</p>
                        <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                          <span>{app.borrower?.farmerId}</span>
                          {app.borrower?.state && (
                            <>
                              <span>•</span>
                              <MapPin size={12} />
                              <span>{app.borrower.state}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-[var(--text)]">{app.program?.name || "—"}</p>
                    <p className="text-xs text-[var(--muted)]">{app.borrower?.primaryCrop}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-[var(--text)]">₦{Number(app.amount).toLocaleString()}</p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp
                        size={14}
                        className={
                          (app.farmScoreAtApply || 0) >= 700
                            ? "text-green-500"
                            : (app.farmScoreAtApply || 0) >= 500
                            ? "text-yellow-500"
                            : "text-red-500"
                        }
                      />
                      <span
                        className={`font-semibold ${
                          (app.farmScoreAtApply || 0) >= 700
                            ? "text-green-600"
                            : (app.farmScoreAtApply || 0) >= 500
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {app.farmScoreAtApply || "—"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}
                    >
                      <StatusIcon size={12} />
                      {app.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-[var(--muted)]">
                    {app.daysInQueue != null ? `${app.daysInQueue}d` : "—"}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/lender/applications/${app.id}`}
                        className="p-2 rounded-lg hover:bg-[var(--background)] text-[var(--muted)] hover:text-[var(--text)]"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </Link>
                      {(app.status === "SUBMITTED" || app.status === "UNDER_REVIEW") && (
                        <>
                          <button
                            onClick={() => openApproveModal(app)}
                            className="p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600"
                            title="Approve"
                          >
                            <CheckCircle size={16} />
                          </button>
                          <button
                            onClick={() => openRejectModal(app)}
                            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600"
                            title="Reject"
                          >
                            <XCircle size={16} />
                          </button>
                          <button
                            onClick={() => openRequestInfoModal(app)}
                            className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600"
                            title="Request Info"
                          >
                            <MessageSquare size={16} />
                          </button>
                        </>
                      )}
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

      {/* Approve Modal */}
      {showApproveModal && selectedApp && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] rounded-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-[var(--text)] mb-4">Approve Application</h2>
            <p className="text-sm text-[var(--muted)] mb-4">
              Approving application for {selectedApp.borrower?.user.firstName} {selectedApp.borrower?.user.lastName}
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[var(--muted)] uppercase block mb-1">
                  Approved Amount (₦)
                </label>
                <input
                  type="number"
                  value={approveAmount}
                  onChange={(e) => setApproveAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--muted)] uppercase block mb-1">
                  Review Notes (Optional)
                </label>
                <textarea
                  value={approveNotes}
                  onChange={(e) => setApproveNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowApproveModal(false)}
                className="flex-1 py-2.5 rounded-lg border border-[var(--border)] text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={submitting || !approveAmount}
                className="flex-1 py-2.5 rounded-lg bg-green-600 text-white text-sm font-semibold disabled:opacity-50"
              >
                {submitting ? "Approving..." : "Approve Application"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedApp && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] rounded-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-[var(--text)] mb-4">Reject Application</h2>
            <p className="text-sm text-[var(--muted)] mb-4">
              Rejecting application for {selectedApp.borrower?.user.firstName} {selectedApp.borrower?.user.lastName}
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[var(--muted)] uppercase block mb-1">
                  Rejection Reason *
                </label>
                <select
                  value={rejectCode}
                  onChange={(e) => setRejectCode(e.target.value as RejectionCode)}
                  className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm"
                >
                  {REJECTION_CODES.map((rc) => (
                    <option key={rc.code} value={rc.code}>
                      {rc.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-[var(--muted)] mt-1">
                  {REJECTION_CODES.find((rc) => rc.code === rejectCode)?.description}
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--muted)] uppercase block mb-1">
                  Detailed Reason *
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  placeholder="Provide specific details for the rejection..."
                  className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 py-2.5 rounded-lg border border-[var(--border)] text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={submitting || !rejectReason}
                className="flex-1 py-2.5 rounded-lg bg-red-600 text-white text-sm font-semibold disabled:opacity-50"
              >
                {submitting ? "Rejecting..." : "Reject Application"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Request Info Modal */}
      {showRequestInfoModal && selectedApp && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--surface)] rounded-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-[var(--text)] mb-4">Request More Information</h2>
            <p className="text-sm text-[var(--muted)] mb-4">
              Request additional documents from {selectedApp.borrower?.user.firstName} {selectedApp.borrower?.user.lastName}
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[var(--muted)] uppercase block mb-2">
                  Required Items *
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {INFO_REQUEST_ITEMS.map((item) => (
                    <label key={item} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={requestItems.includes(item)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setRequestItems([...requestItems, item]);
                          } else {
                            setRequestItems(requestItems.filter((i) => i !== item));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm text-[var(--text)]">{item}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--muted)] uppercase block mb-1">
                  Message to Borrower *
                </label>
                <textarea
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  rows={3}
                  placeholder="Explain what is needed and why..."
                  className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowRequestInfoModal(false)}
                className="flex-1 py-2.5 rounded-lg border border-[var(--border)] text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestInfo}
                disabled={submitting || requestItems.length === 0 || !requestMessage}
                className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold disabled:opacity-50"
              >
                {submitting ? "Sending..." : "Send Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
