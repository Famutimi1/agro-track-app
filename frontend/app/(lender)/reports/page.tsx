"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText, BarChart2, Users, Map } from "lucide-react";

const reports = [
  { title: "Portfolio Summary", desc: "Overview of all active loans, repayments, and default rates", icon: BarChart2, color: "#16a34a" },
  { title: "Borrower Report", desc: "Detailed breakdown of borrower demographics and performance", icon: Users, color: "#2563eb" },
  { title: "State Analysis", desc: "Performance metrics broken down by state and LGA", icon: Map, color: "#7c3aed" },
  { title: "Disbursement Log", desc: "Complete history of all disbursement transactions", icon: FileText, color: "#d97706" },
  { title: "Repayment Trends", desc: "Monthly repayment patterns and forecasting", icon: BarChart2, color: "#0891b2" },
  { title: "Risk Assessment", desc: "At-risk borrower analysis with default probability", icon: FileText, color: "#dc2626" },
];

export default function ReportsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-[var(--text)] mb-1">Reports</h1>
        <p className="text-[13px] text-[var(--muted)]">
          Generate and download portfolio reports
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reports.map((r) => {
          const Icon = r.icon;
          return (
            <Card key={r.title}>
              <div className="flex items-start gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${r.color}15` }}
                >
                  <Icon size={18} style={{ color: r.color }} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-[var(--text)]">{r.title}</h3>
                  <p className="text-[11px] text-[var(--muted)]">{r.desc}</p>
                </div>
              </div>
              <Button variant="secondary" size="sm" className="w-full">
                <Download size={13} /> Generate Report
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
