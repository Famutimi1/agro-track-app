"use client";

import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/badge";
import { systemHealth } from "@/lib/data/admin-data";

export default function SystemHealthPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-extrabold text-[var(--text)] mb-1">
          System Health
        </h1>
        <p className="text-[13px] text-[var(--muted)]">
          Real-time status of all AgroTrack services
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {systemHealth.map((s) => (
          <Card key={s.name}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{s.icon}</span>
              <StatusPill status={s.status} />
            </div>
            <h3 className="text-sm font-bold text-[var(--text)] mb-2">{s.name}</h3>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-[10px] text-[var(--muted)] uppercase">Uptime</p>
                <p className="text-xs font-bold text-green-600">{s.uptime}</p>
              </div>
              <div>
                <p className="text-[10px] text-[var(--muted)] uppercase">Latency</p>
                <p className="text-xs font-bold text-[var(--text)]">{s.latency}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
