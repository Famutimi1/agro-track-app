"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/ui/badge";
import { ArrowLeft, Check, Landmark, Lock } from "lucide-react";
import { useLoan } from "@/lib/hooks";
import { RepaymentModal } from "@/components/borrower/repayment-modal";

const LAYER_META = [
  { label: "Land Preparation", unlockHint: "Submit a land-preparation report to unlock" },
  { label: "Planting & Inputs", unlockHint: "Submit a planting report to unlock" },
  { label: "Crop Maintenance", unlockHint: "Submit a harvest report to unlock" },
];

function formatNaira(amount: number) {
  return `₦${Math.round(amount || 0).toLocaleString()}`;
}

function titleCase(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function repaymentBadgeClass(status: string) {
  if (status === "PAID") return "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400";
  if (status === "OVERDUE") return "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400";
  if (status === "PARTIAL") return "bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400";
  return "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400";
}

function repaymentLabel(status: string) {
  if (status === "PAID") return "Paid";
  if (status === "OVERDUE") return "Overdue";
  if (status === "PARTIAL") return "Partial";
  return "Upcoming";
}

export default function BorrowerLoanDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: loan, isLoading } = useLoan(id);
  const [payingRepayment, setPayingRepayment] = useState<{ id: string; amount: number } | null>(null);

  if (isLoading) {
    return (
      <div>
        <BackLink />
        <Card>
          <p className="text-xs text-[var(--muted)] text-center py-6">Loading loan details…</p>
        </Card>
      </div>
    );
  }

  if (!loan) {
    return (
      <div>
        <BackLink />
        <Card className="flex flex-col items-center justify-center py-12 text-center">
          <Landmark size={32} className="text-[var(--muted)] mb-3" />
          <p className="text-sm font-semibold text-[var(--text)] mb-1">Loan not found</p>
          <p className="text-xs text-[var(--muted)]">This loan may not exist or you may not have access to it.</p>
        </Card>
      </div>
    );
  }

  const disbursements = loan.disbursements || [];
  const trancheCount = loan.trancheCount || disbursements.length || 1;
  const completedTranches = disbursements.filter((d) => d.status === "COMPLETED").length;
  const repayProgress =
    loan.totalRepayable > 0 ? Math.min(100, Math.round(((loan.totalRepaid || 0) / loan.totalRepayable) * 100)) : 0;
  const schedule = [...(loan.repayments || [])].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );
  const remainingCount = schedule.filter((r) => r.status !== "PAID").length;

  return (
    <div>
      <BackLink />

      <Card className="mb-5 relative overflow-hidden">
        <div
          className="absolute top-0 left-0 w-1 h-full"
          style={{ background: loan.status === "ACTIVE" ? "#16a34a" : loan.status === "COMPLETED" ? "#2563eb" : "#6b7280" }}
        />
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold text-[var(--text)]">{loan.program?.name || "Loan"}</h1>
            <p className="text-xs text-[var(--muted)]">
              {loan.program?.interestRate != null ? `${loan.program.interestRate}% interest` : ""}
              {loan.program?.durationMonths ? ` · ${loan.program.durationMonths} months` : ""}
            </p>
          </div>
          <StatusPill status={titleCase(loan.status)} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-[10px] text-[var(--muted)] uppercase">Loan Amount</p>
            <p className="text-base font-bold text-[var(--text)]">{formatNaira(loan.amount)}</p>
          </div>
          <div>
            <p className="text-[10px] text-[var(--muted)] uppercase">Disbursed</p>
            <p className="text-base font-bold text-[var(--text)]">{formatNaira(loan.totalDisbursed || 0)}</p>
          </div>
          <div>
            <p className="text-[10px] text-[var(--muted)] uppercase">Repaid</p>
            <p className="text-base font-bold text-green-600">{formatNaira(loan.totalRepaid || 0)}</p>
          </div>
          <div>
            <p className="text-[10px] text-[var(--muted)] uppercase">Remaining</p>
            <p className="text-base font-bold text-orange-500">{formatNaira(loan.outstandingBalance || 0)}</p>
          </div>
        </div>
      </Card>

      {/* Repayment progress */}
      <Card className="mb-5">
        <div className="h-2 rounded-full bg-[var(--input-bg)] overflow-hidden">
          <div className="h-full rounded-full bg-green-500" style={{ width: `${repayProgress}%` }} />
        </div>
        <p className="text-[11px] text-[var(--muted)] mt-1.5">
          {repayProgress}% repaid · {remainingCount} payment{remainingCount === 1 ? "" : "s"} remaining
        </p>
      </Card>

      {/* Disbursement Layers */}
      <Card className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-[var(--text)]">Disbursement Layers</h2>
          <span className="text-[11px] text-[var(--muted)]">
            {completedTranches} of {trancheCount} released
          </span>
        </div>
        <div className="space-y-2">
          {Array.from({ length: trancheCount }, (_, i) => i).map((idx) => {
            const layer = LAYER_META[Math.min(idx, LAYER_META.length - 1)];
            const disbursement = disbursements.find((d) => d.trancheNumber === idx + 1);
            const released = disbursement?.status === "COMPLETED";
            const perTranche = loan.amount && trancheCount ? loan.amount / trancheCount : 0;
            const amount = disbursement?.amount ?? perTranche;
            return (
              <div
                key={idx}
                className={`flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border ${
                  released
                    ? "border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/15"
                    : "border-[var(--border)] bg-[var(--input-bg)]"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {released ? (
                    <Check size={15} className="text-green-600 flex-shrink-0" />
                  ) : (
                    <Lock size={14} className="text-[var(--muted)] flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[var(--text)]">
                      Layer {idx + 1}: {layer.label}
                    </p>
                    <p className="text-[11px] text-[var(--muted)] truncate">
                      {released ? "Released" : layer.unlockHint}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-[var(--text)] flex-shrink-0">
                  {formatNaira(amount)}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Repayment Schedule */}
      {schedule.length > 0 && (
        <Card className="mb-5">
          <h2 className="text-xs font-bold text-[var(--text)] mb-3">Repayment Schedule</h2>
          <div className="space-y-2">
            {schedule.map((r, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0"
              >
                <div>
                  <p className="text-xs font-medium text-[var(--text)]">
                    {new Date(r.dueDate).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                  </p>
                  <p className="text-[11px] text-[var(--muted)]">
                    {new Date(r.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[var(--text)]">{formatNaira(r.amount)}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${repaymentBadgeClass(r.status)}`}>
                    {repaymentLabel(r.status)}
                  </span>
                  {r.status !== "PAID" && (
                    <Button size="sm" onClick={() => setPayingRepayment({ id: r.id, amount: r.amount })}>
                      Pay Now
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {payingRepayment && (
        <RepaymentModal
          open={!!payingRepayment}
          onClose={() => setPayingRepayment(null)}
          repaymentId={payingRepayment.id}
          amount={payingRepayment.amount}
        />
      )}
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/borrower/loans"
      className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--text)] mb-4"
    >
      <ArrowLeft size={14} /> Back to My Loans
    </Link>
  );
}
