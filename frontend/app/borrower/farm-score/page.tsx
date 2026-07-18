"use client";

import { useRef } from "react";
import Link from "next/link";
import { Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScoreRing } from "@/components/ui/score-ring";
import { LineChartComponent } from "@/components/charts/line-chart";
import { useMyFarmScore, useFarmScoreBreakdown, useFarmScoreHistory, usePdfExport } from "@/lib/hooks";

const TIER_LABELS: Record<string, string> = {
  EXCELLENT: "Excellent Tier",
  GOOD: "Good Tier",
  FAIR: "Fair Tier",
  POOR: "Poor Tier",
  VERY_POOR: "Very Poor Tier",
};

function formatNaira(amount: number) {
  return `₦${Math.round(amount || 0).toLocaleString()}`;
}

export default function FarmScorePage() {
  const { data: current, isLoading: currentLoading } = useMyFarmScore();
  const score = current?.score ?? 0;
  const maxScore = current?.maxScore ?? 850;
  const { data: breakdown } = useFarmScoreBreakdown(score);
  const { data: history, isLoading: historyLoading } = useFarmScoreHistory();
  const { exportToPdf, exporting } = usePdfExport();
  const reportRef = useRef<HTMLDivElement>(null);

  const sortedHistory = [...(history || [])].sort(
    (a, b) => new Date(a.calculatedAt).getTime() - new Date(b.calculatedAt).getTime()
  );
  const latestComponents = sortedHistory[sortedHistory.length - 1]?.components;
  const scoreDelta =
    sortedHistory.length >= 2
      ? sortedHistory[sortedHistory.length - 1].score - sortedHistory[sortedHistory.length - 2].score
      : 0;

  const chartData = sortedHistory.map((h) => ({
    m: new Date(h.calculatedAt).toLocaleDateString("en-US", { month: "short" }),
    s: h.score,
  }));

  const componentRows = latestComponents
    ? [
        {
          label: "Repayment History",
          score: latestComponents.repaymentHistory.score,
          color: "#16a34a",
          sub: `${latestComponents.repaymentHistory.onTimePayments}/${latestComponents.repaymentHistory.totalPayments} payments on time`,
        },
        {
          label: "Farm Productivity",
          score: latestComponents.farmProductivity.score,
          color: "#2563eb",
          sub: `Avg health rating ${latestComponents.farmProductivity.avgHealthRating}/5 · ${latestComponents.farmProductivity.reportCount} verified reports`,
        },
        {
          label: "Credit Utilization",
          score: latestComponents.creditUtilization.score,
          color: "#7c3aed",
          sub: `${formatNaira(latestComponents.creditUtilization.totalRepaid)} repaid of ${formatNaira(
            latestComponents.creditUtilization.totalBorrowed
          )} borrowed`,
        },
        {
          label: "Farm Report Consistency",
          score: latestComponents.farmReportConsistency.score,
          color: "#d97706",
          sub: `${latestComponents.farmReportConsistency.reportsLast6Months} reports in last 6 months`,
        },
        {
          label: "Cooperative Membership",
          score: latestComponents.cooperativeMembership.score,
          color: "#0891b2",
          sub: latestComponents.cooperativeMembership.isMember
            ? `Member${
                latestComponents.cooperativeMembership.coopRepaymentRate
                  ? ` · ${latestComponents.cooperativeMembership.coopRepaymentRate}% coop repayment rate`
                  : ""
              }`
            : "Not a cooperative member",
        },
        {
          label: "Years of Experience",
          score: latestComponents.yearsOfExperience.score,
          color: "#be185d",
          sub: `${latestComponents.yearsOfExperience.years} years farming`,
        },
      ]
    : [];

  // Dynamic improvement tips: rank components by how much of their weight is unearned.
  const TIP_MAP: Record<string, { tip: string; href: string }> = {
    "Repayment History": { tip: "Pay your upcoming repayments on time to steadily raise this component.", href: "/borrower/loans" },
    "Farm Productivity": { tip: "Submit farm reports with clear crop photos so agents can verify healthy productivity.", href: "/borrower/farm-reports" },
    "Credit Utilization": { tip: "Repaying more of your outstanding balance improves your utilization score.", href: "/borrower/loans" },
    "Farm Report Consistency": { tip: "Submit a farm report every month to build a consistent activity history.", href: "/borrower/farm-reports" },
    "Cooperative Membership": { tip: "Join a registered cooperative to earn cooperative-standing points.", href: "/borrower/settings" },
    "Years of Experience": { tip: "This grows automatically the longer you farm on the platform.", href: "/borrower/farm-score" },
  };
  const perComponentMax = maxScore / (componentRows.length || 1);
  const improvementTips = [...componentRows]
    .sort((a, b) => a.score - b.score)
    .filter((c) => c.score < perComponentMax)
    .slice(0, 3)
    .map((c) => ({ label: c.label, ...TIP_MAP[c.label] }))
    .filter((t) => t.tip);

  const handleExport = () => {
    void exportToPdf(reportRef, {
      filename: `farmscore-${new Date().toISOString().slice(0, 10)}`,
      title: "AgroTrack FarmScore Report",
    });
  };

  return (
    <div ref={reportRef}>
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-bold text-[var(--text)] mb-1">FarmScore</h1>
          <p className="text-[13px] text-[var(--muted)]">
            Your agricultural credit score — portable and accepted by major lenders
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleExport}
          disabled={exporting || currentLoading}
          data-html2canvas-ignore
        >
          <Download size={14} className="mr-1.5" />
          {exporting ? "Exporting…" : "Download PDF"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Score */}
        <Card className="flex flex-col items-center justify-center py-8">
          {currentLoading ? (
            <p className="text-xs text-[var(--muted)]">Loading…</p>
          ) : (
            <>
              <ScoreRing score={score} size={160} maxScore={maxScore} />
              <p className="text-sm font-bold text-[var(--text)] mt-4">
                {TIER_LABELS[current?.tier || ""] || current?.tier || "—"}
              </p>
              {breakdown && (
                <p className="text-xs text-[var(--muted)]">Top {100 - breakdown.percentile}% of all borrowers</p>
              )}
              {scoreDelta !== 0 && (
                <p
                  className={`text-xs font-semibold mt-2 ${scoreDelta > 0 ? "text-green-600" : "text-red-500"}`}
                >
                  {scoreDelta > 0 ? "+" : ""}
                  {scoreDelta} pts since last update
                </p>
              )}
            </>
          )}
        </Card>

        {/* Breakdown */}
        <Card className="lg:col-span-2">
          <h3 className="text-sm font-bold text-[var(--text)] mb-4">Score Breakdown</h3>
          {componentRows.length > 0 ? (
            <div className="space-y-4">
              {componentRows.map((s) => (
                <div key={s.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-[var(--text)]">{s.label}</span>
                    <span className="text-xs font-bold text-[var(--text)]">{s.score}/{maxScore}</span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--input-bg)] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${Math.min((s.score / maxScore) * 100, 100)}%`, background: s.color }}
                    />
                  </div>
                  <p className="text-[11px] text-[var(--muted)] mt-1">{s.sub}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[var(--muted)] py-6 text-center">
              No detailed breakdown yet — your FarmScore is recalculated periodically as you build repayment
              and farm activity history.
            </p>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
        {/* History Chart */}
        <Card>
          <h3 className="text-sm font-bold text-[var(--text)] mb-4">Score History</h3>
          {historyLoading ? (
            <p className="text-xs text-[var(--muted)] py-10 text-center">Loading…</p>
          ) : chartData.length > 0 ? (
            <LineChartComponent
              data={chartData}
              xKey="m"
              lines={[{ key: "s", color: "#7c3aed", name: "FarmScore" }]}
              height={200}
            />
          ) : (
            <p className="text-xs text-[var(--muted)] py-10 text-center">No score history yet</p>
          )}
        </Card>

        {/* Tier benefits / path forward */}
        <Card>
          <h3 className="text-sm font-bold text-[var(--text)] mb-4">Your Tier Benefits</h3>
          {breakdown ? (
            <div className="space-y-3">
              {breakdown.tierBenefits.map((t, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-green-500 mt-0.5">•</span>
                  <p className="text-xs text-[var(--muted)] leading-relaxed">{t}</p>
                </div>
              ))}
              {breakdown.nextTierThreshold != null && (
                <p className="text-xs text-[var(--text)] font-semibold pt-2 border-t border-[var(--border)] mt-3">
                  {breakdown.pointsToNextTier} points to next tier ({breakdown.nextTierThreshold})
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-[var(--muted)] py-6 text-center">Loading…</p>
          )}
        </Card>
      </div>

      {/* Improvement tips */}
      {improvementTips.length > 0 && (
        <Card className="mt-5">
          <h3 className="text-sm font-bold text-[var(--text)] mb-4">How to Improve Your Score</h3>
          <div className="space-y-3">
            {improvementTips.map((t) => (
              <Link
                key={t.label}
                href={t.href}
                data-html2canvas-ignore
                className="flex items-start gap-3 p-3 rounded-xl border border-[var(--border)] hover:border-brand-green/50 transition-colors"
              >
                <span className="text-lg">💡</span>
                <div>
                  <p className="text-xs font-semibold text-[var(--text)]">{t.label}</p>
                  <p className="text-[11px] text-[var(--muted)] leading-relaxed">{t.tip}</p>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
