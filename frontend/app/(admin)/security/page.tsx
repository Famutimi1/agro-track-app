"use client";

import { Card } from "@/components/ui/card";
import { Shield, AlertTriangle } from "lucide-react";

const auditLogs = [
  { action: "Login", user: "admin@agrotrack.ng", ip: "102.89.xx.xx", time: "2 min ago", level: "info" },
  { action: "Feature flag toggled: AI Default Prediction", user: "admin@agrotrack.ng", ip: "102.89.xx.xx", time: "15 min ago", level: "warning" },
  { action: "Lender account suspended: Kebbi State Govt", user: "admin@agrotrack.ng", ip: "102.89.xx.xx", time: "1 hr ago", level: "critical" },
  { action: "Database backup completed", user: "system", ip: "—", time: "2 hr ago", level: "info" },
  { action: "API rate limit hit: FarmScore endpoint", user: "LND-005", ip: "41.203.xx.xx", time: "3 hr ago", level: "warning" },
  { action: "New admin session from unknown IP", user: "admin@agrotrack.ng", ip: "154.113.xx.xx", time: "5 hr ago", level: "warning" },
  { action: "SSL certificate renewed", user: "system", ip: "—", time: "1 day ago", level: "info" },
];

export default function SecurityPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-extrabold text-[var(--text)] mb-1">Security & Audit</h1>
        <p className="text-[13px] text-[var(--muted)]">Audit trail and security events</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <Card className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
            <Shield size={18} className="text-green-600" />
          </div>
          <div>
            <p className="text-xs text-[var(--muted)]">Security Status</p>
            <p className="text-sm font-bold text-green-600">All Clear</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center">
            <AlertTriangle size={18} className="text-yellow-600" />
          </div>
          <div>
            <p className="text-xs text-[var(--muted)]">Warnings (24h)</p>
            <p className="text-sm font-bold text-yellow-600">3</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
            <Shield size={18} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-[var(--muted)]">Active Sessions</p>
            <p className="text-sm font-bold text-blue-600">2</p>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-sm font-bold text-[var(--text)] mb-4">Audit Log</h3>
        <div className="space-y-0">
          {auditLogs.map((log, i) => (
            <div key={i} className="flex items-center gap-3 py-3 border-b border-[var(--border)] last:border-0">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                log.level === "critical" ? "bg-red-500" :
                log.level === "warning" ? "bg-yellow-500" : "bg-green-500"
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[var(--text)]">{log.action}</p>
                <p className="text-[11px] text-[var(--muted)]">{log.user} · {log.ip}</p>
              </div>
              <span className="text-[11px] text-[var(--muted)] flex-shrink-0">{log.time}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
