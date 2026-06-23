"use client";

import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/badge";
import { tickets } from "@/lib/data/admin-data";

export default function SupportTicketsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-extrabold text-[var(--text)] mb-1">Support Tickets</h1>
        <p className="text-[13px] text-[var(--muted)]">
          {tickets.length} tickets · {tickets.filter(t => t.status === "Open" || t.status === "Escalated").length} require attention
        </p>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">ID</th>
              <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Lender</th>
              <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Subject</th>
              <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Priority</th>
              <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Status</th>
              <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Created</th>
              <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Assigned</th>
            </tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--input-bg)] transition-colors">
                <td className="py-3 text-xs font-mono text-[var(--muted)]">{t.id}</td>
                <td className="py-3 text-xs font-medium text-[var(--text)]">{t.lender}</td>
                <td className="py-3 text-xs text-[var(--text)] max-w-[250px] truncate">{t.subject}</td>
                <td className="py-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    t.priority === "High" ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400" :
                    t.priority === "Medium" ? "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400" :
                    "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                  }`}>
                    {t.priority}
                  </span>
                </td>
                <td className="py-3"><StatusPill status={t.status} /></td>
                <td className="py-3 text-xs text-[var(--muted)]">{t.created}</td>
                <td className="py-3 text-xs text-[var(--muted)]">{t.assigned}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
