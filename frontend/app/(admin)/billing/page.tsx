"use client";

import { Card } from "@/components/ui/card";
import { PieChartComponent } from "@/components/charts/pie-chart";
import { revenueBreakdown } from "@/lib/data/admin-data";

export default function BillingPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-extrabold text-[var(--text)] mb-1">Billing & Revenue</h1>
        <p className="text-[13px] text-[var(--muted)]">Platform revenue and billing overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        {[
          { label: "MRR", value: "₦142M", trend: "+18%", color: "#16a34a" },
          { label: "ARR", value: "₦1.7B", trend: "+24%", color: "#2563eb" },
          { label: "Avg Revenue/Lender", value: "₦575K", trend: "+8%", color: "#7c3aed" },
        ].map((m) => (
          <Card key={m.label}>
            <p className="text-[11px] text-[var(--muted)] uppercase font-semibold mb-1">{m.label}</p>
            <p className="text-2xl font-extrabold text-[var(--text)]">{m.value}</p>
            <p className="text-xs font-semibold mt-1" style={{ color: m.color }}>{m.trend} vs last month</p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <h3 className="text-sm font-bold text-[var(--text)] mb-4">Revenue Breakdown</h3>
          <PieChartComponent data={revenueBreakdown} size={220} />
          <div className="space-y-2 mt-4">
            {revenueBreakdown.map((r) => (
              <div key={r.name} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: r.color }} />
                <span className="text-xs text-[var(--muted)] flex-1">{r.name}</span>
                <span className="text-xs font-bold text-[var(--text)]">{r.value}%</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h3 className="text-sm font-bold text-[var(--text)] mb-4">Plan Distribution</h3>
          <div className="space-y-4">
            {[
              { plan: "Enterprise", count: 12, revenue: "₦96M", pct: 68 },
              { plan: "Growth", count: 89, revenue: "₦35M", pct: 25 },
              { plan: "Starter", count: 146, revenue: "₦11M", pct: 7 },
            ].map((p) => (
              <div key={p.plan}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-[var(--text)]">{p.plan}</span>
                  <span className="text-xs text-[var(--muted)]">{p.count} lenders · {p.revenue}/mo</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--input-bg)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand-green"
                    style={{ width: `${p.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
