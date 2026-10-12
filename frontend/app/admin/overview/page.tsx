"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Ticket, Building2, ShieldAlert, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { LineChartComponent } from "@/components/charts/line-chart";
import { PieChartComponent } from "@/components/charts/pie-chart";
import { adminApi, type PlatformStats, type GrowthPoint, type RevenueStats, type AdminAuditLog } from "@/lib/api";
import { formatCompactCurrency, formatCompactNumber } from "@/lib/utils";
import { AxiosError } from "axios";

const REVENUE_COLORS = ["#1B5E20", "#F9A825", "#2563eb", "#7c3aed"];

// Audit actions that warrant admin attention on the overview.
const CRITICAL_ACTIONS = ["DEACTIVATED", "SUSPENDED", "DELETED", "ROLE_CHANGED", "DEMOTED", "STATUS_CHANGED"];

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
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [growth, setGrowth] = useState<GrowthPoint[]>([]);
  const [revenue, setRevenue] = useState<RevenueStats | null>(null);
  const [openTickets, setOpenTickets] = useState(0);
  const [pendingLenders, setPendingLenders] = useState(0);
  const [suspendedLenders, setSuspendedLenders] = useState(0);
  const [criticalEvents, setCriticalEvents] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const [s, g, r, tickets, pending, suspended, audit] = await Promise.all([
          adminApi.getStats(),
          adminApi.getGrowthAnalytics(6),
          adminApi.getRevenueStats(),
          adminApi.getTickets({ status: "OPEN", limit: 1 }),
          adminApi.getLenders({ status: "PENDING", limit: 1 }),
          adminApi.getLenders({ status: "SUSPENDED", limit: 1 }),
          adminApi.getAuditLog({ limit: 20 }),
        ]);
        if (!active) return;
        setStats(s);
        setGrowth(g);
        setRevenue(r);
        setOpenTickets(tickets.pagination.total);
        setPendingLenders(pending.pagination.total);
        setSuspendedLenders(suspended.pagination.total);
        setCriticalEvents(
          audit.data.filter((l) => CRITICAL_ACTIONS.some((k) => l.action.toUpperCase().includes(k))).slice(0, 5)
        );
      } catch (err) {
        if (!active) return;
        const axiosError = err as AxiosError<{ message?: string }>;
        setError(axiosError.response?.data?.message || "Failed to load platform overview");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const revenuePie = (revenue?.breakdown ?? []).map((r, i) => ({
    name: r.name,
    value: r.value,
    color: REVENUE_COLORS[i % REVENUE_COLORS.length],
  }));
  const revenueTotal = revenuePie.reduce((s, r) => s + r.value, 0);

  const metrics = stats
    ? [
        { label: "Total Users", value: formatCompactNumber(stats.totalUsers), icon: "👥", grad: "linear-gradient(135deg,#1B5E20,#2E7D32)" },
        { label: "Total Lenders", value: formatCompactNumber(stats.totalLenders), icon: "🏛️", grad: "linear-gradient(135deg,#1565C0,#1976D2)" },
        { label: "Total Farmers", value: formatCompactNumber(stats.totalBorrowers), icon: "👨‍🌾", grad: "linear-gradient(135deg,#0891b2,#0e7490)" },
        { label: "Total Loans", value: formatCompactNumber(stats.totalLoans), icon: "🎯", grad: "linear-gradient(135deg,#6A1B9A,#7B1FA2)" },
        { label: "Total Disbursed", value: formatCompactCurrency(stats.totalDisbursed), icon: "💰", grad: "linear-gradient(135deg,#B45309,#D97706)" },
        { label: "Total Repaid", value: formatCompactCurrency(stats.totalRepaid), icon: "📈", grad: "linear-gradient(135deg,#B71C1C,#C62828)" },
      ]
    : [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-extrabold text-[var(--text)] mb-1">
          Platform Overview
        </h1>
        <p className="text-[13px] text-[var(--muted)]">
          Live platform metrics across all lenders and borrowers
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-6 w-6 animate-spin text-brand-green" />
        </div>
      ) : (
        <>
          {/* Needs attention */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-5">
            <Link href="/admin/support-tickets" className="group">
              <Card className="flex items-center gap-3 h-full transition-colors group-hover:border-brand-green">
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center flex-shrink-0">
                  <Ticket size={18} className="text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[var(--muted)]">Open Tickets</p>
                  <p className={`text-lg font-extrabold ${openTickets > 0 ? "text-amber-600" : "text-[var(--text)]"}`}>
                    {openTickets}
                  </p>
                </div>
                <ChevronRight size={16} className="text-[var(--muted)] flex-shrink-0" />
              </Card>
            </Link>

            <Link href="/admin/lender-accounts" className="group">
              <Card className="flex items-center gap-3 h-full transition-colors group-hover:border-brand-green">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                  <Building2 size={18} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[var(--muted)]">Lenders Pending Review</p>
                  <p className={`text-lg font-extrabold ${pendingLenders > 0 ? "text-blue-600" : "text-[var(--text)]"}`}>
                    {pendingLenders}
                  </p>
                </div>
                <ChevronRight size={16} className="text-[var(--muted)] flex-shrink-0" />
              </Card>
            </Link>

            <Link href="/admin/lender-accounts" className="group">
              <Card className="flex items-center gap-3 h-full transition-colors group-hover:border-brand-green">
                <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
                  <ShieldAlert size={18} className="text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[var(--muted)]">Suspended Lenders</p>
                  <p className={`text-lg font-extrabold ${suspendedLenders > 0 ? "text-red-600" : "text-[var(--text)]"}`}>
                    {suspendedLenders}
                  </p>
                </div>
                <ChevronRight size={16} className="text-[var(--muted)] flex-shrink-0" />
              </Card>
            </Link>
          </div>

          {criticalEvents.length > 0 && (
            <Card className="mb-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-[var(--text)]">Recent Critical Events</h3>
                <Link href="/admin/security" className="text-[11px] font-semibold text-brand-green hover:underline">
                  View all
                </Link>
              </div>
              <div className="space-y-0">
                {criticalEvents.map((log) => {
                  const actor = log.user ? `${log.user.firstName} ${log.user.lastName}` : "System";
                  return (
                    <div key={log.id} className="flex items-center gap-3 py-2.5 border-b border-[var(--border)] last:border-0">
                      <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-[var(--text)]">
                          {humanizeAction(log.action)}
                          {log.resource ? <span className="text-[var(--muted)]"> · {log.resource}</span> : null}
                        </p>
                        <p className="text-[11px] text-[var(--muted)]">{actor}</p>
                      </div>
                      <span className="text-[11px] text-[var(--muted)] flex-shrink-0">{relativeTime(log.createdAt)}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mb-5">
            {metrics.map((m, i) => (
              <div
                key={i}
                className="rounded-2xl p-5 relative overflow-hidden dark:border dark:border-[var(--border)]"
                style={{ background: m.grad }}
              >
                <div className="absolute -top-2.5 -right-2.5 w-16 h-16 rounded-full bg-white/[0.08]" />
                <div className="flex justify-between mb-2.5">
                  <p className="text-[11px] font-semibold text-white/70 uppercase tracking-wide">
                    {m.label}
                  </p>
                  <span className="text-xl">{m.icon}</span>
                </div>
                <p className="text-[26px] font-extrabold text-white mb-1.5">{m.value}</p>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
            <Card className="lg:col-span-2">
              <h3 className="text-sm font-bold text-[var(--text)] mb-4">
                Platform Growth
              </h3>
              {growth.length === 0 ? (
                <div className="py-16 text-center text-sm text-[var(--muted)]">No growth data yet</div>
              ) : (
                <LineChartComponent
                  data={growth}
                  xKey="m"
                  lines={[
                    { key: "lenders", color: "#16a34a", name: "Lenders" },
                    { key: "farmers", color: "#2563eb", name: "Farmers" },
                  ]}
                />
              )}
            </Card>
            <Card>
              <h3 className="text-sm font-bold text-[var(--text)] mb-4">
                Revenue Breakdown
              </h3>
              {revenueTotal === 0 ? (
                <div className="py-16 text-center text-sm text-[var(--muted)]">No revenue yet</div>
              ) : (
                <>
                  <PieChartComponent data={revenuePie} />
                  <div className="space-y-2 mt-3">
                    {revenuePie.map((r) => (
                      <div key={r.name} className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ background: r.color }}
                        />
                        <span className="text-[11px] text-[var(--muted)] flex-1">{r.name}</span>
                        <span className="text-[11px] font-bold text-[var(--text)]">
                          {revenueTotal > 0 ? Math.round((r.value / revenueTotal) * 100) : 0}%
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
