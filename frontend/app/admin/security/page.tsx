"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Shield, AlertTriangle, Loader2, Search } from "lucide-react";
import { Pagination } from "@/components/ui/pagination";
import { adminApi, type AdminAuditLog } from "@/lib/api";
import { AxiosError } from "axios";

const LIMIT = 25;

// Actions whose names imply a security-sensitive or destructive change.
const CRITICAL_ACTIONS = ["DEACTIVATED", "SUSPENDED", "DELETED", "ROLE_CHANGED", "DEMOTED"];
const WARNING_ACTIONS = ["UPDATED", "TOGGLED", "SETTINGS", "ACTIVATED", "PROMOTED"];

const levelOf = (action: string): "critical" | "warning" | "info" => {
  const a = action.toUpperCase();
  if (CRITICAL_ACTIONS.some((k) => a.includes(k))) return "critical";
  if (WARNING_ACTIONS.some((k) => a.includes(k))) return "warning";
  return "info";
};

const humanizeAction = (action: string) =>
  action
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const relativeTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs === 1 ? "" : "s"} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const isWithin24h = (iso: string) => Date.now() - new Date(iso).getTime() < 86400000;

export default function SecurityPage() {
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState("");
  const [resourceFilter, setResourceFilter] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getAuditLog({
        action: actionFilter || undefined,
        resource: resourceFilter || undefined,
        page,
        limit: LIMIT,
      });
      setLogs(res.data);
      setTotal(res.pagination.total);
      setTotalPages(res.pagination.totalPages);
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || "Failed to load audit log");
    } finally {
      setLoading(false);
    }
  }, [actionFilter, resourceFilter, page]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  // Reset to first page whenever a filter changes.
  useEffect(() => {
    setPage(1);
  }, [actionFilter, resourceFilter]);

  const warnings24h = logs.filter((l) => isWithin24h(l.createdAt) && levelOf(l.action) !== "info").length;
  const critical24h = logs.filter((l) => isWithin24h(l.createdAt) && levelOf(l.action) === "critical").length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-extrabold text-[var(--text)] mb-1">Security &amp; Audit</h1>
        <p className="text-[13px] text-[var(--muted)]">Audit trail and security events</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <Card className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
            <Shield size={18} className="text-green-600" />
          </div>
          <div>
            <p className="text-xs text-[var(--muted)]">Security Status</p>
            <p className={`text-sm font-bold ${critical24h > 0 ? "text-red-600" : "text-green-600"}`}>
              {critical24h > 0 ? `${critical24h} critical event${critical24h === 1 ? "" : "s"}` : "All Clear"}
            </p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center">
            <AlertTriangle size={18} className="text-yellow-600" />
          </div>
          <div>
            <p className="text-xs text-[var(--muted)]">Warnings (24h)</p>
            <p className="text-sm font-bold text-yellow-600">{warnings24h}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
            <Shield size={18} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-[var(--muted)]">Total Events</p>
            <p className="text-sm font-bold text-blue-600">{total}</p>
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center gap-2 bg-[var(--input-bg)] border border-[var(--border)] rounded-[10px] px-3 py-2 flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="text-[var(--muted)]" />
          <input
            className="bg-transparent border-none outline-none text-[13px] flex-1 text-[var(--text)] placeholder:text-[var(--muted)]"
            placeholder="Filter by action..."
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          />
        </div>
        <select
          value={resourceFilter}
          onChange={(e) => setResourceFilter(e.target.value)}
          className="bg-[var(--input-bg)] border border-[var(--border)] rounded-[10px] px-3 py-2 text-[13px] text-[var(--text)] outline-none"
        >
          <option value="">All resources</option>
          <option value="User">User</option>
          <option value="LenderOrganization">Lender Organization</option>
          <option value="SupportTicket">Support Ticket</option>
          <option value="PlatformSetting">Platform Setting</option>
          <option value="FeatureFlag">Feature Flag</option>
        </select>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      <Card>
        <h3 className="text-sm font-bold text-[var(--text)] mb-4">Audit Log</h3>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-brand-green" />
          </div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center text-sm text-[var(--muted)]">No audit events recorded</div>
        ) : (
          <div className="space-y-0">
            {logs.map((log) => {
              const level = levelOf(log.action);
              const actor = log.user ? `${log.user.firstName} ${log.user.lastName}` : "System";
              return (
                <div key={log.id} className="flex items-center gap-3 py-3 border-b border-[var(--border)] last:border-0">
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      level === "critical" ? "bg-red-500" : level === "warning" ? "bg-yellow-500" : "bg-green-500"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[var(--text)]">
                      {humanizeAction(log.action)}
                      {log.resource ? <span className="text-[var(--muted)]"> · {log.resource}</span> : null}
                    </p>
                    <p className="text-[11px] text-[var(--muted)]">
                      {actor} · {log.ipAddress || "—"}
                    </p>
                  </div>
                  <span className="text-[11px] text-[var(--muted)] flex-shrink-0">{relativeTime(log.createdAt)}</span>
                </div>
              );
            })}
          </div>
        )}
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </Card>
    </div>
  );
}
