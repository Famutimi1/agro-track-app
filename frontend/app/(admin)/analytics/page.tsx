"use client";

import { Card } from "@/components/ui/card";
import { LineChartComponent } from "@/components/charts/line-chart";
import { AreaChartComponent } from "@/components/charts/area-chart";
import { growthData } from "@/lib/data/admin-data";

export default function AnalyticsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-extrabold text-[var(--text)] mb-1">Platform Analytics</h1>
        <p className="text-[13px] text-[var(--muted)]">
          Performance metrics and growth trends
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card>
          <h3 className="text-sm font-bold text-[var(--text)] mb-4">Lender Growth</h3>
          <AreaChartComponent
            data={growthData}
            xKey="m"
            areas={[{ key: "lenders", color: "#16a34a", name: "Lenders" }]}
          />
        </Card>
        <Card>
          <h3 className="text-sm font-bold text-[var(--text)] mb-4">Revenue Growth (₦M)</h3>
          <AreaChartComponent
            data={growthData}
            xKey="m"
            areas={[{ key: "revenue", color: "#F9A825", name: "Revenue" }]}
          />
        </Card>
        <Card>
          <h3 className="text-sm font-bold text-[var(--text)] mb-4">Farmer Registrations</h3>
          <LineChartComponent
            data={growthData}
            xKey="m"
            lines={[{ key: "farmers", color: "#2563eb", name: "Farmers" }]}
          />
        </Card>
        <Card>
          <h3 className="text-sm font-bold text-[var(--text)] mb-4">All Metrics</h3>
          <LineChartComponent
            data={growthData}
            xKey="m"
            lines={[
              { key: "lenders", color: "#16a34a", name: "Lenders" },
              { key: "revenue", color: "#F9A825", name: "Revenue" },
            ]}
          />
        </Card>
      </div>
    </div>
  );
}
