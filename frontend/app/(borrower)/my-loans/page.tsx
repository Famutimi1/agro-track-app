"use client";

import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/badge";
import { Check } from "lucide-react";

export default function MyLoansPage() {
  const repaymentSchedule = [
    { month: "Jan 2025", amount: "₦85,000", status: "Paid", date: "Jan 5" },
    { month: "Feb 2025", amount: "₦85,000", status: "Paid", date: "Feb 3" },
    { month: "Mar 2025", amount: "₦85,000", status: "Paid", date: "Mar 5" },
    { month: "Apr 2025", amount: "₦85,000", status: "Paid", date: "Apr 4" },
    { month: "May 2025", amount: "₦85,000", status: "Paid", date: "May 5" },
    { month: "Jun 2025", amount: "₦85,000", status: "Paid", date: "Jun 5" },
    { month: "Jul 2025", amount: "₦85,000", status: "Due", date: "Jul 5" },
    { month: "Aug 2025", amount: "₦85,000", status: "Upcoming", date: "Aug 5" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-[var(--text)] mb-1">My Loans</h1>
        <p className="text-[13px] text-[var(--muted)]">Your active and past loan details</p>
      </div>

      {/* Active Loan Card */}
      <Card className="mb-5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-green-500" />
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-[var(--text)]">CBN Rice Farmers Support Fund 2025</h2>
            <p className="text-xs text-[var(--muted)]">Central Bank of Nigeria</p>
          </div>
          <StatusPill status="Active" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-[10px] text-[var(--muted)] uppercase">Loan Amount</p>
            <p className="text-base font-bold text-[var(--text)]">₦850,000</p>
          </div>
          <div>
            <p className="text-[10px] text-[var(--muted)] uppercase">Disbursed</p>
            <p className="text-base font-bold text-[var(--text)]">₦850,000</p>
          </div>
          <div>
            <p className="text-[10px] text-[var(--muted)] uppercase">Repaid</p>
            <p className="text-base font-bold text-green-600">₦510,000</p>
          </div>
          <div>
            <p className="text-[10px] text-[var(--muted)] uppercase">Remaining</p>
            <p className="text-base font-bold text-orange-500">₦340,000</p>
          </div>
        </div>

        {/* Progress */}
        <div className="h-2 rounded-full bg-[var(--input-bg)] overflow-hidden">
          <div className="h-full rounded-full bg-green-500" style={{ width: "60%" }} />
        </div>
        <p className="text-[11px] text-[var(--muted)] mt-1.5">60% repaid · 4 months remaining</p>

        {/* Layers */}
        <div className="flex gap-2 mt-4">
          {[1, 2, 3].map((l) => (
            <div key={l} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-900/20">
              <Check size={12} className="text-green-600" />
              <span className="text-[11px] font-semibold text-green-700 dark:text-green-400">
                Layer {l} ✓
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Repayment Schedule */}
      <Card>
        <h3 className="text-sm font-bold text-[var(--text)] mb-4">Repayment Schedule</h3>
        <div className="space-y-2">
          {repaymentSchedule.map((r) => (
            <div key={r.month} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
              <div>
                <p className="text-xs font-medium text-[var(--text)]">{r.month}</p>
                <p className="text-[11px] text-[var(--muted)]">{r.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-[var(--text)]">{r.amount}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  r.status === "Paid" ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400" :
                  r.status === "Due" ? "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400" :
                  "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                }`}>
                  {r.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
