"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, ShieldCheck, Loader2, AlertTriangle } from "lucide-react";
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

export default function RoleManagementPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  // Role-change modal state
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getUsers({
        search: search || undefined,
        role: roleFilter || undefined,
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
  }, [search, roleFilter, page]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  // Reset to first page whenever a server-side filter changes.
  useEffect(() => {
    setPage(1);
  }, [search, roleFilter]);

  const openEdit = (user: AdminUser) => {
    setEditing(user);
    setSelectedRole(user.role);
    setModalError(null);
  };

  const closeEdit = () => {
    if (saving) return;
    setEditing(null);
  };

  const save = async () => {
    if (!editing || selectedRole === editing.role) return;
    setSaving(true);
    setModalError(null);
    try {
      const updated = await adminApi.changeUserRole(editing.id, selectedRole);
      setUsers((prev) =>
        prev.map((u) => (u.id === updated.id ? { ...u, role: updated.role } : u))
      );
      setEditing(null);
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setModalError(axiosError.response?.data?.message || "Failed to change role");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-extrabold text-[var(--text)] mb-1">
          Role Management
        </h1>
        <p className="text-[13px] text-[var(--muted)]">
          {total} platform user{total === 1 ? "" : "s"} — promote or demote roles
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
                <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Email</th>
                <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Organization</th>
                <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Role</th>
                <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--input-bg)] transition-colors">
                  <td className="py-3 text-xs font-medium text-[var(--text)]">
                    {u.firstName} {u.lastName}
                  </td>
                  <td className="py-3 text-xs text-[var(--muted)]">{u.email}</td>
                  <td className="py-3 text-xs text-[var(--muted)]">{u.lenderOrg?.name ?? "—"}</td>
                  <td className="py-3">
                    <span className={`inline-block px-2 py-1 rounded-md text-[11px] font-semibold ${roleColor(u.role)}`}>
                      {roleLabel(u.role)}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <Button size="sm" variant="secondary" onClick={() => openEdit(u)}>
                      Change role
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

      <Modal open={!!editing} onClose={closeEdit} title="Change user role">
        {editing && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-[var(--input-bg)] rounded-lg">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white text-xs font-bold">
                {editing.firstName[0]}{editing.lastName[0]}
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text)]">
                  {editing.firstName} {editing.lastName}
                </p>
                <p className="text-xs text-[var(--muted)]">{editing.email}</p>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">
                Assign role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-[10px] px-3 py-2.5 text-sm text-[var(--text)] outline-none"
              >
                {ASSIGNABLE_ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
              <p className="text-[11px] text-[var(--muted)] mt-1.5">
                {ASSIGNABLE_ROLES.find((r) => r.value === selectedRole)?.description}
              </p>
            </div>

            {selectedRole === "SUPER_ADMIN" && editing.role !== "SUPER_ADMIN" && (
              <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-[12px] text-amber-700">
                <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" />
                <span>Super admins have full control over the entire platform. Grant this role carefully.</span>
              </div>
            )}

            {modalError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {modalError}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={closeEdit} disabled={saving}>
                Cancel
              </Button>
              <Button
                onClick={save}
                disabled={saving || selectedRole === editing.role}
              >
                {saving ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                ) : (
                  <><ShieldCheck className="mr-2 h-4 w-4" /> Update role</>
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
