"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, Compass, Landmark, MessageCircle, MapPin, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScoreRing } from "@/components/ui/score-ring";
import { Button } from "@/components/ui/button";
import { LineChartComponent } from "@/components/charts/line-chart";
import { BarChartComponent } from "@/components/charts/bar-chart";
import { RepaymentModal } from "@/components/borrower/repayment-modal";
import { useAuthStore } from "@/lib/stores";
import {
  useMyLoans,
  useMyFarmScore,
  useFarmScoreHistory,
  useMyFarmReports,
  useUnreadCount,
  useMyBorrowerProfile,
  useDiscoverPrograms,
} from "@/lib/hooks";
import { computeProgramMatch } from "@/lib/utils";

function formatNaira(amount: number) {
  return `₦${Math.round(amount).toLocaleString()}`;
}

const TIER_STYLES: Record<string, { label: string; className: string }> = {
  EXCELLENT: { label: "Excellent", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  GOOD: { label: "Good", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  FAIR: { label: "Fair", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  POOR: { label: "Poor", className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
  VERY_POOR: { label: "Very Poor", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

function tierStyle(tier?: string) {
  return (tier && TIER_STYLES[tier]) || { label: tier || "—", className: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" };
}

function formatMonth(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short" });
}

function timeAgo(dateStr: string) {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function BorrowerOverviewPage() {
  const user = useAuthStore((s) => s.user);
  const firstName = user?.firstName || "there";

  const { data: loansData, isLoading: loansLoading } = useMyLoans();
  const { data: scoreData, isLoading: scoreLoading } = useMyFarmScore();
  const { data: scoreHistory, isLoading: scoreHistoryLoading } = useFarmScoreHistory();
  const { data: reportsData } = useMyFarmReports();
  const { data: unreadMessages } = useUnreadCount();
  const { data: profile } = useMyBorrowerProfile();
  const { data: programsData } = useDiscoverPrograms();

  const [payingRepayment, setPayingRepayment] = useState<{ id: string; amount: number } | null>(null);

  const eligiblePrograms = [...(programsData?.data || [])]
    .map((p) => ({ program: p, match: computeProgramMatch(p, profile) }))
    .sort((a, b) => b.match - a.match)
    .slice(0, 3);

  const loans = loansData?.data || [];
  const activeLoans = loans.filter((l: any) => l.status === "ACTIVE");
  const reports = reportsData?.data || [];

  const activeLoanTotal = activeLoans.reduce((sum: number, l: any) => sum + (l.outstandingBalance ?? 0), 0);
  const totalRepaid = loans.reduce((sum: number, l: any) => sum + (l.totalRepaid ?? 0), 0);

  const upcomingPayments = loans
    .filter((l: any) => l.nextPaymentAmount != null)
    .sort((a: any, b: any) => new Date(a.nextPaymentDue).getTime() - new Date(b.nextPaymentDue).getTime());
  const nextPayment = upcomingPayments[0];

  // Find the earliest unpaid repayment on the loan with the soonest next payment, for the Pay Now CTA.
  const nextRepayment = nextPayment
    ? [...(nextPayment.repayments || [])]
        .filter((r: any) => r.status !== "PAID")
        .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0]
    : null;

  const score = scoreData?.score ?? 0;
  const tier = scoreData?.tier ?? "—";
  const sortedHistory = [...(scoreHistory || [])].sort(
    (a, b) => new Date(a.calculatedAt).getTime() - new Date(b.calculatedAt).getTime()
  );
  const scoreDelta =
    sortedHistory.length >= 2
      ? sortedHistory[sortedHistory.length - 1].score - sortedHistory[sortedHistory.length - 2].score
      : 0;

  const kpis = [
    {
      label: "Active Loan",
      value: loansLoading ? "—" : formatNaira(activeLoanTotal),
      sub: activeLoans[0]?.program?.name || "No active loan",
      color: "#16a34a",
    },
    {
      label: "Total Repaid",
      value: loansLoading ? "—" : formatNaira(totalRepaid),
      sub: loans.length > 0 ? `${loans.length} loan${loans.length === 1 ? "" : "s"}` : "No loans yet",
      color: "#2563eb",
    },
    {
      label: "Next Payment",
      value: nextPayment ? formatNaira(nextPayment.nextPaymentAmount ?? 0) : "—",
      sub: nextPayment?.nextPaymentDue
        ? `Due ${new Date(nextPayment.nextPaymentDue).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
        : "None scheduled",
      color: "#d97706",
    },
    {
      label: "FarmScore",
      value: scoreLoading ? "—" : String(score),
      sub: scoreDelta !== 0 ? `${scoreDelta > 0 ? "+" : ""}${scoreDelta} this period` : tier,
      color: "#7c3aed",
    },
  ];

  const loanHistory = loans.map((l: any) => ({
    month: l.program?.name?.slice(0, 8) || "Loan",
    disbursed: Math.round((l.totalDisbursed ?? 0) / 1000),
    repaid: Math.round((l.totalRepaid ?? 0) / 1000),
  }));

  const scoreHistoryChart = sortedHistory.map((h) => ({
    m: formatMonth(h.calculatedAt),
    s: h.score,
  }));

  const activities = [
    ...reports.slice(0, 3).map((r: any) => ({
      icon: r.status === "VERIFIED" ? "✅" : r.status === "REJECTED" ? "❌" : "📝",
      bg: r.status === "VERIFIED" ? "#16a34a22" : r.status === "REJECTED" ? "#ef444422" : "#d9770622",
      text: `Farm report "${r.title}" ${r.status.toLowerCase()}`,
      time: timeAgo(r.createdAt),
      date: r.createdAt,
    })),
    ...sortedHistory.slice(-3).map((h) => ({
      icon: "📊",
      bg: "#7c3aed22",
      text: `FarmScore updated to ${h.score}`,
      time: timeAgo(h.calculatedAt),
      date: h.calculatedAt,
    })),
    ...loans.slice(0, 2).map((l: any) => ({
      icon: "💰",
      bg: "#2563eb22",
      text: `Loan "${l.program?.name || "loan"}" — ${l.status.toLowerCase()}`,
      time: timeAgo(l.createdAt),
      date: l.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-[var(--text)] mb-1">
          Welcome back, {firstName} 👋
        </h1>
        <p className="text-[13px] text-[var(--muted)]">
          Here&apos;s your farming finance at a glance
        </p>
      </div>

      {/* Next Payment / Browse CTA */}
      {nextPayment && nextRepayment ? (
        <Card className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-l-4 border-l-amber-500">
          <div>
            <p className="text-[11px] text-[var(--muted)] uppercase font-semibold">Next Payment Due</p>
            <p className="text-xl font-extrabold text-[var(--text)]">
              {formatNaira(nextPayment.nextPaymentAmount ?? 0)}
            </p>
            <p className="text-xs text-[var(--muted)]">
              {nextPayment.program?.name ? `${nextPayment.program.name} · ` : ""}
              {nextPayment.nextPaymentDue
                ? `Due ${new Date(nextPayment.nextPaymentDue).toLocaleDateString("en-US", { month: "long", day: "numeric" })}`
                : ""}
            </p>
          </div>
          <Button onClick={() => setPayingRepayment({ id: nextRepayment.id, amount: nextRepayment.amount })}>
            Pay Now
          </Button>
        </Card>
      ) : !loansLoading && activeLoans.length === 0 ? (
        <Card className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-l-4 border-l-green-500">
          <div>
            <p className="text-sm font-bold text-[var(--text)]">No active loan yet</p>
            <p className="text-xs text-[var(--muted)]">Explore loan and grant programs you may qualify for.</p>
          </div>
          <Link href="/borrower/discover">
            <Button variant="secondary">Browse Programs</Button>
          </Link>
        </Card>
      ) : null}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        {[
          { label: "Submit Farm Report", href: "/borrower/farm-reports", icon: FileText, color: "#16a34a" },
          { label: "Browse Programs", href: "/borrower/discover", icon: Compass, color: "#2563eb" },
          { label: "View My Loans", href: "/borrower/loans", icon: Landmark, color: "#d97706" },
          {
            label: "Messages",
            href: "/borrower/messages",
            icon: MessageCircle,
            color: "#7c3aed",
            badge: unreadMessages && unreadMessages > 0 ? unreadMessages : undefined,
          },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <Link key={action.label} href={action.href}>
              <Card className="relative flex items-center gap-3 hover:shadow-md transition-shadow cursor-pointer">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${action.color}1a` }}
                >
                  <Icon size={18} style={{ color: action.color }} />
                </div>
                <p className="text-xs font-semibold text-[var(--text)]">{action.label}</p>
                {action.badge != null && (
                  <span className="absolute top-2 right-2 text-[10px] font-bold bg-brand-green text-white rounded-full px-1.5 py-0.5">
                    {action.badge}
                  </span>
                )}
              </Card>
            </Link>
          );
        })}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-5">
        {kpis.map((k) => (
          <Card key={k.label} className="relative overflow-hidden">
            <div
              className="absolute top-0 left-0 w-1 h-full"
              style={{ background: k.color }}
            />
            <p className="text-[11px] text-[var(--muted)] uppercase font-semibold mb-1">
              {k.label}
            </p>
            <p className="text-xl font-extrabold text-[var(--text)]">{k.value}</p>
            <p className="text-[11px] text-[var(--muted)]">{k.sub}</p>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <Card className="lg:col-span-2">
          <h3 className="text-sm font-bold text-[var(--text)] mb-4">
            Loan History (₦K)
          </h3>
          {loanHistory.length > 0 ? (
            <BarChartComponent
              data={loanHistory}
              xKey="month"
              bars={[
                { key: "disbursed", color: "#16a34a", name: "Disbursed" },
                { key: "repaid", color: "#2563eb", name: "Repaid" },
              ]}
            />
          ) : (
            <p className="text-xs text-[var(--muted)] py-10 text-center">
              No loans yet
            </p>
          )}
        </Card>
        <Link href="/borrower/farm-score" className="block">
          <Card className="flex flex-col items-center justify-center h-full hover:shadow-md transition-shadow cursor-pointer">
            <h3 className="text-sm font-bold text-[var(--text)] mb-4">FarmScore</h3>
            <ScoreRing score={score} size={120} maxScore={scoreData?.maxScore ?? 850} />
            <span className={`mt-3 text-[11px] font-bold px-2.5 py-1 rounded-full ${tierStyle(scoreData?.tier).className}`}>
              {tierStyle(scoreData?.tier).label}
            </span>
          </Card>
        </Link>
      </div>

      {/* Score History + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="text-sm font-bold text-[var(--text)] mb-4">
            Score History
          </h3>
          {scoreHistoryLoading ? (
            <p className="text-xs text-[var(--muted)] py-10 text-center">Loading…</p>
          ) : scoreHistoryChart.length > 0 ? (
            <LineChartComponent
              data={scoreHistoryChart}
              xKey="m"
              lines={[{ key: "s", color: "#7c3aed", name: "FarmScore" }]}
              height={180}
            />
          ) : (
            <p className="text-xs text-[var(--muted)] py-10 text-center">
              No score history yet
            </p>
          )}
        </Card>
        <Card>
          <h3 className="text-sm font-bold text-[var(--text)] mb-4">
            Recent Activity
          </h3>
          {activities.length > 0 ? (
            <div className="space-y-3">
              {activities.map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm"
                    style={{ background: a.bg }}
                  >
                    {a.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[var(--text)]">{a.text}</p>
                    <p className="text-[11px] text-[var(--muted)]">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[var(--muted)] py-6 text-center">
              No recent activity
            </p>
          )}
        </Card>
      </div>

      {/* Farm Summary + Eligible Programmes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[var(--text)]">My Farm</h3>
            <Link href="/borrower/settings" className="text-xs text-brand-green hover:underline">
              Update
            </Link>
          </div>
          {profile ? (
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                  <MapPin size={16} className="text-brand-green" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[var(--text)]">
                    {profile.farmAddress || `${profile.lga || ""}${profile.lga && profile.state ? ", " : ""}${profile.state || ""}` || "Location not set"}
                  </p>
                  <p className="text-[11px] text-[var(--muted)]">
                    {profile.farmLatitude != null && profile.farmLongitude != null
                      ? `GPS: ${profile.farmLatitude.toFixed(4)}, ${profile.farmLongitude.toFixed(4)}`
                      : "GPS not captured yet"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--border)]">
                <div>
                  <p className="text-[10px] text-[var(--muted)] uppercase">Farm Size</p>
                  <p className="text-sm font-bold text-[var(--text)]">{profile.farmSizeHa} ha</p>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--muted)] uppercase">Primary Crop</p>
                  <p className="text-sm font-bold text-[var(--text)]">{profile.primaryCrop || "—"}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[var(--muted)] py-6 text-center">Loading…</p>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[var(--text)]">Programs for You</h3>
            <Link href="/borrower/discover" className="text-xs text-brand-green hover:underline flex items-center gap-0.5">
              View All <ChevronRight size={12} />
            </Link>
          </div>
          {eligiblePrograms.length > 0 ? (
            <div className="space-y-2.5">
              {eligiblePrograms.map(({ program: p, match }) => (
                <Link
                  key={p.id}
                  href={`/borrower/applications/new?programId=${p.id}`}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-[var(--border)] hover:border-brand-green/50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[var(--text)] truncate">{p.name}</p>
                    <p className="text-[11px] text-[var(--muted)] truncate">
                      {p.lenderOrg?.name || "Lender"} · {p.interestRate}% interest
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 flex-shrink-0">
                    {match}% match
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[var(--muted)] py-6 text-center">No eligible programs right now</p>
          )}
        </Card>
      </div>

      {payingRepayment && (
        <RepaymentModal
          open={!!payingRepayment}
          onClose={() => setPayingRepayment(null)}
          repaymentId={payingRepayment.id}
          amount={payingRepayment.amount}
        />
      )}
    </div>
  );
}
