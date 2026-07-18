"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, User, MapPin, Calendar, DollarSign, TrendingUp,
  CheckCircle, Clock, AlertTriangle, FileText, ChevronRight,
  Send, Pause, Play, XCircle, Phone, Mail, Leaf, RefreshCw,
  Download, Settings, History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  loansApi,
  type Loan,
  type RepaymentScheduleItem,
  type TimelineEvent,
  RESTRUCTURE_REASONS,
} from "@/lib/api/loans";
import { usePdfExport } from "@/lib/hooks/use-pdf-export";

const statusConfig: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  ACTIVE: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400", icon: CheckCircle },
  PENDING: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-400", icon: Clock },
  COMPLETED: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-400", icon: CheckCircle },
  DEFAULTED: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400", icon: AlertTriangle },
  CANCELLED: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-600 dark:text-gray-400", icon: XCircle },
};

type TabKey = "overview" | "tranches" | "repayments" | "timeline";

export default function LoanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const detailRef = useRef<HTMLDivElement>(null);
  const { exportToPdf, exporting } = usePdfExport();

  const [loan, setLoan] = useState<Loan | null>(null);
  const [schedule, setSchedule] = useState<RepaymentScheduleItem[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  const [showRestructureModal, setShowRestructureModal] = useState(false);
  const [showWriteOffModal, setShowWriteOffModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [restructureReason, setRestructureReason] = useState("");
  const [extensionMonths, setExtensionMonths] = useState(3);
  const [newMonthlyAmount, setNewMonthlyAmount] = useState("");
  const [gracePeriodMonths, setGracePeriodMonths] = useState(0);

  const [writeOffReason, setWriteOffReason] = useState("");
  const [writeOffAmount, setWriteOffAmount] = useState("");

  useEffect(() => {
    const fetchLoan = async () => {
      setLoading(true);
      try {
        const [loanData, scheduleData, timelineData] = await Promise.all([
          loansApi.getById(id),
          loansApi.getRepaymentSchedule(id),
          loansApi.getTimeline(id),
        ]);
        setLoan(loanData);
        setSchedule(scheduleData);
        setTimeline(timelineData);
        setWriteOffAmount(String(loanData.outstandingBalance || 0));
      } catch (err) {
        console.error("Failed to fetch loan:", err);
        setError("Failed to load loan details");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchLoan();
  }, [id]);

  const handleRestructure = async () => {
    if (!loan || !restructureReason || !newMonthlyAmount) return;
    setSubmitting(true);
    try {
      await loansApi.restructure(loan.id, {
        reason: restructureReason,
        extensionMonths,
        newMonthlyAmount: Number(newMonthlyAmount),
        gracePeriodMonths: gracePeriodMonths || undefined,
      });
      setShowRestructureModal(false);
      router.refresh();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to restructure loan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleWriteOff = async () => {
    if (!loan || !writeOffReason || !writeOffAmount) return;
    setSubmitting(true);
    try {
      await loansApi.writeOff(loan.id, {
        reason: writeOffReason,
        writeOffAmount: Number(writeOffAmount),
      });
      setShowWriteOffModal(false);
      router.push("/lender/loans");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to write off loan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleExportPdf = () => {
    const borrowerName = loan?.borrower
      ? `${loan.borrower.user.firstName}_${loan.borrower.user.lastName}`
      : "Loan";
    exportToPdf(detailRef, { filename: `${borrowerName}_Loan_${loan?.id.slice(0, 8)}`, title: `Loan Details - ${borrowerName.replace("_", " ")}` });
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <RefreshCw size={24} className="animate-spin text-[var(--muted)]" />
      </div>
    );
  }

  if (error || !loan) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <AlertTriangle size={32} className="text-red-600 mx-auto mb-2" />
          <p className="text-red-700 dark:text-red-300">{error || "Loan not found"}</p>
          <Link href="/lender/loans" className="text-sm underline mt-2 inline-block">
            Back to Loans
          </Link>
        </div>
      </div>
    );
  }

  const status = statusConfig[loan.status] || statusConfig.PENDING;
  const StatusIcon = status.icon;
  const borrowerName = loan.borrower ? `${loan.borrower.user.firstName} ${loan.borrower.user.lastName}` : "Unknown";
  const initials = borrowerName.split(" ").map((n) => n[0]).join("").toUpperCase();

  const disbursementPercent = loan.trancheCount > 0
    ? Math.round((loan.disbursements?.filter((d) => d.status === "COMPLETED").length || 0) / loan.trancheCount * 100)
    : 0;
  const repaymentPercent = loan.totalRepayable > 0
    ? Math.round(((loan.totalRepaid || 0) / loan.totalRepayable) * 100)
    : 0;

  const nextPayment = schedule.find((r) => r.status === "PENDING" || r.status === "OVERDUE");
  const canManage = loan.status === "ACTIVE" || loan.status === "DEFAULTED";

  return (
    <div className="p-6" ref={detailRef}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/lender/loans" className="p-2 hover:bg-[var(--surface)] rounded-lg border border-[var(--border)]">
          <ArrowLeft size={20} className="text-[var(--muted)]" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[var(--text)]">{loan.id.slice(0, 12)}</h1>
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${status.bg} ${status.text}`}>
              <StatusIcon size={14} />
              {loan.status}
            </span>
          </div>
          <p className="text-sm text-[var(--muted)]">{loan.program?.name || "—"}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportPdf}
            disabled={exporting}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--border)] text-sm hover:bg-[var(--surface)]"
          >
            <Download size={14} />
            {exporting ? "..." : "Export"}
          </button>
          {canManage && (
            <>
              <Button variant="secondary" onClick={() => setShowRestructureModal(true)}>
                <Settings size={16} className="mr-2" /> Restructure
              </Button>
              <Button variant="secondary" className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => setShowWriteOffModal(true)}>
                <XCircle size={16} className="mr-2" /> Write Off
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-sm text-[var(--muted)] mb-1">Loan Amount</p>
          <p className="text-xl font-bold text-[var(--text)]">₦{loan.amount.toLocaleString()}</p>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-sm text-[var(--muted)] mb-1">Disbursed</p>
          <p className="text-xl font-bold text-blue-600">₦{(loan.totalDisbursed || 0).toLocaleString()}</p>
          <p className="text-xs text-[var(--muted)]">{disbursementPercent}% of tranches</p>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-sm text-[var(--muted)] mb-1">Repaid</p>
          <p className="text-xl font-bold text-green-600">₦{(loan.totalRepaid || 0).toLocaleString()}</p>
          <p className="text-xs text-[var(--muted)]">{repaymentPercent}% of total</p>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-sm text-[var(--muted)] mb-1">Outstanding</p>
          <p className="text-xl font-bold text-orange-600">₦{(loan.outstandingBalance || 0).toLocaleString()}</p>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-sm text-[var(--muted)] mb-1">Interest Rate</p>
          <p className="text-xl font-bold text-[var(--text)]">{loan.interestRate}%</p>
          <p className="text-xs text-[var(--muted)]">per annum</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2">
          {/* Tabs */}
          <div className="flex gap-1 mb-4 border-b border-[var(--border)]">
            {[
              { key: "overview", label: "Overview" },
              { key: "tranches", label: "Disbursement Layers" },
              { key: "repayments", label: "Repayment Schedule" },
              { key: "timeline", label: "Activity Timeline" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as TabKey)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  activeTab === tab.key
                    ? "text-brand-green border-brand-green"
                    : "text-[var(--muted)] border-transparent hover:text-[var(--text)]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
                <h3 className="font-semibold text-[var(--text)] mb-4">Loan Progress</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-[var(--muted)]">Disbursement Progress</span>
                      <span className="font-medium text-[var(--text)]">
                        {loan.disbursements?.filter((d) => d.status === "COMPLETED").length || 0} / {loan.trancheCount} tranches
                      </span>
                    </div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${disbursementPercent}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-[var(--muted)]">Repayment Progress</span>
                      <span className="font-medium text-[var(--text)]">
                        ₦{(loan.totalRepaid || 0).toLocaleString()} / ₦{loan.totalRepayable.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${repaymentPercent}%` }} />
                    </div>
                    <p className="text-xs text-[var(--muted)] mt-1">
                      {schedule.filter((s) => s.status === "PAID").length} of {schedule.length} payments made
                    </p>
                  </div>
                </div>
              </div>

              {nextPayment && (
                <div className={`border rounded-xl p-5 ${
                  nextPayment.status === "OVERDUE"
                    ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
                    : "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className={`font-semibold ${nextPayment.status === "OVERDUE" ? "text-red-800 dark:text-red-300" : "text-yellow-800 dark:text-yellow-300"}`}>
                        {nextPayment.status === "OVERDUE" ? "Payment Overdue" : "Next Payment Due"}
                      </h3>
                      <p className={`text-2xl font-bold mt-1 ${nextPayment.status === "OVERDUE" ? "text-red-700" : "text-yellow-700"}`}>
                        ₦{nextPayment.amount.toLocaleString()}
                      </p>
                      <p className={`text-sm ${nextPayment.status === "OVERDUE" ? "text-red-600" : "text-yellow-600"}`}>
                        {nextPayment.status === "OVERDUE"
                          ? `${nextPayment.daysLate} days overdue`
                          : `Due ${new Date(nextPayment.dueDate).toLocaleDateString()}`
                        }
                      </p>
                    </div>
                    <Button variant="primary">
                      <Send size={16} className="mr-2" /> Send Reminder
                    </Button>
                  </div>
                </div>
              )}

              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
                <h3 className="font-semibold text-[var(--text)] mb-4">Payment Schedule Summary</h3>
                <div className="space-y-2">
                  {schedule.slice(0, 6).map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          payment.status === "PAID" ? "bg-green-100 dark:bg-green-900/30" :
                          payment.status === "OVERDUE" ? "bg-red-100 dark:bg-red-900/30" :
                          payment.status === "PENDING" ? "bg-yellow-100 dark:bg-yellow-900/30" :
                          "bg-gray-100 dark:bg-gray-800"
                        }`}>
                          {payment.status === "PAID" ? <CheckCircle size={16} className="text-green-600" /> :
                           payment.status === "OVERDUE" ? <AlertTriangle size={16} className="text-red-600" /> :
                           <Clock size={16} className="text-yellow-600" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[var(--text)]">
                            {new Date(payment.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                          <p className="text-xs text-[var(--muted)]">Installment #{payment.installmentNumber}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-[var(--text)]">₦{payment.amount.toLocaleString()}</p>
                        <span className={`text-xs font-medium ${
                          payment.status === "PAID" ? "text-green-600" :
                          payment.status === "OVERDUE" ? "text-red-600" :
                          "text-yellow-600"
                        }`}>
                          {payment.status}{payment.daysLate > 0 ? ` (${payment.daysLate}d late)` : ""}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {schedule.length > 6 && (
                  <button
                    onClick={() => setActiveTab("repayments")}
                    className="text-sm text-brand-green hover:underline mt-3"
                  >
                    View all {schedule.length} payments →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Tranches Tab */}
          {activeTab === "tranches" && (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
              <h3 className="font-semibold text-[var(--text)] mb-4">Disbursement Layers</h3>
              <div className="space-y-4">
                {loan.disbursements?.map((tranche, idx) => (
                  <div key={tranche.id} className={`p-4 rounded-lg border ${
                    tranche.status === "COMPLETED" ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20" :
                    tranche.status === "PROCESSING" ? "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20" :
                    tranche.status === "APPROVED" ? "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20" :
                    "border-[var(--border)] bg-[var(--background)]"
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                          tranche.status === "COMPLETED" ? "bg-green-200 dark:bg-green-800 text-green-700" :
                          tranche.status === "PROCESSING" ? "bg-blue-200 dark:bg-blue-800 text-blue-700" :
                          "bg-gray-200 dark:bg-gray-700 text-gray-600"
                        }`}>
                          {tranche.trancheNumber}
                        </div>
                        <div>
                          <p className="font-semibold text-[var(--text)]">Layer {tranche.trancheNumber}</p>
                          <p className="text-sm text-[var(--muted)]">
                            {tranche.status === "COMPLETED" && tranche.processedAt
                              ? `Released ${new Date(tranche.processedAt).toLocaleDateString()}`
                              : tranche.status === "PENDING" ? "Awaiting approval" : tranche.status
                            }
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[var(--text)]">₦{tranche.amount.toLocaleString()}</p>
                        <span className={`text-xs font-medium ${
                          tranche.status === "COMPLETED" ? "text-green-600" :
                          tranche.status === "PROCESSING" ? "text-blue-600" :
                          tranche.status === "APPROVED" ? "text-yellow-600" :
                          "text-gray-500"
                        }`}>
                          {tranche.status === "COMPLETED" ? "✓ Released" :
                           tranche.status === "PROCESSING" ? "⏳ Processing" :
                           tranche.status === "APPROVED" ? "✓ Approved" :
                           "🔒 Locked"}
                        </span>
                      </div>
                    </div>
                    {tranche.paymentRef && (
                      <p className="text-xs text-[var(--muted)] mt-2">Ref: {tranche.paymentRef}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Repayments Tab */}
          {activeTab === "repayments" && (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl">
              <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
                <h3 className="font-semibold text-[var(--text)]">Full Repayment Schedule</h3>
                <span className="text-sm text-[var(--muted)]">{schedule.length} installments</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[var(--background)]">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase">#</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase">Due Date</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase">Amount</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase">Status</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase">Paid Date</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase">Days Late</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)]">
                    {schedule.map((payment) => (
                      <tr key={payment.id} className="hover:bg-[var(--background)]">
                        <td className="px-4 py-3 text-sm font-medium text-[var(--text)]">{payment.installmentNumber}</td>
                        <td className="px-4 py-3 text-sm text-[var(--text)]">
                          {new Date(payment.dueDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-[var(--text)]">
                          ₦{payment.amount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                            payment.status === "PAID" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                            payment.status === "OVERDUE" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                            payment.status === "PARTIAL" ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" :
                            "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                          }`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--muted)]">
                          {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {payment.daysLate > 0 ? (
                            <span className="text-red-600 font-medium">{payment.daysLate}</span>
                          ) : (
                            <span className="text-[var(--muted)]">0</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === "timeline" && (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
              <h3 className="font-semibold text-[var(--text)] mb-4">Activity Timeline</h3>
              <div className="space-y-4">
                {timeline.map((event, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${
                        event.type === "DISBURSEMENT" ? "bg-blue-500" :
                        event.type === "REPAYMENT" ? "bg-green-500" :
                        event.type === "LOAN_COMPLETED" ? "bg-purple-500" :
                        "bg-brand-green"
                      }`} />
                      {idx < timeline.length - 1 && <div className="w-0.5 flex-1 bg-[var(--border)]" />}
                    </div>
                    <div className="pb-6 flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium text-[var(--text)]">{event.title}</p>
                          {event.description && <p className="text-xs text-[var(--muted)]">{event.description}</p>}
                          <p className="text-xs text-[var(--muted)] mt-1">
                            {new Date(event.date).toLocaleString()}
                          </p>
                        </div>
                        {event.amount && (
                          <p className={`text-sm font-semibold ${
                            event.type === "REPAYMENT" ? "text-green-600" : "text-blue-600"
                          }`}>
                            {event.type === "REPAYMENT" ? "+" : ""}₦{event.amount.toLocaleString()}
                          </p>
                        )}
                      </div>
                      {event.reference && (
                        <p className="text-xs text-[var(--muted)] mt-1">Ref: {event.reference}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Borrower Card */}
          {loan.borrower && (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
              <h3 className="font-semibold text-[var(--text)] mb-4">Borrower</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-brand-green flex items-center justify-center text-white font-bold">
                  {initials}
                </div>
                <div>
                  <p className="font-semibold text-[var(--text)]">{borrowerName}</p>
                  <p className="text-sm text-[var(--muted)]">{loan.borrower.farmerId}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-[var(--muted)]">
                  <MapPin size={14} />
                  <span>{loan.borrower.lga}, {loan.borrower.state}</span>
                </div>
                {loan.borrower.user.phone && (
                  <div className="flex items-center gap-2 text-[var(--muted)]">
                    <Phone size={14} />
                    <span>{loan.borrower.user.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-[var(--muted)]">
                  <Mail size={14} />
                  <span>{loan.borrower.user.email}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-[var(--border)]">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--muted)]">FarmScore</span>
                  <span className={`text-lg font-bold ${
                    loan.borrower.farmScore >= 700 ? "text-green-600" :
                    loan.borrower.farmScore >= 500 ? "text-yellow-600" :
                    "text-red-600"
                  }`}>{loan.borrower.farmScore}</span>
                </div>
              </div>
              <Link href={`/lender/borrowers/${loan.borrower.id}`}>
                <Button variant="secondary" className="w-full mt-4">
                  View Full Profile
                </Button>
              </Link>
            </div>
          )}

          {/* Loan Timeline */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
            <h3 className="font-semibold text-[var(--text)] mb-4">Loan Dates</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-[var(--muted)]" />
                <div>
                  <p className="text-sm font-medium text-[var(--text)]">Start Date</p>
                  <p className="text-xs text-[var(--muted)]">
                    {loan.startDate ? new Date(loan.startDate).toLocaleDateString() : "Not started"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-[var(--muted)]" />
                <div>
                  <p className="text-sm font-medium text-[var(--text)]">Maturity Date</p>
                  <p className="text-xs text-[var(--muted)]">
                    {loan.endDate ? new Date(loan.endDate).toLocaleDateString() : "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Related Links */}
          {loan.applicationId && (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
              <h3 className="font-semibold text-[var(--text)] mb-4">Related</h3>
              <Link
                href={`/lender/applications/${loan.applicationId}`}
                className="flex items-center justify-between p-3 bg-[var(--background)] rounded-lg hover:bg-[var(--surface)] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-[var(--muted)]" />
                  <span className="text-sm text-[var(--text)]">Original Application</span>
                </div>
                <ChevronRight size={14} className="text-[var(--muted)]" />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Restructure Modal */}
      {showRestructureModal && (
        <Modal onClose={() => setShowRestructureModal(false)}>
          <h3 className="text-lg font-semibold text-[var(--text)] mb-4">Restructure Loan</h3>
          <p className="text-sm text-[var(--muted)] mb-4">
            Restructuring will modify the repayment schedule and apply a -15 FarmScore penalty.
          </p>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[var(--muted)] uppercase block mb-1">Reason</label>
              <select
                value={restructureReason}
                onChange={(e) => setRestructureReason(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm"
              >
                <option value="">Select reason...</option>
                {RESTRUCTURE_REASONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-[var(--muted)] uppercase block mb-1">Extension (months)</label>
                <input
                  type="number"
                  min={1}
                  max={24}
                  value={extensionMonths}
                  onChange={(e) => setExtensionMonths(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--muted)] uppercase block mb-1">Grace Period</label>
                <input
                  type="number"
                  min={0}
                  max={6}
                  value={gracePeriodMonths}
                  onChange={(e) => setGracePeriodMonths(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--muted)] uppercase block mb-1">New Monthly Amount (₦)</label>
              <input
                type="number"
                value={newMonthlyAmount}
                onChange={(e) => setNewMonthlyAmount(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6 justify-end">
            <Button variant="secondary" onClick={() => setShowRestructureModal(false)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={handleRestructure}
              disabled={submitting || !restructureReason || !newMonthlyAmount}
            >
              {submitting ? "Restructuring..." : "Confirm Restructure"}
            </Button>
          </div>
        </Modal>
      )}

      {/* Write Off Modal */}
      {showWriteOffModal && (
        <Modal onClose={() => setShowWriteOffModal(false)}>
          <h3 className="text-lg font-semibold text-[var(--text)] mb-4">Write Off Loan</h3>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-700 dark:text-red-300">
              <strong>Warning:</strong> This action is irreversible. The borrower will receive a -120 FarmScore penalty.
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[var(--muted)] uppercase block mb-1">Write Off Reason</label>
              <textarea
                value={writeOffReason}
                onChange={(e) => setWriteOffReason(e.target.value)}
                rows={3}
                placeholder="Provide detailed justification..."
                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm resize-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--muted)] uppercase block mb-1">Write Off Amount (₦)</label>
              <input
                type="number"
                value={writeOffAmount}
                onChange={(e) => setWriteOffAmount(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm"
              />
              <p className="text-xs text-[var(--muted)] mt-1">Outstanding: ₦{(loan.outstandingBalance || 0).toLocaleString()}</p>
            </div>
          </div>
          <div className="flex gap-3 mt-6 justify-end">
            <Button variant="secondary" onClick={() => setShowWriteOffModal(false)}>Cancel</Button>
            <button
              onClick={handleWriteOff}
              disabled={submitting || !writeOffReason || !writeOffAmount}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold disabled:opacity-50"
            >
              {submitting ? "Processing..." : "Confirm Write Off"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-[var(--surface)] rounded-2xl p-6 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
