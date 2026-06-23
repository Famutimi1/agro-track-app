"use client";

import { ArrowUpRight, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/badge";
import { LineChartComponent } from "@/components/charts/line-chart";
import { BarChartComponent } from "@/components/charts/bar-chart";
import { PieChartComponent } from "@/components/charts/pie-chart";
import {
  disbursementData,
  stateData,
  portfolioPie,
  kpiCards,
  activities,
  atRiskBorrowers,
} from "@/lib/data/disbursements";
import { cropColors } from "@/lib/data/borrowers";

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-[var(--text)] mb-1">
          Good morning, Federal Ministry 👋
        </h1>
        <p className="text-[13px] text-[var(--muted)]">
          Friday, 13 June 2025 — Here&apos;s your portfolio at a glance
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3.5 mb-5">
        {kpiCards.map((c, i) => (
          <div
            key={i}
            className="rounded-2xl p-5 relative overflow-hidden dark:border dark:border-[var(--border)]"
            style={{ background: c.grad }}
          >
            <div className="absolute -top-2.5 -right-2.5 w-[70px] h-[70px] rounded-full bg-white/10" />
            <p className="text-[11px] font-semibold text-white/70 uppercase tracking-wide mb-2.5">
              {c.title}
            </p>
            <p className="text-[26px] font-extrabold text-white mb-1.5">
              {c.value}
            </p>
            <div className="flex items-center gap-1">
              <ArrowUpRight size={12} className="text-white/90" />
              <span className="text-[11px] text-white/75">{c.trend} {c.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <Card className="lg:col-span-2">
          <h3 className="text-sm font-bold text-[var(--text)] mb-4">
            Disbursement vs Repayment (₦M)
          </h3>
          <LineChartComponent
            data={disbursementData}
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
          <PieChartComponent data={portfolioPie} />
          <div className="flex flex-wrap gap-2 mt-3">
            {portfolioPie.map((p) => (
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
            data={stateData}
            xKey="state"
            bars={[{ key: "rate", color: "#16a34a", name: "Repayment %" }]}
          />
        </Card>
        <Card>
          <h3 className="text-sm font-bold text-[var(--text)] mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3">
            {activities.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
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
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={16} className="text-red-500" />
          <h3 className="text-sm font-bold text-[var(--text)]">
            At-Risk Borrowers
          </h3>
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
              </tr>
            </thead>
            <tbody>
              {atRiskBorrowers.map((b) => (
                <tr key={b.name} className="border-b border-[var(--border)] last:border-0">
                  <td className="py-3 text-xs font-medium text-[var(--text)]">{b.name}</td>
                  <td className="py-3 text-xs text-[var(--muted)]">{b.state}</td>
                  <td className="py-3">
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded"
                      style={{
                        background: cropColors[b.crop]?.bg || "#f3f4f6",
                        color: cropColors[b.crop]?.color || "#6b7280",
                      }}
                    >
                      {b.crop}
                    </span>
                  </td>
                  <td className="py-3 text-xs font-semibold text-red-500">{b.overdue}</td>
                  <td className="py-3 text-xs text-[var(--muted)]">{b.days}d</td>
                  <td className="py-3 text-xs font-bold text-orange-500">{b.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
