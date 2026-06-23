"use client";

import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/badge";

const repayments = [
  { id: "RPY-8901", borrower: "Bello Musa", amount: "₦85,000", method: "Bank Transfer", date: "Jun 12", status: "Confirmed", program: "CBN Rice Fund" },
  { id: "RPY-8898", borrower: "Amina Ibrahim", amount: "₦47,500", method: "USSD", date: "Jun 11", status: "Confirmed", program: "BOA Smallholder" },
  { id: "RPY-8895", borrower: "Hajiya Fatima", amount: "₦100,000", method: "Bank Transfer", date: "Jun 10", status: "Confirmed", program: "CBN Rice Fund" },
  { id: "RPY-8890", borrower: "Adaeze Okonkwo", amount: "₦45,000", method: "Mobile Money", date: "Jun 9", status: "Confirmed", program: "NIRSAL Cassava" },
  { id: "RPY-8887", borrower: "Tunde Fashola", amount: "₦25,000", method: "Bank Transfer", date: "Jun 8", status: "Pending", program: "Ekiti Youth Fund" },
  { id: "RPY-8883", borrower: "Ngozi Eze", amount: "₦15,000", method: "USSD", date: "Jun 7", status: "Confirmed", program: "USAID Vegetable" },
];

export default function RepaymentsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-[var(--text)] mb-1">Repayments</h1>
        <p className="text-[13px] text-[var(--muted)]">
          Track repayment activity across all programs
        </p>
      </div>

      <Card className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">ID</th>
              <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Borrower</th>
              <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Program</th>
              <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Amount</th>
              <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Method</th>
              <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Date</th>
              <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody>
            {repayments.map((r) => (
              <tr key={r.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--input-bg)] transition-colors">
                <td className="py-3 text-xs font-mono text-[var(--muted)]">{r.id}</td>
                <td className="py-3 text-xs font-medium text-[var(--text)]">{r.borrower}</td>
                <td className="py-3 text-xs text-[var(--muted)]">{r.program}</td>
                <td className="py-3 text-xs font-semibold text-green-600">{r.amount}</td>
                <td className="py-3 text-xs text-[var(--muted)]">{r.method}</td>
                <td className="py-3 text-xs text-[var(--muted)]">{r.date}</td>
                <td className="py-3"><StatusPill status={r.status === "Confirmed" ? "Active" : "Pending"} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
