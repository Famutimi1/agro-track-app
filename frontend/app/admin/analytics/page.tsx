"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { LineChartComponent } from "@/components/charts/line-chart";
import { AreaChartComponent } from "@/components/charts/area-chart";
import { adminApi, type GrowthPoint } from "@/lib/api";
import { AxiosError } from "axios";

export default function AnalyticsPage() {
  const [data, setData] = useState<GrowthPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const growth = await adminApi.getGrowthAnalytics(12);
        setData(growth);
      } catch (err) {
        const axiosError = err as AxiosError<{ message?: string }>;
        setError(axiosError.response?.data?.message || "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-extrabold text-[var(--text)] mb-1">Platform Analytics</h1>
        <p className="text-[13px] text-[var(--muted)]">Performance metrics and growth trends</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-brand-green" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card>
            <h3 className="text-sm font-bold text-[var(--text)] mb-4">Lender Growth</h3>
            <AreaChartComponent
              data={data}
              xKey="m"
              areas={[{ key: "lenders", color: "#16a34a", name: "Lenders" }]}
            />
          </Card>
          <Card>
            <h3 className="text-sm font-bold text-[var(--text)] mb-4">Revenue Growth (₦)</h3>
            <AreaChartComponent
              data={data}
              xKey="m"
              areas={[{ key: "revenue", color: "#F9A825", name: "Revenue" }]}
            />
          </Card>
          <Card>
            <h3 className="text-sm font-bold text-[var(--text)] mb-4">Farmer Registrations</h3>
            <LineChartComponent
              data={data}
              xKey="m"
              lines={[{ key: "farmers", color: "#2563eb", name: "Farmers" }]}
            />
          </Card>
          <Card>
            <h3 className="text-sm font-bold text-[var(--text)] mb-4">Loans Disbursed</h3>
            <LineChartComponent
              data={data}
              xKey="m"
              lines={[{ key: "loans", color: "#7c3aed", name: "Loans" }]}
            />
          </Card>
        </div>
      )}
    </div>
  );
}
