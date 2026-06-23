"use client";

import { Card } from "@/components/ui/card";
import { ScoreRing } from "@/components/ui/score-ring";
import { LineChartComponent } from "@/components/charts/line-chart";
import { BarChartComponent } from "@/components/charts/bar-chart";
import { loanHistory, scoreHistory, borrowerActivities } from "@/lib/data/borrower-data";

export default function BorrowerOverviewPage() {
  const kpis = [
    { label: "Active Loan", value: "₦850,000", sub: "CBN Rice Fund", color: "#16a34a" },
    { label: "Total Repaid", value: "₦510,000", sub: "60% of total", color: "#2563eb" },
    { label: "Next Payment", value: "₦85,000", sub: "Due Jul 5", color: "#d97706" },
    { label: "FarmScore", value: "815", sub: "+40 this month", color: "#7c3aed" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-[var(--text)] mb-1">
          Welcome back, Bello 👋
        </h1>
        <p className="text-[13px] text-[var(--muted)]">
          Here&apos;s your farming finance at a glance
        </p>
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
          <BarChartComponent
            data={loanHistory}
            xKey="month"
            bars={[
              { key: "disbursed", color: "#16a34a", name: "Disbursed" },
              { key: "repaid", color: "#2563eb", name: "Repaid" },
            ]}
          />
        </Card>
        <Card className="flex flex-col items-center justify-center">
          <h3 className="text-sm font-bold text-[var(--text)] mb-4">FarmScore</h3>
          <ScoreRing score={815} size={120} />
          <p className="text-xs text-[var(--muted)] mt-3">
            Platinum Tier — Top 5%
          </p>
        </Card>
      </div>

      {/* Score History + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <h3 className="text-sm font-bold text-[var(--text)] mb-4">
            Score History
          </h3>
          <LineChartComponent
            data={scoreHistory}
            xKey="m"
            lines={[{ key: "s", color: "#7c3aed", name: "FarmScore" }]}
            height={180}
          />
        </Card>
        <Card>
          <h3 className="text-sm font-bold text-[var(--text)] mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3">
            {borrowerActivities.map((a, i) => (
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
        </Card>
      </div>
    </div>
  );
}
