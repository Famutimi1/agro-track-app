"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search, RefreshCw, Plus, MapPin, Users, Eye, TrendingUp,
  ChevronLeft, ChevronRight, XCircle, CheckCircle, AlertTriangle,
  DollarSign, UserPlus, UserMinus, Trash2
} from "lucide-react";
import {
  cooperativesApi,
  type Cooperative,
  type CooperativeStats,
  type CooperativeMember,
  type CooperativesQuery,
  COOP_STATUSES,
  GROUP_TIERS,
} from "@/lib/api/cooperatives";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function CooperativesPage() {
  const [cooperatives, setCooperatives] = useState<Cooperative[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [selectedCoop, setSelectedCoop] = useState<Cooperative | null>(null);
  const [coopStats, setCoopStats] = useState<CooperativeStats | null>(null);
  const [coopMembers, setCoopMembers] = useState<CooperativeMember[]>([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showDissolveModal, setShowDissolveModal] = useState(false);
  const [detailTab, setDetailTab] = useState<"overview" | "members" | "loans">("overview");

  const [actionLoading, setActionLoading] = useState(false);

  // Create form
  const [createForm, setCreateForm] = useState({
    name: "",
    state: "",
    lga: "",
    regNumber: "",
    address: "",
    maxMembers: 100,
  });

  // Add member form
  const [borrowerId, setBorrowerId] = useState("");

  // Suspend/Dissolve reason
  const [actionReason, setActionReason] = useState("");

  const fetchCooperatives = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const query: CooperativesQuery = { page, limit: 12 };
      if (search) query.search = search;
      if (stateFilter !== "ALL") query.state = stateFilter;
      if (statusFilter !== "ALL") query.status = statusFilter;

      const response = await cooperativesApi.list(query);
      setCooperatives(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotal(response.pagination.total);
    } catch (err) {
      console.error("Failed to fetch cooperatives:", err);
      setError("Failed to load cooperatives. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, search, stateFilter, statusFilter]);

  useEffect(() => {
    fetchCooperatives();
  }, [fetchCooperatives]);

  const openDetail = async (coop: Cooperative) => {
    setSelectedCoop(coop);
    setShowDetailModal(true);
    setDetailTab("overview");

    try {
      const [stats, members] = await Promise.all([
        cooperativesApi.getStats(coop.id),
        cooperativesApi.getMembers(coop.id),
      ]);
      setCoopStats(stats);
      setCoopMembers(members.data);
    } catch (err) {
      console.error("Failed to fetch cooperative details:", err);
    }
  };

  const handleCreate = async () => {
    if (!createForm.name || !createForm.state) {
      setError("Name and state are required");
      return;
    }

    setActionLoading(true);
    try {
      await cooperativesApi.create(createForm);
      setShowCreateModal(false);
      setCreateForm({ name: "", state: "", lga: "", regNumber: "", address: "", maxMembers: 100 });
      fetchCooperatives(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create cooperative");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!selectedCoop || !borrowerId) return;

    setActionLoading(true);
    try {
      await cooperativesApi.addMember(selectedCoop.id, borrowerId);
      setBorrowerId("");
      setShowAddMemberModal(false);
      const [stats, members] = await Promise.all([
        cooperativesApi.getStats(selectedCoop.id),
        cooperativesApi.getMembers(selectedCoop.id),
      ]);
      setCoopStats(stats);
      setCoopMembers(members.data);
      fetchCooperatives(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to add member");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!selectedCoop || !confirm("Are you sure you want to remove this member?")) return;

    setActionLoading(true);
    try {
      await cooperativesApi.removeMember(selectedCoop.id, memberId);
      const [stats, members] = await Promise.all([
        cooperativesApi.getStats(selectedCoop.id),
        cooperativesApi.getMembers(selectedCoop.id),
      ]);
      setCoopStats(stats);
      setCoopMembers(members.data);
      fetchCooperatives(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to remove member");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspend = async () => {
    if (!selectedCoop || !actionReason) return;

    setActionLoading(true);
    try {
      await cooperativesApi.suspend(selectedCoop.id, actionReason);
      setShowSuspendModal(false);
      setActionReason("");
      setShowDetailModal(false);
      fetchCooperatives(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to suspend cooperative");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivate = async () => {
    if (!selectedCoop) return;

    setActionLoading(true);
    try {
      await cooperativesApi.reactivate(selectedCoop.id);
      setShowDetailModal(false);
      fetchCooperatives(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reactivate cooperative");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDissolve = async () => {
    if (!selectedCoop || !actionReason) return;

    setActionLoading(true);
    try {
      await cooperativesApi.dissolve(selectedCoop.id, actionReason);
      setShowDissolveModal(false);
      setActionReason("");
      setShowDetailModal(false);
      fetchCooperatives(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to dissolve cooperative");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    return COOP_STATUSES.find((s) => s.value === status) || COOP_STATUSES[0];
  };

  const getTierStyle = (tier: string) => {
    return GROUP_TIERS.find((t) => t.value === tier) || GROUP_TIERS[2];
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Cooperatives</h1>
          <p className="text-sm text-[var(--muted)]">
            {loading ? "Loading..." : `${total} registered cooperative groups`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fetchCooperatives(true)}
            disabled={refreshing}
            className="p-2 rounded-lg border border-[var(--border)] hover:bg-[var(--surface)]"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-green text-white text-sm font-medium"
          >
            <Plus size={14} /> Register Cooperative
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="text"
            placeholder="Search by name or registration number..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm"
          />
        </div>
        <select
          value={stateFilter}
          onChange={(e) => { setStateFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm"
        >
          <option value="ALL">All States</option>
          <option value="Kebbi">Kebbi</option>
          <option value="Kano">Kano</option>
          <option value="Kaduna">Kaduna</option>
          <option value="Oyo">Oyo</option>
          <option value="Anambra">Anambra</option>
          <option value="Ekiti">Ekiti</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-4 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm"
        >
          <option value="ALL">All Statuses</option>
          {COOP_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Cooperatives Grid */}
      {loading ? (
        <div className="text-center py-12 text-[var(--muted)]">Loading...</div>
      ) : cooperatives.length === 0 ? (
        <div className="text-center py-12 text-[var(--muted)]">No cooperatives found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cooperatives.map((coop) => {
            const statusStyle = getStatusStyle(coop.status);
            const tierStyle = getTierStyle(coop.groupTier);

            return (
              <div
                key={coop.id}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-sm font-bold text-[var(--text)] line-clamp-1">{coop.name}</h3>
                    {coop.regNumber && (
                      <p className="text-xs text-[var(--muted)]">{coop.regNumber}</p>
                    )}
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${statusStyle.bg} ${statusStyle.color}`}>
                    {statusStyle.label}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-[var(--muted)] mb-2">
                  <MapPin size={12} />
                  {coop.state}{coop.lga ? `, ${coop.lga}` : ""}
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1">
                    <Users size={14} className="text-[var(--muted)]" />
                    <span className="text-sm font-semibold">{coop.memberCount}</span>
                    <span className="text-xs text-[var(--muted)]">/ {coop.maxMembers}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${tierStyle.bg} ${tierStyle.color}`}>
                    {tierStyle.label} ({coop.groupFarmScore})
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                  <div>
                    <p className="text-[var(--muted)]">Total Loans</p>
                    <p className="font-semibold text-[var(--text)]">{formatCurrency(coop.totalLoans)}</p>
                  </div>
                  <div>
                    <p className="text-[var(--muted)]">Repayment Rate</p>
                    <p className={`font-semibold ${coop.repaymentRate >= 85 ? "text-green-600" : coop.repaymentRate >= 70 ? "text-yellow-600" : "text-red-600"}`}>
                      {coop.repaymentRate}%
                    </p>
                  </div>
                </div>

                <div className="flex gap-1 pt-3 border-t border-[var(--border)]">
                  <button
                    onClick={() => openDetail(coop)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-xs font-medium bg-[var(--background)] hover:bg-[var(--border)]"
                  >
                    <Eye size={12} /> View
                  </button>
                  <button
                    onClick={() => { setSelectedCoop(coop); setShowAddMemberModal(true); }}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-xs font-medium bg-[var(--background)] hover:bg-[var(--border)]"
                  >
                    <UserPlus size={12} /> Add Member
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-[var(--muted)]">
            Showing {(page - 1) * 12 + 1} to {Math.min(page * 12, total)} of {total}
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

      {/* Create Cooperative Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--surface)] rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-[var(--text)] mb-4">Register New Cooperative</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">Name *</label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full p-2.5 border border-[var(--border)] rounded-lg bg-[var(--background)] text-sm"
                  placeholder="e.g., Kebbi Rice Farmers Cooperative"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[var(--text)] mb-1">State *</label>
                  <select
                    value={createForm.state}
                    onChange={(e) => setCreateForm({ ...createForm, state: e.target.value })}
                    className="w-full p-2.5 border border-[var(--border)] rounded-lg bg-[var(--background)] text-sm"
                  >
                    <option value="">Select state</option>
                    <option value="Kebbi">Kebbi</option>
                    <option value="Kano">Kano</option>
                    <option value="Kaduna">Kaduna</option>
                    <option value="Oyo">Oyo</option>
                    <option value="Anambra">Anambra</option>
                    <option value="Ekiti">Ekiti</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text)] mb-1">LGA</label>
                  <input
                    type="text"
                    value={createForm.lga}
                    onChange={(e) => setCreateForm({ ...createForm, lga: e.target.value })}
                    className="w-full p-2.5 border border-[var(--border)] rounded-lg bg-[var(--background)] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">Registration Number</label>
                <input
                  type="text"
                  value={createForm.regNumber}
                  onChange={(e) => setCreateForm({ ...createForm, regNumber: e.target.value })}
                  className="w-full p-2.5 border border-[var(--border)] rounded-lg bg-[var(--background)] text-sm"
                  placeholder="e.g., COOP-KEB-2025-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">Max Members</label>
                <input
                  type="number"
                  value={createForm.maxMembers}
                  onChange={(e) => setCreateForm({ ...createForm, maxMembers: parseInt(e.target.value) || 100 })}
                  className="w-full p-2.5 border border-[var(--border)] rounded-lg bg-[var(--background)] text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">Address</label>
                <textarea
                  value={createForm.address}
                  onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })}
                  className="w-full p-2.5 border border-[var(--border)] rounded-lg bg-[var(--background)] text-sm"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg bg-brand-green text-white text-sm font-medium disabled:opacity-50"
              >
                {actionLoading ? "Creating..." : "Register Cooperative"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && selectedCoop && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--surface)] rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-[var(--text)] mb-4">
              Add Member to {selectedCoop.name}
            </h3>

            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1">Borrower ID *</label>
              <input
                type="text"
                value={borrowerId}
                onChange={(e) => setBorrowerId(e.target.value)}
                className="w-full p-2.5 border border-[var(--border)] rounded-lg bg-[var(--background)] text-sm"
                placeholder="Enter borrower ID"
              />
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => { setShowAddMemberModal(false); setBorrowerId(""); }}
                className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMember}
                disabled={!borrowerId || actionLoading}
                className="px-4 py-2 rounded-lg bg-brand-green text-white text-sm font-medium disabled:opacity-50"
              >
                {actionLoading ? "Adding..." : "Add Member"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cooperative Detail Modal */}
      {showDetailModal && selectedCoop && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--surface)] rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-[var(--border)]">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-[var(--text)]">{selectedCoop.name}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-[var(--muted)]">{selectedCoop.regNumber || "No Reg #"}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${getStatusStyle(selectedCoop.status).bg} ${getStatusStyle(selectedCoop.status).color}`}>
                      {getStatusStyle(selectedCoop.status).label}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-[var(--background)] rounded-lg"
                >
                  <XCircle size={20} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-4 mt-4">
                {(["overview", "members", "loans"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setDetailTab(tab)}
                    className={`text-sm font-medium pb-2 border-b-2 ${
                      detailTab === tab
                        ? "border-brand-green text-brand-green"
                        : "border-transparent text-[var(--muted)] hover:text-[var(--text)]"
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {detailTab === "overview" && coopStats && (
                <div className="space-y-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[var(--background)] rounded-lg p-3 text-center">
                      <p className="text-xs text-[var(--muted)] uppercase">Members</p>
                      <p className="text-xl font-bold text-[var(--text)]">
                        {coopStats.memberCount} / {coopStats.maxMembers}
                      </p>
                    </div>
                    <div className="bg-[var(--background)] rounded-lg p-3 text-center">
                      <p className="text-xs text-[var(--muted)] uppercase">Group Score</p>
                      <p className="text-xl font-bold text-[var(--text)]">{coopStats.groupFarmScore}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${getTierStyle(coopStats.groupTier).bg} ${getTierStyle(coopStats.groupTier).color}`}>
                        {coopStats.groupTier}
                      </span>
                    </div>
                    <div className="bg-[var(--background)] rounded-lg p-3 text-center">
                      <p className="text-xs text-[var(--muted)] uppercase">Total Disbursed</p>
                      <p className="text-xl font-bold text-[var(--text)]">{formatCurrency(coopStats.totalDisbursed)}</p>
                    </div>
                    <div className="bg-[var(--background)] rounded-lg p-3 text-center">
                      <p className="text-xs text-[var(--muted)] uppercase">Repayment Rate</p>
                      <p className={`text-xl font-bold ${coopStats.repaymentRate >= 85 ? "text-green-600" : "text-yellow-600"}`}>
                        {coopStats.repaymentRate}%
                      </p>
                    </div>
                  </div>

                  {/* Score Distribution */}
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--text)] mb-3">Member Score Distribution</h4>
                    <div className="flex gap-2">
                      {Object.entries(coopStats.scoreDistribution).map(([tier, count]) => (
                        <div key={tier} className="flex-1 bg-[var(--background)] rounded-lg p-3 text-center">
                          <p className="text-xs text-[var(--muted)]">{tier}</p>
                          <p className="text-lg font-bold">{count}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Loan Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-center">
                      <p className="text-xs text-green-600">Active Loans</p>
                      <p className="text-xl font-bold text-green-700">{coopStats.activeLoans}</p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 text-center">
                      <p className="text-xs text-blue-600">Completed</p>
                      <p className="text-xl font-bold text-blue-700">{coopStats.completedLoans}</p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3 text-center">
                      <p className="text-xs text-red-600">Defaulted</p>
                      <p className="text-xl font-bold text-red-700">{coopStats.defaultedLoans}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t border-[var(--border)]">
                    {selectedCoop.status === "ACTIVE" && (
                      <button
                        onClick={() => setShowSuspendModal(true)}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg bg-yellow-100 text-yellow-700 text-sm font-medium hover:bg-yellow-200"
                      >
                        <AlertTriangle size={14} /> Suspend
                      </button>
                    )}
                    {selectedCoop.status === "SUSPENDED" && (
                      <button
                        onClick={handleReactivate}
                        disabled={actionLoading}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg bg-green-100 text-green-700 text-sm font-medium hover:bg-green-200"
                      >
                        <CheckCircle size={14} /> Reactivate
                      </button>
                    )}
                    {selectedCoop.status !== "DISSOLVED" && (
                      <button
                        onClick={() => setShowDissolveModal(true)}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg bg-red-100 text-red-700 text-sm font-medium hover:bg-red-200"
                      >
                        <Trash2 size={14} /> Dissolve
                      </button>
                    )}
                  </div>
                </div>
              )}

              {detailTab === "members" && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-sm font-semibold text-[var(--text)]">
                      Members ({coopMembers.length})
                    </h4>
                    <button
                      onClick={() => setShowAddMemberModal(true)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-green text-white text-sm"
                    >
                      <UserPlus size={14} /> Add
                    </button>
                  </div>

                  <div className="space-y-2">
                    {coopMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 bg-[var(--background)] rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-brand-green flex items-center justify-center text-white font-semibold text-sm">
                            {member.user.firstName[0]}{member.user.lastName[0]}
                          </div>
                          <div>
                            <p className="font-medium text-sm text-[var(--text)]">
                              {member.user.firstName} {member.user.lastName}
                              {member.role === "Chair" && (
                                <span className="ml-2 text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">Chair</span>
                              )}
                            </p>
                            <p className="text-xs text-[var(--muted)]">{member.farmerId}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className={`text-sm font-bold ${member.farmScore >= 700 ? "text-green-600" : member.farmScore >= 500 ? "text-yellow-600" : "text-red-600"}`}>
                              {member.farmScore}
                            </p>
                            <p className="text-[10px] text-[var(--muted)]">{member.farmScoreTier}</p>
                          </div>
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            disabled={actionLoading}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                            title="Remove member"
                          >
                            <UserMinus size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {detailTab === "loans" && (
                <div className="text-center py-8 text-[var(--muted)]">
                  <DollarSign size={32} className="mx-auto mb-2 opacity-50" />
                  <p>Loan history will be displayed here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Suspend Modal */}
      {showSuspendModal && selectedCoop && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-[var(--surface)] rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-[var(--text)] mb-4">Suspend Cooperative</h3>
            <p className="text-sm text-[var(--muted)] mb-4">
              This will prevent new members from joining and new loan applications.
            </p>

            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1">Reason *</label>
              <textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                className="w-full p-2.5 border border-[var(--border)] rounded-lg bg-[var(--background)] text-sm"
                rows={3}
                placeholder="Enter reason for suspension..."
              />
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => { setShowSuspendModal(false); setActionReason(""); }}
                className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSuspend}
                disabled={!actionReason || actionLoading}
                className="px-4 py-2 rounded-lg bg-yellow-600 text-white text-sm font-medium disabled:opacity-50"
              >
                {actionLoading ? "Suspending..." : "Suspend"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dissolve Modal */}
      {showDissolveModal && selectedCoop && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-[var(--surface)] rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-red-600 mb-4">Dissolve Cooperative</h3>
            <p className="text-sm text-[var(--muted)] mb-4">
              This action is irreversible. All members will be removed from the cooperative.
              Cannot dissolve if there are active loans.
            </p>

            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1">Reason *</label>
              <textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                className="w-full p-2.5 border border-[var(--border)] rounded-lg bg-[var(--background)] text-sm"
                rows={3}
                placeholder="Enter reason for dissolution..."
              />
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => { setShowDissolveModal(false); setActionReason(""); }}
                className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDissolve}
                disabled={!actionReason || actionLoading}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium disabled:opacity-50"
              >
                {actionLoading ? "Dissolving..." : "Dissolve Cooperative"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
