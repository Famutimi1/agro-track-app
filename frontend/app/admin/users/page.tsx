"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, Loader2, CheckCircle2, XCircle, ShieldCheck, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { adminApi, ASSIGNABLE_ROLES, type AdminUser } from "@/lib/api";
import { AxiosError } from "axios";

const LIMIT = 20;

const roleLabel = (value: string) =>
  ASSIGNABLE_ROLES.find((r) => r.value === value)?.label ?? value;

function roleColor(role: string) {
  if (role === "SUPER_ADMIN") return "bg-red-500/15 text-red-500";
  if (role.startsWith("LENDER_")) return "bg-blue-500/15 text-blue-500";
  if (role.startsWith("FIELD_")) return "bg-amber-500/15 text-amber-600";
  if (role === "BORROWER") return "bg-green-500/15 text-green-600";
  return "bg-slate-500/15 text-slate-500";
}

const fmtDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Never";

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Status-change confirmation modal
  const [target, setTarget] = useState<AdminUser | null>(null);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getUsers({
        search: search || undefined,
        role: roleFilter || undefined,
        status: (statusFilter as "active" | "inactive") || undefined,
        page,
        limit: LIMIT,
      });
      setUsers(res.data);
      setTotal(res.pagination.total);
      setTotalPages(res.pagination.totalPages);
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, statusFilter, page]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  // Reset to first page whenever a server-side filter changes.
  useEffect(() => {
    setPage(1);
  }, [search, roleFilter, statusFilter]);

  const openStatus = (user: AdminUser) => {
    setTarget(user);
    setModalError(null);
  };

  const closeStatus = () => {
    if (saving) return;
    setTarget(null);
  };

  const confirmStatus = async () => {
    if (!target) return;
    setSaving(true);
    setModalError(null);
    try {
      const updated = await adminApi.setUserStatus(target.id, !target.isActive);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? { ...u, isActive: updated.isActive } : u)));
      setTarget(null);
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setModalError(axiosError.response?.data?.message || "Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  const activeCount = users.filter((u) => u.isActive).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-extrabold text-[var(--text)] mb-1">User Management</h1>
        <p className="text-[13px] text-[var(--muted)]">
          {total} platform user{total === 1 ? "" : "s"} · {activeCount} active in view
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center gap-2 bg-[var(--input-bg)] border border-[var(--border)] rounded-[10px] px-3 py-2 flex-1 min-w-[220px] max-w-sm">
          <Search size={14} className="text-[var(--muted)]" />
          <input
            className="bg-transparent border-none outline-none text-[13px] flex-1 text-[var(--text)] placeholder:text-[var(--muted)]"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-[var(--input-bg)] border border-[var(--border)] rounded-[10px] px-3 py-2 text-[13px] text-[var(--text)] outline-none"
        >
          <option value="">All roles</option>
          {ASSIGNABLE_ROLES.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[var(--input-bg)] border border-[var(--border)] rounded-[10px] px-3 py-2 text-[13px] text-[var(--text)] outline-none"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
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
        ) : users.length === 0 ? (
          <div className="py-16 text-center text-sm text-[var(--muted)]">No users found</div>
        ) : (
          <>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">User</th>
                <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Role</th>
                <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Organization</th>
                <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Verified</th>
                <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Last Login</th>
                <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Status</th>
                <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--input-bg)] transition-colors">
                  <td className="py-3 text-xs font-medium text-[var(--text)]">
                    {u.firstName} {u.lastName}
                    <span className="block text-[10px] text-[var(--muted)] font-normal">{u.email}</span>
                  </td>
                  <td className="py-3">
                    <span className={`inline-block px-2 py-1 rounded-md text-[11px] font-semibold ${roleColor(u.role)}`}>
                      {roleLabel(u.role)}
                    </span>
                  </td>
                  <td className="py-3 text-xs text-[var(--muted)]">{u.lenderOrg?.name ?? "—"}</td>
                  <td className="py-3">
                    {u.emailVerified ? (
                      <CheckCircle2 size={16} className="text-green-600" />
                    ) : (
                      <XCircle size={16} className="text-[var(--muted)]" />
                    )}
                  </td>
                  <td className="py-3 text-xs text-[var(--muted)]">{fmtDate(u.lastLoginAt)}</td>
                  <td className="py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded ${
                        u.isActive
                          ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                          : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? "bg-green-500" : "bg-gray-400"}`} />
                      {u.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <Button
                      size="sm"
                      variant={u.isActive ? "danger" : "secondary"}
                      onClick={() => openStatus(u)}
                    >
                      {u.isActive ? "Deactivate" : "Activate"}
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

      <Modal open={!!target} onClose={closeStatus} title={target?.isActive ? "Deactivate user" : "Activate user"}>
        {target && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-[var(--input-bg)] rounded-lg">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white text-xs font-bold">
                {target.firstName[0]}{target.lastName[0]}
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text)]">
                  {target.firstName} {target.lastName}
                </p>
                <p className="text-xs text-[var(--muted)]">{target.email}</p>
              </div>
            </div>

            <div className={`flex items-start gap-2 p-3 rounded-lg text-[12px] ${
              target.isActive
                ? "bg-red-500/10 border border-red-500/30 text-red-700"
                : "bg-green-500/10 border border-green-500/30 text-green-700"
            }`}>
              <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" />
              <span>
                {target.isActive
                  ? "The user will be signed out and blocked from logging in until reactivated."
                  : "The user will regain access to the platform and be able to log in."}
              </span>
            </div>

            {modalError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {modalError}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={closeStatus} disabled={saving}>
                Cancel
              </Button>
              <Button
                variant={target.isActive ? "danger" : "primary"}
                onClick={confirmStatus}
                disabled={saving}
              >
                {saving ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                ) : (
                  <><ShieldCheck className="mr-2 h-4 w-4" /> {target.isActive ? "Deactivate" : "Activate"}</>
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
