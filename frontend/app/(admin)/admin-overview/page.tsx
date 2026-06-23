"use client";

import { ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { LineChartComponent } from "@/components/charts/line-chart";
import { PieChartComponent } from "@/components/charts/pie-chart";
import { platformMetrics, growthData, revenueBreakdown } from "@/lib/data/admin-data";

export default function AdminOverviewPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-extrabold text-[var(--text)] mb-1">
          Platform Overview
        </h1>
        <p className="text-[13px] text-[var(--muted)]">
          Friday, 13 Jun 2025 · All systems nominal · Last sync 2 min ago
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mb-5">
        {platformMetrics.map((m, i) => (
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
            <div className="flex items-center gap-1">
              <ArrowUpRight size={12} className="text-white/90" />
              <span className="text-[11px] text-white/75">{m.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <Card className="lg:col-span-2">
          <h3 className="text-sm font-bold text-[var(--text)] mb-4">
            Platform Growth
          </h3>
          <LineChartComponent
            data={growthData}
            xKey="m"
            lines={[
              { key: "lenders", color: "#16a34a", name: "Lenders" },
              { key: "revenue", color: "#F9A825", name: "Revenue (₦M)" },
            ]}
          />
        </Card>
        <Card>
          <h3 className="text-sm font-bold text-[var(--text)] mb-4">
            Revenue Breakdown
          </h3>
          <PieChartComponent data={revenueBreakdown} />
          <div className="space-y-2 mt-3">
            {revenueBreakdown.map((r) => (
              <div key={r.name} className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: r.color }}
                />
                <span className="text-[11px] text-[var(--muted)] flex-1">{r.name}</span>
                <span className="text-[11px] font-bold text-[var(--text)]">{r.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
