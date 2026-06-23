"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, User, MapPin, Calendar, DollarSign, TrendingUp,
  CheckCircle, Clock, AlertTriangle, FileText, ChevronRight,
  Send, Pause, Play, XCircle, Phone, Mail, Leaf
} from "lucide-react";
import { Button } from "@/components/ui/button";

const mockLoan = {
  id: "LN-2025-001",
  borrower: {
    id: "FRM-2024-001",
    name: "Musa Garba",
    phone: "+234 803 123 4567",
    email: "musa.garba@email.com",
    state: "Kebbi",
    lga: "Argungu",
    farmScore: 720,
    avatar: "MG",
  },
  program: {
    name: "CBN Rice Fund 2025",
    lender: "Central Bank of Nigeria",
  },
  amount: 850000,
  disbursed: 595000,
  repaid: 340000,
  outstanding: 510000,
  status: "ACTIVE",
  interestRate: 9,
  totalRepayable: 926500,
  startDate: "2025-02-15",
  dueDate: "2026-02-15",
  applicationId: "APP-2025-001",
  tranches: [
    { id: 1, amount: 255000, status: "DISBURSED", disbursedAt: "2025-02-15", purpose: "Land preparation & seeds" },
    { id: 2, amount: 340000, status: "DISBURSED", disbursedAt: "2025-04-20", purpose: "Fertilizers & irrigation" },
    { id: 3, amount: 255000, status: "PENDING", disbursedAt: null, purpose: "Harvest & processing" },
  ],
  repayments: [
    { id: "REP-001", amount: 120000, date: "2025-04-15", method: "Bank Transfer", status: "CONFIRMED" },
    { id: "REP-002", amount: 120000, date: "2025-05-15", method: "Bank Transfer", status: "CONFIRMED" },
    { id: "REP-003", amount: 100000, date: "2025-06-15", method: "Mobile Money", status: "CONFIRMED" },
  ],
  schedule: [
    { dueDate: "2025-04-15", amount: 120000, status: "PAID" },
    { dueDate: "2025-05-15", amount: 120000, status: "PAID" },
    { dueDate: "2025-06-15", amount: 100000, status: "PAID" },
    { dueDate: "2025-07-15", amount: 85000, status: "UPCOMING" },
    { dueDate: "2025-08-15", amount: 85000, status: "SCHEDULED" },
    { dueDate: "2025-09-15", amount: 85000, status: "SCHEDULED" },
  ],
  farmReports: [
    { id: "FR-001", date: "2025-06-10", type: "Monitoring", status: "Verified", health: "Good" },
    { id: "FR-002", date: "2025-05-05", type: "Verification", status: "Verified", health: "Good" },
  ],
};

const statusConfig: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  ACTIVE: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400", icon: CheckCircle },
  PENDING: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-400", icon: Clock },
  COMPLETED: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-400", icon: CheckCircle },
  DEFAULTED: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400", icon: AlertTriangle },
  PAUSED: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-700 dark:text-gray-400", icon: Pause },
};

export default function LoanDetailPage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState<"overview" | "tranches" | "repayments" | "reports">("overview");

  const loan = mockLoan;
  const status = statusConfig[loan.status];
  const StatusIcon = status.icon;

  const disbursementPercent = Math.round((loan.disbursed / loan.amount) * 100);
  const repaymentPercent = Math.round((loan.repaid / loan.totalRepayable) * 100);

  const handleDisburseTranche = (trancheId: number) => {
    alert(`Disbursing tranche ${trancheId}...`);
  };

  const handlePauseLoan = () => {
    alert("Loan paused. Collections suspended.");
  };

  const handleWriteOff = () => {
    if (confirm("Are you sure you want to write off this loan? This action cannot be undone.")) {
      alert("Loan marked as written off.");
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/loans" className="p-2 hover:bg-[var(--surface)] rounded-lg">
          <ArrowLeft size={20} className="text-[var(--muted)]" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[var(--text)]">{loan.id}</h1>
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${status.bg} ${status.text}`}>
              <StatusIcon size={14} />
              {loan.status}
            </span>
          </div>
          <p className="text-sm text-[var(--muted)]">{loan.program.name}</p>
        </div>
        <div className="flex gap-2">
          {loan.status === "ACTIVE" && (
            <>
              <Button variant="secondary" onClick={handlePauseLoan}>
                <Pause size={16} className="mr-2" /> Pause Loan
              </Button>
              <Button variant="secondary" className="text-red-600 hover:bg-red-50" onClick={handleWriteOff}>
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
          <p className="text-xl font-bold text-blue-600">₦{loan.disbursed.toLocaleString()}</p>
          <p className="text-xs text-[var(--muted)]">{disbursementPercent}% of total</p>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-sm text-[var(--muted)] mb-1">Repaid</p>
          <p className="text-xl font-bold text-green-600">₦{loan.repaid.toLocaleString()}</p>
          <p className="text-xs text-[var(--muted)]">{repaymentPercent}% of repayable</p>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-sm text-[var(--muted)] mb-1">Outstanding</p>
          <p className="text-xl font-bold text-orange-600">₦{loan.outstanding.toLocaleString()}</p>
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
              { key: "tranches", label: "Tranches" },
              { key: "repayments", label: "Repayments" },
              { key: "reports", label: "Farm Reports" },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
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
              {/* Progress Bars */}
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
                <h3 className="font-semibold text-[var(--text)] mb-4">Loan Progress</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-[var(--muted)]">Disbursement Progress</span>
                      <span className="font-medium text-[var(--text)]">₦{loan.disbursed.toLocaleString()} / ₦{loan.amount.toLocaleString()}</span>
                    </div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${disbursementPercent}%` }} />
                    </div>
                    <p className="text-xs text-[var(--muted)] mt-1">Tranche {loan.tranches.filter(t => t.status === "DISBURSED").length} of {loan.tranches.length} disbursed</p>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-[var(--muted)]">Repayment Progress</span>
                      <span className="font-medium text-[var(--text)]">₦{loan.repaid.toLocaleString()} / ₦{loan.totalRepayable.toLocaleString()}</span>
                    </div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${repaymentPercent}%` }} />
                    </div>
                    <p className="text-xs text-[var(--muted)] mt-1">{loan.schedule.filter(s => s.status === "PAID").length} of {loan.schedule.length} payments made</p>
                  </div>
                </div>
              </div>

              {/* Upcoming Payment */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-yellow-800 dark:text-yellow-300">Next Payment Due</h3>
                    <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400 mt-1">
                      ₦{loan.schedule.find(s => s.status === "UPCOMING")?.amount.toLocaleString()}
                    </p>
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                      Due {new Date(loan.schedule.find(s => s.status === "UPCOMING")?.dueDate || "").toLocaleDateString()}
                    </p>
                  </div>
                  <Button variant="primary">
                    <Send size={16} className="mr-2" /> Send Reminder
                  </Button>
                </div>
              </div>

              {/* Payment Schedule */}
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
                <h3 className="font-semibold text-[var(--text)] mb-4">Payment Schedule</h3>
                <div className="space-y-2">
                  {loan.schedule.map((payment, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          payment.status === "PAID" ? "bg-green-100 dark:bg-green-900/30" :
                          payment.status === "UPCOMING" ? "bg-yellow-100 dark:bg-yellow-900/30" :
                          "bg-gray-100 dark:bg-gray-800"
                        }`}>
                          {payment.status === "PAID" ? (
                            <CheckCircle size={16} className="text-green-600" />
                          ) : payment.status === "UPCOMING" ? (
                            <Clock size={16} className="text-yellow-600" />
                          ) : (
                            <Calendar size={16} className="text-gray-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[var(--text)]">
                            {new Date(payment.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                          <p className="text-xs text-[var(--muted)]">Payment #{i + 1}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-[var(--text)]">₦{payment.amount.toLocaleString()}</p>
                        <span className={`text-xs font-medium ${
                          payment.status === "PAID" ? "text-green-600" :
                          payment.status === "UPCOMING" ? "text-yellow-600" :
                          "text-[var(--muted)]"
                        }`}>
                          {payment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tranches Tab */}
          {activeTab === "tranches" && (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
              <h3 className="font-semibold text-[var(--text)] mb-4">Disbursement Tranches</h3>
              <div className="space-y-4">
                {loan.tranches.map(tranche => (
                  <div key={tranche.id} className={`p-4 rounded-lg border ${
                    tranche.status === "DISBURSED" ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20" :
                    "border-[var(--border)] bg-[var(--background)]"
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          tranche.status === "DISBURSED" ? "bg-green-200 dark:bg-green-800" : "bg-gray-200 dark:bg-gray-700"
                        }`}>
                          <span className="font-bold text-sm">{tranche.id}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-[var(--text)]">Tranche {tranche.id}</p>
                          <p className="text-sm text-[var(--muted)]">{tranche.purpose}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[var(--text)]">₦{tranche.amount.toLocaleString()}</p>
                        {tranche.status === "DISBURSED" ? (
                          <span className="text-xs text-green-600">Disbursed {new Date(tranche.disbursedAt!).toLocaleDateString()}</span>
                        ) : (
                          <Button variant="primary" size="sm" onClick={() => handleDisburseTranche(tranche.id)}>
                            <Send size={14} className="mr-1" /> Disburse
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Repayments Tab */}
          {activeTab === "repayments" && (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl">
              <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
                <h3 className="font-semibold text-[var(--text)]">Repayment History</h3>
                <Button variant="primary" size="sm">
                  <DollarSign size={14} className="mr-1" /> Record Payment
                </Button>
              </div>
              <div className="divide-y divide-[var(--border)]">
                {loan.repayments.map(repayment => (
                  <div key={repayment.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <CheckCircle size={18} className="text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-[var(--text)]">{repayment.id}</p>
                        <p className="text-sm text-[var(--muted)]">{new Date(repayment.date).toLocaleDateString()} • {repayment.method}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">+₦{repayment.amount.toLocaleString()}</p>
                      <span className="text-xs text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded">
                        {repayment.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Farm Reports Tab */}
          {activeTab === "reports" && (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl">
              <div className="p-4 border-b border-[var(--border)]">
                <h3 className="font-semibold text-[var(--text)]">Farm Reports</h3>
              </div>
              <div className="divide-y divide-[var(--border)]">
                {loan.farmReports.map(report => (
                  <div key={report.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-brand-green/10 flex items-center justify-center">
                        <Leaf size={18} className="text-brand-green" />
                      </div>
                      <div>
                        <p className="font-medium text-[var(--text)]">{report.type} Report</p>
                        <p className="text-sm text-[var(--muted)]">{new Date(report.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-[var(--muted)]">Health: <span className="text-green-600 font-medium">{report.health}</span></span>
                      <Link href={`/farm-reports/${report.id}`} className="text-sm text-brand-green hover:underline flex items-center gap-1">
                        View <ChevronRight size={14} />
                      </Link>
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
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
            <h3 className="font-semibold text-[var(--text)] mb-4">Borrower</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-brand-green flex items-center justify-center text-white font-bold">
                {loan.borrower.avatar}
              </div>
              <div>
                <p className="font-semibold text-[var(--text)]">{loan.borrower.name}</p>
                <p className="text-sm text-[var(--muted)]">{loan.borrower.id}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-[var(--muted)]">
                <MapPin size={14} />
                <span>{loan.borrower.lga}, {loan.borrower.state}</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--muted)]">
                <Phone size={14} />
                <span>{loan.borrower.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-[var(--muted)]">
                <Mail size={14} />
                <span>{loan.borrower.email}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-[var(--border)]">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--muted)]">FarmScore</span>
                <span className="text-lg font-bold text-brand-green">{loan.borrower.farmScore}</span>
              </div>
            </div>
            <Link href={`/borrowers/${loan.borrower.id}`}>
              <Button variant="secondary" className="w-full mt-4">
                View Full Profile
              </Button>
            </Link>
          </div>

          {/* Loan Timeline */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
            <h3 className="font-semibold text-[var(--text)] mb-4">Timeline</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-[var(--muted)]" />
                <div>
                  <p className="text-sm font-medium text-[var(--text)]">Start Date</p>
                  <p className="text-xs text-[var(--muted)]">{new Date(loan.startDate).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-[var(--muted)]" />
                <div>
                  <p className="text-sm font-medium text-[var(--text)]">Due Date</p>
                  <p className="text-xs text-[var(--muted)]">{new Date(loan.dueDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Related Links */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
            <h3 className="font-semibold text-[var(--text)] mb-4">Related</h3>
            <div className="space-y-2">
              <Link
                href={`/applications/${loan.applicationId}`}
                className="flex items-center justify-between p-3 bg-[var(--background)] rounded-lg hover:bg-[var(--surface)] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-[var(--muted)]" />
                  <span className="text-sm text-[var(--text)]">Original Application</span>
                </div>
                <ChevronRight size={14} className="text-[var(--muted)]" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
