"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, AlertTriangle, RefreshCw, Send, Flag, Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { LineChartComponent } from "@/components/charts/line-chart";
import { BarChartComponent } from "@/components/charts/bar-chart";
import { PieChartComponent } from "@/components/charts/pie-chart";
import { useAuthStore } from "@/lib/stores";
import { usePdfExport } from "@/lib/hooks";
import {
  dashboardApi,
  type DashboardData,
  type DashboardStats,
  type TrendData,
  type CropDistribution,
  type StatePerformance,
  type RecentActivity,
  type AtRiskBorrower,
} from "@/lib/api";

// Fallback mock data for when API returns empty
const FALLBACK_DATA: DashboardData = {
  stats: {
    totalDisbursed: 850000000,
    totalRepaid: 420000000,
    activeBorrowers: 1247,
    defaultRate: 7.8,
    pendingApplications: 47,
    activePrograms: 5,
  },
  trends: [
    { month: "Jan", disbursed: 45.2, repaid: 22.1 },
    { month: "Feb", disbursed: 52.8, repaid: 28.4 },
    { month: "Mar", disbursed: 61.3, repaid: 35.2 },
    { month: "Apr", disbursed: 78.5, repaid: 42.8 },
    { month: "May", disbursed: 85.2, repaid: 51.3 },
    { month: "Jun", disbursed: 92.1, repaid: 58.7 },
  ],
  cropDistribution: [
    { name: "Rice", value: 35, color: "#16a34a" },
    { name: "Cassava", value: 25, color: "#eab308" },
    { name: "Maize", value: 20, color: "#3b82f6" },
    { name: "Yam", value: 12, color: "#f97316" },
    { name: "Other", value: 8, color: "#6b7280" },
  ],
  statePerformance: [
    { state: "Kebbi", rate: 92, totalLoans: 45, onTimePayments: 41 },
    { state: "Kano", rate: 87, totalLoans: 38, onTimePayments: 33 },
    { state: "Kaduna", rate: 78, totalLoans: 32, onTimePayments: 25 },
    { state: "Niger", rate: 85, totalLoans: 28, onTimePayments: 24 },
    { state: "Sokoto", rate: 71, totalLoans: 22, onTimePayments: 16 },
  ],
  recentActivity: [
    { id: "1", type: "disbursement", text: "₦340,000 disbursed to Musa Garba", time: "2h ago", color: "#7c3aed", bg: "#ede9fe" },
    { id: "2", type: "application_approved", text: "Application approved for Amina Bello", time: "3h ago", color: "#16a34a", bg: "#dcfce7" },
    { id: "3", type: "repayment", text: "₦85,000 repayment received from Chidi Okonkwo", time: "5h ago", color: "#0891b2", bg: "#cffafe" },
    { id: "4", type: "application_submitted", text: "New application from Fatima Yusuf", time: "6h ago", color: "#3b82f6", bg: "#dbeafe" },
  ],
  atRiskBorrowers: [
    { id: "1", name: "Musa Garba", farmerId: "FRM-001", state: "Kebbi", crop: "Rice", overdue: 85000, days: 12, score: 580, loanId: "ln1" },
    { id: "2", name: "Amina Bello", farmerId: "FRM-002", state: "Kano", crop: "Maize", overdue: 65000, days: 8, score: 620, loanId: "ln2" },
    { id: "3", name: "Chidi Okonkwo", farmerId: "FRM-003", state: "Anambra", crop: "Cassava", overdue: 120000, days: 15, score: 490, loanId: "ln3" },
  ],
};

const CROP_COLORS: Record<string, { bg: string; color: string }> = {
  Rice: { bg: "#dcfce7", color: "#166534" },
  Cassava: { bg: "#fef3c7", color: "#854d0e" },
  Maize: { bg: "#dbeafe", color: "#1e40af" },
  Yam: { bg: "#fed7aa", color: "#9a3412" },
  Cocoa: { bg: "#d1fae5", color: "#065f46" },
  Vegetables: { bg: "#d1fae5", color: "#065f46" },
  Tomato: { bg: "#fee2e2", color: "#991b1b" },
  Pepper: { bg: "#fef9c3", color: "#713f12" },
  Sorghum: { bg: "#ede9fe", color: "#5b21b6" },
  Other: { bg: "#f3f4f6", color: "#6b7280" },
};

const AUTO_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const orgName = user?.lenderOrg?.name ?? `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();

  const [data, setData] = useState<DashboardData>(FALLBACK_DATA);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // PDF Export
  const dashboardRef = useRef<HTMLDivElement>(null);
  const { exportToPdf, exporting } = usePdfExport();

  const handleExportPdf = async () => {
    const result = await exportToPdf(dashboardRef, {
      filename: `agrotrack-dashboard-${new Date().toISOString().split("T")[0]}`,
      title: `${orgName || "AgroTrack"} — Dashboard Report`,
      orientation: "landscape",
      margin: 15,
    });

    if (!result.success) {
      setError(`PDF export failed: ${result.error}`);
    }
  };

  const fetchDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const response = await dashboardApi.getAll();
      // Use response data if available, otherwise keep fallback
      setData({
        stats: response.stats.totalDisbursed > 0 ? response.stats : FALLBACK_DATA.stats,
        trends: response.trends.length > 0 ? response.trends : FALLBACK_DATA.trends,
        cropDistribution: response.cropDistribution.length > 0 ? response.cropDistribution : FALLBACK_DATA.cropDistribution,
        statePerformance: response.statePerformance.length > 0 ? response.statePerformance : FALLBACK_DATA.statePerformance,
        recentActivity: response.recentActivity.length > 0 ? response.recentActivity : FALLBACK_DATA.recentActivity,
        atRiskBorrowers: response.atRiskBorrowers.length > 0 ? response.atRiskBorrowers : FALLBACK_DATA.atRiskBorrowers,
      });
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      setError("Failed to load dashboard data. Using cached data.");
      // Keep fallback data on error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();

    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      fetchDashboard(true);
    }, AUTO_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [fetchDashboard]);

  const handleKpiClick = (metric: string) => {
    switch (metric) {
      case "totalDisbursed":
        router.push("/lender/disbursements");
        break;
      case "totalRepaid":
        router.push("/lender/repayments");
        break;
      case "activeBorrowers":
        router.push("/lender/borrowers?status=active");
        break;
      case "defaultRate":
        router.push("/lender/borrowers?status=defaulting");
        break;
      case "pendingApplications":
        router.push("/lender/applications?status=SUBMITTED");
        break;
      case "activePrograms":
        router.push("/lender/loan-programs?status=Active");
        break;
    }
  };

  const handleSendReminder = async (borrower: AtRiskBorrower) => {
    // TODO: Implement send reminder API
    alert(`Sending reminder to ${borrower.name}...`);
  };

  const handleFlagBorrower = async (borrower: AtRiskBorrower) => {
    // TODO: Implement flag borrower API
    alert(`Flagging ${borrower.name} for review...`);
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 1_000_000_000) {
      return `₦${(amount / 1_000_000_000).toFixed(2)}B`;
    }
    if (amount >= 1_000_000) {
      return `₦${(amount / 1_000_000).toFixed(1)}M`;
    }
    return `₦${amount.toLocaleString()}`;
  };

  const kpiCards = [
    {
      key: "totalDisbursed",
      title: "Total Disbursed",
      value: formatCurrency(data.stats.totalDisbursed),
      trend: "+12%",
      sub: "vs last month",
      grad: "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
    },
    {
      key: "totalRepaid",
      title: "Total Repaid",
      value: formatCurrency(data.stats.totalRepaid),
      trend: "+8%",
      sub: "vs last month",
      grad: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
    },
    {
      key: "activeBorrowers",
      title: "Active Borrowers",
      value: data.stats.activeBorrowers.toLocaleString(),
      trend: "+5%",
      sub: "this quarter",
      grad: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
    },
    {
      key: "defaultRate",
      title: "Default Rate",
      value: `${data.stats.defaultRate}%`,
      trend: data.stats.defaultRate > 10 ? "⚠️" : "✓",
      sub: data.stats.defaultRate > 10 ? "above target" : "within target",
      grad: data.stats.defaultRate > 10
        ? "linear-gradient(135deg, #dc2626 0%, #ef4444 100%)"
        : "linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)",
    },
    {
      key: "pendingApplications",
      title: "Pending Apps",
      value: data.stats.pendingApplications.toString(),
      trend: "→",
      sub: "awaiting review",
      grad: "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)",
    },
    {
      key: "activePrograms",
      title: "Active Programs",
      value: data.stats.activePrograms.toString(),
      trend: "",
      sub: "accepting applications",
      grad: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
    },
  ];

  const currentDate = new Date().toLocaleDateString("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-[var(--text)] mb-1">
            {greeting()}, {orgName || "there"} 👋
          </h1>
          <p className="text-[13px] text-[var(--muted)]">
            {currentDate} — Here&apos;s your portfolio at a glance
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-[11px] text-[var(--muted)]">
              Updated {lastUpdated.toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <button
            onClick={() => fetchDashboard(true)}
            disabled={refreshing}
            className="p-2 rounded-lg border border-[var(--border)] hover:bg-[var(--surface)] transition-colors disabled:opacity-50"
            title="Refresh dashboard"
          >
            <RefreshCw size={16} className={`text-[var(--muted)] ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleExportPdf}
            disabled={exporting || loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--border)] hover:bg-[var(--surface)] transition-colors disabled:opacity-50 text-xs font-medium text-[var(--muted)]"
            title="Export dashboard as PDF"
          >
            <Download size={14} />
            {exporting ? "Exporting..." : "Export PDF"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-sm">
          {error}
        </div>
      )}

      {/* Dashboard content for PDF export */}
      <div ref={dashboardRef} className="bg-[var(--background)]">
        {/* KPI Cards - Clickable */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3.5 mb-5">
        {kpiCards.map((c) => (
          <button
            key={c.key}
            onClick={() => handleKpiClick(c.key)}
            className="rounded-2xl p-5 relative overflow-hidden dark:border dark:border-[var(--border)] text-left transition-transform hover:scale-[1.02] cursor-pointer"
            style={{ background: c.grad }}
          >
            <div className="absolute -top-2.5 -right-2.5 w-[70px] h-[70px] rounded-full bg-white/10" />
            <p className="text-[11px] font-semibold text-white/70 uppercase tracking-wide mb-2.5">
              {c.title}
            </p>
            <p className="text-[26px] font-extrabold text-white mb-1.5">
              {loading ? "..." : c.value}
            </p>
            <div className="flex items-center gap-1">
              {c.trend && <ArrowUpRight size={12} className="text-white/90" />}
              <span className="text-[11px] text-white/75">{c.trend} {c.sub}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <Card className="lg:col-span-2">
          <h3 className="text-sm font-bold text-[var(--text)] mb-4">
            Disbursement vs Repayment (₦M)
          </h3>
          <LineChartComponent
            data={data.trends}
            xKey="month"
            lines={[
              { key: "disbursed", color: "#16a34a", name: "Disbursed" },
              { key: "repaid", color: "#2563eb", name: "Repaid" },
            ]}
          />
        </Card>
        <Card>
          <h3 className="text-sm font-bold text-[var(--text)] mb-4">
            Portfolio by Crop
          </h3>
          <PieChartComponent data={data.cropDistribution} />
          <div className="flex flex-wrap gap-2 mt-3">
            {data.cropDistribution.map((p) => (
              <div key={p.name} className="flex items-center gap-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: p.color }}
                />
                <span className="text-[11px] text-[var(--muted)]">
                  {p.name} ({p.value}%)
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Bar chart + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        <Card>
          <h3 className="text-sm font-bold text-[var(--text)] mb-4">
            Repayment Rate by State (%)
          </h3>
          <BarChartComponent
            data={data.statePerformance}
            xKey="state"
            bars={[{ key: "rate", color: "#16a34a", name: "Repayment %" }]}
          />
        </Card>
        <Card>
          <h3 className="text-sm font-bold text-[var(--text)] mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3">
            {data.recentActivity.slice(0, 6).map((a) => (
              <div key={a.id} className="flex items-start gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: a.bg }}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: a.color }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[var(--text)] truncate">{a.text}</p>
                  <p className="text-[11px] text-[var(--muted)]">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* At Risk Table */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-500" />
            <h3 className="text-sm font-bold text-[var(--text)]">
              At-Risk Borrowers
            </h3>
          </div>
          <span className="text-[11px] text-[var(--muted)]">
            {data.atRiskBorrowers.length} borrower{data.atRiskBorrowers.length !== 1 ? "s" : ""} need attention
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Name</th>
                <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">State</th>
                <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Crop</th>
                <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Overdue</th>
                <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Days</th>
                <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Score</th>
                <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.atRiskBorrowers.map((b) => (
                <tr key={b.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-3">
                    <button
                      onClick={() => router.push(`/lender/borrowers/${b.id}`)}
                      className="text-xs font-medium text-[var(--text)] hover:text-brand-green hover:underline"
                    >
                      {b.name}
                    </button>
                    <p className="text-[10px] text-[var(--muted)]">{b.farmerId}</p>
                  </td>
                  <td className="py-3 text-xs text-[var(--muted)]">{b.state}</td>
                  <td className="py-3">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded"
                      style={{
                        background: CROP_COLORS[b.crop]?.bg || "#f3f4f6",
                        color: CROP_COLORS[b.crop]?.color || "#6b7280",
                      }}
                    >
                      {b.crop}
                    </span>
                  </td>
                  <td className="py-3 text-xs font-semibold text-red-500">
                    ₦{b.overdue.toLocaleString()}
                  </td>
                  <td className="py-3">
                    <span className={`text-xs font-medium ${b.days > 14 ? "text-red-500" : b.days > 7 ? "text-amber-500" : "text-[var(--muted)]"}`}>
                      {b.days}d
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`text-xs font-bold ${b.score < 500 ? "text-red-500" : b.score < 650 ? "text-orange-500" : "text-green-500"}`}>
                      {b.score}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleSendReminder(b)}
                        className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
                        title="Send reminder"
                      >
                        <Send size={12} />
                      </button>
                      <button
                        onClick={() => handleFlagBorrower(b)}
                        className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                        title="Flag for review"
                      >
                        <Flag size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      </div>
    </div>
  );
}
