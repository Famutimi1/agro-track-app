"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Clock, CheckCircle, XCircle, FileText,
  Calendar, DollarSign, AlertCircle, ChevronRight, Eye,
  Download, MessageCircle, Leaf
} from "lucide-react";
import { Button } from "@/components/ui/button";

const mockApplication = {
  id: "APP-2025-002",
  program: {
    name: "Kebbi State Irrigation Scheme",
    lender: "Kebbi State Government",
    interestRate: 7,
    minAmount: 100000,
    maxAmount: 750000,
  },
  amount: 750000,
  purpose: "Irrigation equipment and seeds for wet season planting",
  status: "UNDER_REVIEW",
  submittedAt: "2025-06-18",
  reviewedAt: null,
  farmScore: 720,
  requiredScore: 450,
  estimatedDecision: "2025-06-25",
  timeline: [
    { date: "2025-06-18", event: "Application Submitted", status: "completed" },
    { date: "2025-06-19", event: "Documents Verified", status: "completed" },
    { date: "2025-06-20", event: "FarmScore Check Passed", status: "completed" },
    { date: "In Progress", event: "Lender Review", status: "current" },
    { date: "Pending", event: "Decision", status: "pending" },
  ],
  documents: [
    { name: "Farm Photo", type: "image", uploadedAt: "2025-06-18", status: "VERIFIED" },
    { name: "Land Document", type: "pdf", uploadedAt: "2025-06-18", status: "VERIFIED" },
    { name: "Bank Statement", type: "pdf", uploadedAt: "2025-06-18", status: "PENDING" },
  ],
  repaymentEstimate: {
    principal: 750000,
    interest: 52500,
    total: 802500,
    monthly: 66875,
    tenure: 12,
  },
};

const statusConfig: Record<string, { bg: string; text: string; icon: React.ElementType; label: string }> = {
  DRAFT: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-600 dark:text-gray-400", icon: FileText, label: "Draft" },
  SUBMITTED: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-400", icon: Clock, label: "Submitted" },
  UNDER_REVIEW: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-400", icon: Eye, label: "Under Review" },
  APPROVED: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400", icon: CheckCircle, label: "Approved" },
  REJECTED: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400", icon: XCircle, label: "Rejected" },
  WITHDRAWN: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-600 dark:text-gray-400", icon: XCircle, label: "Withdrawn" },
};

export default function BorrowerApplicationDetailPage() {
  const params = useParams();
  const app = mockApplication;
  const status = statusConfig[app.status];
  const StatusIcon = status.icon;

  const handleWithdraw = () => {
    if (confirm("Are you sure you want to withdraw this application?")) {
      alert("Application withdrawn.");
    }
  };

  const handleContact = () => {
    alert("Opening chat with lender...");
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/borrower-applications" className="p-2 hover:bg-[var(--surface)] rounded-lg">
          <ArrowLeft size={20} className="text-[var(--muted)]" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[var(--text)]">{app.id}</h1>
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${status.bg} ${status.text}`}>
              <StatusIcon size={14} />
              {status.label}
            </span>
          </div>
          <p className="text-sm text-[var(--muted)]">{app.program.name}</p>
        </div>
        {app.status === "UNDER_REVIEW" && (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={handleContact}>
              <MessageCircle size={16} className="mr-2" /> Contact Lender
            </Button>
            <Button variant="secondary" className="text-red-600 hover:bg-red-50" onClick={handleWithdraw}>
              Withdraw Application
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {/* Status Banner */}
          {app.status === "UNDER_REVIEW" && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <Clock size={20} className="text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-300">Application Under Review</h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                    Your application is being reviewed by the lender. You will be notified once a decision is made.
                  </p>
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-2">
                    Estimated decision date: <span className="font-semibold">{new Date(app.estimatedDecision).toLocaleDateString()}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {app.status === "APPROVED" && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <CheckCircle size={20} className="text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-800 dark:text-green-300">Application Approved!</h3>
                  <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                    Congratulations! Your loan has been approved. Check your loans page for disbursement details.
                  </p>
                  <Link href="/borrower/loans" className="inline-block mt-3">
                    <Button variant="primary">
                      View My Loans <ChevronRight size={16} className="ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {app.status === "REJECTED" && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <XCircle size={20} className="text-red-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-800 dark:text-red-300">Application Not Approved</h3>
                  <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                    Unfortunately, your application was not approved at this time. You may apply again after improving your FarmScore.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Application Details */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
            <h3 className="font-semibold text-[var(--text)] mb-4">Application Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[var(--muted)]">Loan Amount</p>
                <p className="text-lg font-bold text-[var(--text)]">₦{app.amount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted)]">Interest Rate</p>
                <p className="text-lg font-bold text-[var(--text)]">{app.program.interestRate}%</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-[var(--muted)]">Purpose</p>
                <p className="text-[var(--text)]">{app.purpose}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted)]">Submitted</p>
                <p className="text-[var(--text)]">{new Date(app.submittedAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted)]">Lender</p>
                <p className="text-[var(--text)]">{app.program.lender}</p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
            <h3 className="font-semibold text-[var(--text)] mb-4">Application Timeline</h3>
            <div className="space-y-4">
              {app.timeline.map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="relative">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      item.status === "completed" ? "bg-green-100 dark:bg-green-900/30" :
                      item.status === "current" ? "bg-yellow-100 dark:bg-yellow-900/30" :
                      "bg-gray-100 dark:bg-gray-800"
                    }`}>
                      {item.status === "completed" ? (
                        <CheckCircle size={16} className="text-green-600" />
                      ) : item.status === "current" ? (
                        <Clock size={16} className="text-yellow-600" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-gray-400" />
                      )}
                    </div>
                    {i < app.timeline.length - 1 && (
                      <div className={`absolute top-8 left-1/2 -translate-x-1/2 w-0.5 h-8 ${
                        item.status === "completed" ? "bg-green-300 dark:bg-green-700" : "bg-gray-200 dark:bg-gray-700"
                      }`} />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className={`font-medium ${
                      item.status === "current" ? "text-yellow-700 dark:text-yellow-400" : "text-[var(--text)]"
                    }`}>
                      {item.event}
                    </p>
                    <p className="text-sm text-[var(--muted)]">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Documents */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
            <h3 className="font-semibold text-[var(--text)] mb-4">Uploaded Documents</h3>
            <div className="space-y-3">
              {app.documents.map((doc, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-[var(--background)] rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <FileText size={18} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-[var(--text)]">{doc.name}</p>
                      <p className="text-xs text-[var(--muted)]">Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                      doc.status === "VERIFIED"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    }`}>
                      {doc.status}
                    </span>
                    <button className="p-2 hover:bg-[var(--surface)] rounded-lg">
                      <Download size={16} className="text-[var(--muted)]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* FarmScore */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
            <h3 className="font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
              <Leaf size={18} className="text-brand-green" /> FarmScore
            </h3>
            <div className="text-center mb-4">
              <p className="text-4xl font-bold text-brand-green">{app.farmScore}</p>
              <p className="text-sm text-[var(--muted)]">out of 850</p>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-2">
              <div
                className="h-full bg-brand-green rounded-full"
                style={{ width: `${(app.farmScore / 850) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-[var(--muted)]">
              <span>Required: {app.requiredScore}</span>
              <span className="text-green-600 font-medium">Eligible</span>
            </div>
          </div>

          {/* Repayment Estimate */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
            <h3 className="font-semibold text-[var(--text)] mb-4">Repayment Estimate</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted)]">Principal</span>
                <span className="text-[var(--text)]">₦{app.repaymentEstimate.principal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted)]">Interest ({app.program.interestRate}%)</span>
                <span className="text-[var(--text)]">₦{app.repaymentEstimate.interest.toLocaleString()}</span>
              </div>
              <div className="pt-3 border-t border-[var(--border)] flex justify-between">
                <span className="font-medium text-[var(--text)]">Total Repayable</span>
                <span className="font-bold text-[var(--text)]">₦{app.repaymentEstimate.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted)]">Monthly Payment</span>
                <span className="font-semibold text-brand-green">₦{app.repaymentEstimate.monthly.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted)]">Tenure</span>
                <span className="text-[var(--text)]">{app.repaymentEstimate.tenure} months</span>
              </div>
            </div>
          </div>

          {/* Help */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className="text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-700 dark:text-blue-400">Need Help?</p>
                <p className="text-blue-600 dark:text-blue-400">
                  Contact us at support@agrotrack.ng or call +234 800 000 0000
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
