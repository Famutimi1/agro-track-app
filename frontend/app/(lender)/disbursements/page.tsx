"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

const disbursements = [
  { id: "DSB-4201", borrower: "Adaeze Okonkwo", program: "NIRSAL Cassava", amount: "₦180,000", layer: 2, status: "Pending", date: "Jun 12, 2025" },
  { id: "DSB-4198", borrower: "Bello Musa", program: "CBN Rice Fund", amount: "₦340,000", layer: 3, status: "Approved", date: "Jun 11, 2025" },
  { id: "DSB-4195", borrower: "Tunde Fashola", program: "Ekiti Youth Fund", amount: "₦150,000", layer: 1, status: "Pending", date: "Jun 10, 2025" },
  { id: "DSB-4190", borrower: "Amina Ibrahim", program: "BOA Smallholder", amount: "₦190,000", layer: 2, status: "Approved", date: "Jun 9, 2025" },
  { id: "DSB-4188", borrower: "Ngozi Eze", program: "USAID Vegetable", amount: "₦90,000", layer: 2, status: "Pending", date: "Jun 8, 2025" },
  { id: "DSB-4183", borrower: "Musa Garba", program: "Kebbi Irrigation", amount: "₦250,000", layer: 2, status: "Rejected", date: "Jun 7, 2025" },
  { id: "DSB-4180", borrower: "Grace Adeleke", program: "NIRSAL Cassava", amount: "₦120,000", layer: 1, status: "Approved", date: "Jun 6, 2025" },
];

export default function DisbursementsPage() {
  const [filter, setFilter] = useState("All");

  const filtered = filter === "All"
    ? disbursements
    : disbursements.filter((d) => d.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-[var(--text)] mb-1">Disbursements</h1>
          <p className="text-[13px] text-[var(--muted)]">
            Manage and approve loan disbursement requests
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-5">
        {["All", "Pending", "Approved", "Rejected"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              filter === s
                ? "bg-brand-green text-white"
                : "bg-[var(--input-bg)] text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">ID</th>
              <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Borrower</th>
              <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Program</th>
              <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Amount</th>
              <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Layer</th>
              <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Status</th>
              <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Date</th>
              <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => (
              <tr key={d.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--input-bg)] transition-colors">
                <td className="py-3 text-xs font-mono text-[var(--muted)]">{d.id}</td>
                <td className="py-3 text-xs font-medium text-[var(--text)]">{d.borrower}</td>
                <td className="py-3 text-xs text-[var(--muted)]">{d.program}</td>
                <td className="py-3 text-xs font-semibold text-[var(--text)]">{d.amount}</td>
                <td className="py-3">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                    Layer {d.layer}
                  </span>
                </td>
                <td className="py-3"><StatusPill status={d.status} /></td>
                <td className="py-3 text-xs text-[var(--muted)]">{d.date}</td>
                <td className="py-3">
                  {d.status === "Pending" && (
                    <div className="flex gap-1">
                      <button className="w-6 h-6 rounded bg-green-50 text-green-600 flex items-center justify-center cursor-pointer hover:bg-green-100">
                        <Check size={12} />
                      </button>
                      <button className="w-6 h-6 rounded bg-red-50 text-red-600 flex items-center justify-center cursor-pointer hover:bg-red-100">
                        <X size={12} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
