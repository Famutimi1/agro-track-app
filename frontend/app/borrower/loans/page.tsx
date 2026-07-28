"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/badge";
import { Landmark, ChevronRight } from "lucide-react";
import { useMyLoans } from "@/lib/hooks";

function formatNaira(amount: number) {
  return `₦${Math.round(amount || 0).toLocaleString()}`;
}

function titleCase(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export default function MyLoansPage() {
  const { data, isLoading } = useMyLoans();
  const loans = data?.data || [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-[var(--text)] mb-1">My Loans</h1>
        <p className="text-[13px] text-[var(--muted)]">Your active and past loans. Tap a loan to see full details.</p>
      </div>

      {isLoading && (
        <Card className="mb-5">
          <p className="text-xs text-[var(--muted)] text-center py-6">Loading your loans…</p>
        </Card>
      )}

      {!isLoading && loans.length === 0 && (
        <Card className="mb-5 flex flex-col items-center justify-center py-12 text-center">
          <Landmark size={32} className="text-[var(--muted)] mb-3" />
          <p className="text-sm font-semibold text-[var(--text)] mb-1">No loans yet</p>
          <p className="text-xs text-[var(--muted)]">
            Once you apply and get approved for a program, your loans will appear here.
          </p>
        </Card>
      )}

      <div className="space-y-4">
        {loans.map((loan: any) => {
          const trancheCount = loan.trancheCount || (loan.disbursements?.length ?? 0) || 1;
          const completedTranches = (loan.disbursements || []).filter((d: any) => d.status === "COMPLETED").length;
          const repayProgress =
            loan.totalRepayable > 0 ? Math.min(100, Math.round((loan.totalRepaid / loan.totalRepayable) * 100)) : 0;

          return (
            <Link key={loan.id} href={`/borrower/loans/${loan.id}`} className="block">
              <Card className="relative overflow-hidden hover:border-brand-green/50 transition-colors">
                <div
                  className="absolute top-0 left-0 w-1 h-full"
                  style={{ background: loan.status === "ACTIVE" ? "#16a34a" : loan.status === "COMPLETED" ? "#2563eb" : "#6b7280" }}
                />
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-base font-bold text-[var(--text)]">{loan.program?.name || "Loan"}</h2>
                    <p className="text-xs text-[var(--muted)]">
                      {loan.program?.interestRate != null ? `${loan.program.interestRate}% interest` : ""}
                      {loan.program?.durationMonths ? ` · ${loan.program.durationMonths} months` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusPill status={titleCase(loan.status)} />
                    <ChevronRight size={18} className="text-[var(--muted)]" />
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-[10px] text-[var(--muted)] uppercase">Loan Amount</p>
                    <p className="text-base font-bold text-[var(--text)]">{formatNaira(loan.amount)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[var(--muted)] uppercase">Disbursed</p>
                    <p className="text-base font-bold text-[var(--text)]">{formatNaira(loan.totalDisbursed)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[var(--muted)] uppercase">Repaid</p>
                    <p className="text-base font-bold text-green-600">{formatNaira(loan.totalRepaid)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[var(--muted)] uppercase">Remaining</p>
                    <p className="text-base font-bold text-orange-500">{formatNaira(loan.outstandingBalance)}</p>
                  </div>
                </div>

                {/* Progress */}
                <div className="h-2 rounded-full bg-[var(--input-bg)] overflow-hidden">
                  <div className="h-full rounded-full bg-green-500" style={{ width: `${repayProgress}%` }} />
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <p className="text-[11px] text-[var(--muted)]">{repayProgress}% repaid</p>
                  <p className="text-[11px] text-[var(--muted)]">
                    {completedTranches} of {trancheCount} tranche{trancheCount === 1 ? "" : "s"} released
                  </p>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
