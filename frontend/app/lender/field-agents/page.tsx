"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search, RefreshCw, Download, MapPin, Phone, Star, Plus,
  Users, CheckCircle, Eye, MessageSquare, DollarSign, XCircle,
  ChevronLeft, ChevronRight, ClipboardList, UserPlus
} from "lucide-react";
import {
  fieldAgentsApi,
  type FieldAgent,
  type AgentStats,
  type FieldAgentsQuery,
  TASK_TYPES,
  TASK_PRIORITIES,
} from "@/lib/api/field-agents";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);
};

export default function FieldAgentsPage() {
  const [agents, setAgents] = useState<FieldAgent[]>([]);
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("ALL");
  const [activeFilter, setActiveFilter] = useState<"ALL" | "true" | "false">("ALL");

  const [selectedAgent, setSelectedAgent] = useState<FieldAgent | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRecruitModal, setShowRecruitModal] = useState(false);
  const [showAssignTaskModal, setShowAssignTaskModal] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);

  // Recruit form
  const [recruitForm, setRecruitForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    state: "",
    lga: "",
  });

  // Task form
  const [taskForm, setTaskForm] = useState({
    taskType: "VERIFICATION" as "REGISTRATION" | "VERIFICATION" | "MONITORING",
    borrowerId: "",
    dueDate: "",
    priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH",
    notes: "",
  });

  // Payout form
  const [payoutAmount, setPayoutAmount] = useState("");

  // Deactivate form
  const [deactivateReason, setDeactivateReason] = useState("");

  const fetchAgents = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const query: FieldAgentsQuery = { page, limit: 12 };
      if (search) query.search = search;
      if (stateFilter !== "ALL") query.state = stateFilter;
      if (activeFilter !== "ALL") query.active = activeFilter === "true";

      const [listResponse, statsResponse] = await Promise.all([
        fieldAgentsApi.list(query),
        fieldAgentsApi.getStats(),
      ]);

      setAgents(listResponse.data);
      setTotalPages(listResponse.pagination.totalPages);
      setTotal(listResponse.pagination.total);
      setStats(statsResponse);
    } catch (err) {
      console.error("Failed to fetch agents:", err);
      setError("Failed to load field agents. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, search, stateFilter, activeFilter]);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const handleRecruit = async () => {
    if (!recruitForm.firstName || !recruitForm.lastName || !recruitForm.email || !recruitForm.phone || !recruitForm.password || !recruitForm.state) {
      setError("Please fill all required fields");
      return;
    }

    setActionLoading(true);
    try {
      await fieldAgentsApi.create(recruitForm);
      setShowRecruitModal(false);
      setRecruitForm({ firstName: "", lastName: "", email: "", phone: "", password: "", state: "", lga: "" });
      fetchAgents(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to recruit agent");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignTask = async () => {
    if (!selectedAgent || !taskForm.borrowerId || !taskForm.dueDate) {
      setError("Please fill all required fields");
      return;
    }

    setActionLoading(true);
    try {
      await fieldAgentsApi.assignTask(selectedAgent.id, taskForm);
      setShowAssignTaskModal(false);
      setTaskForm({ taskType: "VERIFICATION", borrowerId: "", dueDate: "", priority: "MEDIUM", notes: "" });
      alert("Task assigned successfully");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to assign task");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePayout = async () => {
    if (!selectedAgent || !payoutAmount) return;

    setActionLoading(true);
    try {
      await fieldAgentsApi.approvePayout(selectedAgent.id, parseFloat(payoutAmount));
      setShowPayoutModal(false);
      setPayoutAmount("");
      fetchAgents(true);
      alert("Payout approved successfully");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to approve payout");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (!selectedAgent || !deactivateReason) return;

    setActionLoading(true);
    try {
      await fieldAgentsApi.deactivate(selectedAgent.id, deactivateReason);
      setShowDeactivateModal(false);
      setDeactivateReason("");
      fetchAgents(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to deactivate agent");
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivate = async (agent: FieldAgent) => {
    setActionLoading(true);
    try {
      await fieldAgentsApi.activate(agent.id);
      fetchAgents(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to activate agent");
    } finally {
      setActionLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={12}
            className={star <= Math.round(rating) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}
          />
        ))}
        <span className="text-xs text-[var(--muted)] ml-1">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Field Agents</h1>
          <p className="text-sm text-[var(--muted)]">
            {loading ? "Loading..." : `${total} agents across ${new Set(agents.map((a) => a.state)).size} states`}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fetchAgents(true)}
            disabled={refreshing}
            className="p-2 rounded-lg border border-[var(--border)] hover:bg-[var(--surface)]"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => setShowRecruitModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-brand-green text-white text-sm font-medium"
          >
            <UserPlus size={14} /> Recruit Agent
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--muted)] uppercase font-semibold">Total Agents</span>
              <Users size={16} className="text-blue-500" />
            </div>
            <p className="text-2xl font-bold text-[var(--text)]">{stats.totalAgents}</p>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--muted)] uppercase font-semibold">Active Agents</span>
              <CheckCircle size={16} className="text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.activeAgents}</p>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--muted)] uppercase font-semibold">Registered (Month)</span>
              <UserPlus size={16} className="text-purple-500" />
            </div>
            <p className="text-2xl font-bold text-[var(--text)]">{stats.farmersRegisteredThisMonth}</p>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--muted)] uppercase font-semibold">Verified (Month)</span>
              <CheckCircle size={16} className="text-yellow-500" />
            </div>
            <p className="text-2xl font-bold text-[var(--text)]">{stats.farmsVerifiedThisMonth}</p>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--muted)] uppercase font-semibold">Visits (Month)</span>
              <MapPin size={16} className="text-red-500" />
            </div>
            <p className="text-2xl font-bold text-[var(--text)]">{stats.visitsThisMonth}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="text"
            placeholder="Search by name or email..."
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
          <option value="Niger">Niger</option>
          <option value="Oyo">Oyo</option>
          <option value="Anambra">Anambra</option>
          <option value="Imo">Imo</option>
          <option value="Kogi">Kogi</option>
        </select>
        <select
          value={activeFilter}
          onChange={(e) => { setActiveFilter(e.target.value as any); setPage(1); }}
          className="px-4 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm"
        >
          <option value="ALL">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {/* Agent Cards Grid */}
      {loading ? (
        <div className="text-center py-12 text-[var(--muted)]">Loading...</div>
      ) : agents.length === 0 ? (
        <div className="text-center py-12 text-[var(--muted)]">No field agents found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {agents.map((agent) => {
            const fullName = `${agent.user.firstName} ${agent.user.lastName}`;

            return (
              <div
                key={agent.id}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-green flex items-center justify-center text-white font-semibold text-sm">
                      {fullName.split(" ").map((n) => n[0]).join("").toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[var(--text)]">{fullName}</h3>
                      <p className="text-xs text-[var(--muted)]">{agent.agentCode}</p>
                    </div>
                  </div>
                  <div className={`w-2.5 h-2.5 rounded-full ${agent.active ? "bg-green-500" : "bg-gray-400"}`} />
                </div>

                <div className="flex items-center gap-1 text-xs text-[var(--muted)] mb-2">
                  <MapPin size={12} />
                  {agent.state}{agent.lga ? `, ${agent.lga}` : ""}
                </div>

                {renderStars(agent.rating)}

                <div className="grid grid-cols-3 gap-2 mt-3 mb-3">
                  <div className="text-center">
                    <p className="text-[10px] text-[var(--muted)] uppercase">Registered</p>
                    <p className="text-sm font-bold text-[var(--text)]">{agent.registrations}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-[var(--muted)] uppercase">Verified</p>
                    <p className="text-sm font-bold text-green-600">{agent.verifications}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-[var(--muted)] uppercase">Visits</p>
                    <p className="text-sm font-bold text-[var(--text)]">{agent.inspections}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-[var(--muted)] mb-3">
                  <div className="flex items-center gap-1">
                    <Phone size={11} />
                    {agent.user.phone || "N/A"}
                  </div>
                  <div className="font-semibold text-green-600">
                    {formatCurrency(agent.totalEarnings)}
                  </div>
                </div>

                <div className="flex gap-1 pt-3 border-t border-[var(--border)]">
                  <button
                    onClick={() => { setSelectedAgent(agent); setShowDetailModal(true); }}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-xs font-medium bg-[var(--background)] hover:bg-[var(--border)]"
                  >
                    <Eye size={12} /> View
                  </button>
                  <button
                    onClick={() => { setSelectedAgent(agent); setShowAssignTaskModal(true); }}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-xs font-medium bg-[var(--background)] hover:bg-[var(--border)]"
                  >
                    <ClipboardList size={12} /> Task
                  </button>
                  <button
                    onClick={() => { setSelectedAgent(agent); setPayoutAmount(agent.totalEarnings.toString()); setShowPayoutModal(true); }}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded text-xs font-medium bg-[var(--background)] hover:bg-[var(--border)]"
                  >
                    <DollarSign size={12} /> Pay
                  </button>
                  {agent.active ? (
                    <button
                      onClick={() => { setSelectedAgent(agent); setShowDeactivateModal(true); }}
                      className="p-1.5 rounded text-red-600 hover:bg-red-50"
                      title="Deactivate"
                    >
                      <XCircle size={14} />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleActivate(agent)}
                      className="p-1.5 rounded text-green-600 hover:bg-green-50"
                      title="Activate"
                    >
                      <CheckCircle size={14} />
                    </button>
                  )}
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

      {/* Recruit Agent Modal */}
      {showRecruitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--surface)] rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-[var(--text)] mb-4">Recruit New Agent</h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[var(--text)] mb-1">First Name *</label>
                  <input
                    type="text"
                    value={recruitForm.firstName}
                    onChange={(e) => setRecruitForm({ ...recruitForm, firstName: e.target.value })}
                    className="w-full p-2.5 border border-[var(--border)] rounded-lg bg-[var(--background)] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text)] mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={recruitForm.lastName}
                    onChange={(e) => setRecruitForm({ ...recruitForm, lastName: e.target.value })}
                    className="w-full p-2.5 border border-[var(--border)] rounded-lg bg-[var(--background)] text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">Email *</label>
                <input
                  type="email"
                  value={recruitForm.email}
                  onChange={(e) => setRecruitForm({ ...recruitForm, email: e.target.value })}
                  className="w-full p-2.5 border border-[var(--border)] rounded-lg bg-[var(--background)] text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">Phone *</label>
                <input
                  type="tel"
                  value={recruitForm.phone}
                  onChange={(e) => setRecruitForm({ ...recruitForm, phone: e.target.value })}
                  className="w-full p-2.5 border border-[var(--border)] rounded-lg bg-[var(--background)] text-sm"
                  placeholder="08012345678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">Password *</label>
                <input
                  type="password"
                  value={recruitForm.password}
                  onChange={(e) => setRecruitForm({ ...recruitForm, password: e.target.value })}
                  className="w-full p-2.5 border border-[var(--border)] rounded-lg bg-[var(--background)] text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[var(--text)] mb-1">State *</label>
                  <select
                    value={recruitForm.state}
                    onChange={(e) => setRecruitForm({ ...recruitForm, state: e.target.value })}
                    className="w-full p-2.5 border border-[var(--border)] rounded-lg bg-[var(--background)] text-sm"
                  >
                    <option value="">Select state</option>
                    <option value="Kebbi">Kebbi</option>
                    <option value="Kano">Kano</option>
                    <option value="Kaduna">Kaduna</option>
                    <option value="Niger">Niger</option>
                    <option value="Oyo">Oyo</option>
                    <option value="Anambra">Anambra</option>
                    <option value="Imo">Imo</option>
                    <option value="Kogi">Kogi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text)] mb-1">LGA</label>
                  <input
                    type="text"
                    value={recruitForm.lga}
                    onChange={(e) => setRecruitForm({ ...recruitForm, lga: e.target.value })}
                    className="w-full p-2.5 border border-[var(--border)] rounded-lg bg-[var(--background)] text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowRecruitModal(false)}
                className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleRecruit}
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg bg-brand-green text-white text-sm font-medium disabled:opacity-50"
              >
                {actionLoading ? "Creating..." : "Recruit Agent"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Task Modal */}
      {showAssignTaskModal && selectedAgent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--surface)] rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-[var(--text)] mb-4">
              Assign Task to {selectedAgent.user.firstName}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">Task Type</label>
                <select
                  value={taskForm.taskType}
                  onChange={(e) => setTaskForm({ ...taskForm, taskType: e.target.value as any })}
                  className="w-full p-2.5 border border-[var(--border)] rounded-lg bg-[var(--background)] text-sm"
                >
                  {TASK_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label} (₦{t.earning.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">Borrower ID *</label>
                <input
                  type="text"
                  value={taskForm.borrowerId}
                  onChange={(e) => setTaskForm({ ...taskForm, borrowerId: e.target.value })}
                  className="w-full p-2.5 border border-[var(--border)] rounded-lg bg-[var(--background)] text-sm"
                  placeholder="Enter borrower ID"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[var(--text)] mb-1">Due Date *</label>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    className="w-full p-2.5 border border-[var(--border)] rounded-lg bg-[var(--background)] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text)] mb-1">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as any })}
                    className="w-full p-2.5 border border-[var(--border)] rounded-lg bg-[var(--background)] text-sm"
                  >
                    {TASK_PRIORITIES.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1">Notes</label>
                <textarea
                  value={taskForm.notes}
                  onChange={(e) => setTaskForm({ ...taskForm, notes: e.target.value })}
                  className="w-full p-2.5 border border-[var(--border)] rounded-lg bg-[var(--background)] text-sm"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowAssignTaskModal(false)}
                className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignTask}
                disabled={actionLoading}
                className="px-4 py-2 rounded-lg bg-brand-green text-white text-sm font-medium disabled:opacity-50"
              >
                {actionLoading ? "Assigning..." : "Assign Task"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payout Modal */}
      {showPayoutModal && selectedAgent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--surface)] rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-[var(--text)] mb-4">
              Approve Payout for {selectedAgent.user.firstName}
            </h3>

            <div className="bg-[var(--background)] rounded-lg p-4 mb-4">
              <p className="text-sm text-[var(--muted)]">Available Balance</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(selectedAgent.totalEarnings)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1">Payout Amount (₦)</label>
              <input
                type="number"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                max={selectedAgent.totalEarnings}
                className="w-full p-2.5 border border-[var(--border)] rounded-lg bg-[var(--background)] text-sm"
              />
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowPayoutModal(false)}
                className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handlePayout}
                disabled={actionLoading || parseFloat(payoutAmount) > selectedAgent.totalEarnings}
                className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium disabled:opacity-50"
              >
                {actionLoading ? "Processing..." : "Approve Payout"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Modal */}
      {showDeactivateModal && selectedAgent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--surface)] rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-[var(--text)] mb-4">
              Deactivate {selectedAgent.user.firstName} {selectedAgent.user.lastName}
            </h3>
            <p className="text-sm text-[var(--muted)] mb-4">
              This will prevent the agent from receiving new tasks. Provide a reason for deactivation.
            </p>

            <div>
              <label className="block text-sm font-medium text-[var(--text)] mb-1">Reason *</label>
              <textarea
                value={deactivateReason}
                onChange={(e) => setDeactivateReason(e.target.value)}
                className="w-full p-2.5 border border-[var(--border)] rounded-lg bg-[var(--background)] text-sm"
                rows={3}
                placeholder="Enter reason for deactivation..."
              />
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowDeactivateModal(false)}
                className="px-4 py-2 rounded-lg border border-[var(--border)] text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDeactivate}
                disabled={!deactivateReason || actionLoading}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium disabled:opacity-50"
              >
                {actionLoading ? "Deactivating..." : "Deactivate Agent"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Agent Detail Modal */}
      {showDetailModal && selectedAgent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--surface)] rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-brand-green flex items-center justify-center text-white font-bold text-xl">
                  {`${selectedAgent.user.firstName[0]}${selectedAgent.user.lastName[0]}`}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[var(--text)]">
                    {selectedAgent.user.firstName} {selectedAgent.user.lastName}
                  </h3>
                  <p className="text-sm text-[var(--muted)]">{selectedAgent.agentCode}</p>
                  {renderStars(selectedAgent.rating)}
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-2 hover:bg-[var(--background)] rounded-lg"
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-[var(--background)] rounded-lg p-3 text-center">
                <p className="text-xs text-[var(--muted)] uppercase">Registrations</p>
                <p className="text-xl font-bold text-[var(--text)]">{selectedAgent.registrations}</p>
              </div>
              <div className="bg-[var(--background)] rounded-lg p-3 text-center">
                <p className="text-xs text-[var(--muted)] uppercase">Verifications</p>
                <p className="text-xl font-bold text-green-600">{selectedAgent.verifications}</p>
              </div>
              <div className="bg-[var(--background)] rounded-lg p-3 text-center">
                <p className="text-xs text-[var(--muted)] uppercase">Inspections</p>
                <p className="text-xl font-bold text-[var(--text)]">{selectedAgent.inspections}</p>
              </div>
              <div className="bg-[var(--background)] rounded-lg p-3 text-center">
                <p className="text-xs text-[var(--muted)] uppercase">Earnings</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(selectedAgent.totalEarnings)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <h4 className="text-sm font-semibold text-[var(--text)] mb-2">Contact</h4>
                <p className="text-sm text-[var(--muted)]">{selectedAgent.user.email}</p>
                <p className="text-sm text-[var(--muted)]">{selectedAgent.user.phone || "No phone"}</p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[var(--text)] mb-2">Coverage Area</h4>
                <p className="text-sm text-[var(--muted)]">{selectedAgent.state}{selectedAgent.lga ? `, ${selectedAgent.lga}` : ""}</p>
                {selectedAgent.coverageArea.length > 0 && (
                  <p className="text-xs text-[var(--muted)]">Zones: {selectedAgent.coverageArea.join(", ")}</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-[var(--text)] mb-2">Recent Activity</h4>
              {selectedAgent.visits && selectedAgent.visits.length > 0 ? (
                <div className="space-y-2">
                  {selectedAgent.visits.slice(0, 5).map((visit) => (
                    <div key={visit.id} className="flex items-center justify-between text-sm p-2 bg-[var(--background)] rounded">
                      <span>{visit.purpose}</span>
                      <span className="text-xs text-[var(--muted)]">
                        {new Date(visit.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[var(--muted)]">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
