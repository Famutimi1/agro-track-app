"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus, Clock, CheckCircle, XCircle, Eye, FileText,
  ChevronRight, Calendar, DollarSign, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";

const statusConfig: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  DRAFT: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-600 dark:text-gray-400", icon: FileText },
  SUBMITTED: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-400", icon: Clock },
  UNDER_REVIEW: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-400", icon: Eye },
  APPROVED: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400", icon: CheckCircle },
  REJECTED: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400", icon: XCircle },
  WITHDRAWN: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-600 dark:text-gray-400", icon: XCircle },
};

const mockApplications = [
  {
    id: "APP-2025-001",
    program: { name: "CBN Rice Fund 2025", lender: "Central Bank of Nigeria" },
    amount: 500000,
    status: "APPROVED",
    submittedAt: "2025-02-10",
    reviewedAt: "2025-02-15",
    purpose: "Purchase of improved rice seedlings and fertilizers",
  },
  {
    id: "APP-2025-002",
    program: { name: "Kebbi State Irrigation Scheme", lender: "Kebbi State Government" },
    amount: 750000,
    status: "UNDER_REVIEW",
    submittedAt: "2025-06-18",
    reviewedAt: null,
    purpose: "Irrigation equipment and seeds for wet season planting",
  },
  {
    id: "APP-2025-003",
    program: { name: "NIRSAL Cassava Grant", lender: "NIRSAL" },
    amount: 300000,
    status: "DRAFT",
    submittedAt: null,
    reviewedAt: null,
    purpose: "",
  },
];

export default function BorrowerApplicationsPage() {
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredApps = mockApplications.filter(app => {
    return statusFilter === "ALL" || app.status === statusFilter;
  });

  const stats = {
    total: mockApplications.length,
    pending: mockApplications.filter(a => ["SUBMITTED", "UNDER_REVIEW"].includes(a.status)).length,
    approved: mockApplications.filter(a => a.status === "APPROVED").length,
    drafts: mockApplications.filter(a => a.status === "DRAFT").length,
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">My Applications</h1>
          <p className="text-sm text-[var(--muted)]">Track and manage your loan applications</p>
        </div>
        <Link href="/borrower-applications/new">
          <Button variant="primary">
            <Plus size={16} className="mr-2" /> New Application
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Applications", value: stats.total, color: "text-[var(--text)]" },
          { label: "Pending Review", value: stats.pending, color: "text-yellow-600" },
          { label: "Approved", value: stats.approved, color: "text-green-600" },
          { label: "Drafts", value: stats.drafts, color: "text-gray-500" },
        ].map(stat => (
          <div key={stat.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <p className="text-sm text-[var(--muted)] mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-6">
        {["ALL", "DRAFT", "SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED"].map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === status
                ? "bg-brand-green text-white"
                : "bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--background)]"
            }`}
          >
            {status === "ALL" ? "All" : status.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApps.map(app => {
          const status = statusConfig[app.status];
          const StatusIcon = status.icon;

          return (
            <div
              key={app.id}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 hover:border-brand-green/50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-[var(--text)]">{app.program.name}</h3>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                      <StatusIcon size={12} />
                      {app.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--muted)] mb-3">{app.program.lender}</p>

                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2 text-[var(--muted)]">
                      <DollarSign size={14} />
                      <span className="font-semibold text-[var(--text)]">₦{app.amount.toLocaleString()}</span>
                    </div>
                    {app.submittedAt && (
                      <div className="flex items-center gap-2 text-[var(--muted)]">
                        <Calendar size={14} />
                        <span>Submitted {new Date(app.submittedAt).toLocaleDateString()}</span>
                      </div>
                    )}
                    {app.purpose && (
                      <div className="flex items-center gap-2 text-[var(--muted)]">
                        <FileText size={14} />
                        <span className="truncate max-w-[200px]">{app.purpose}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Link
                  href={`/borrower-applications/${app.id}`}
                  className="flex items-center gap-1 text-sm text-brand-green hover:underline"
                >
                  {app.status === "DRAFT" ? "Continue" : "View"} <ChevronRight size={14} />
                </Link>
              </div>

              {/* Status-specific messages */}
              {app.status === "UNDER_REVIEW" && (
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-700 dark:text-yellow-400">
                    Your application is being reviewed by the lender. You'll be notified once a decision is made.
                  </p>
                </div>
              )}
              {app.status === "APPROVED" && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-sm text-green-700 dark:text-green-400">
                    Congratulations! Your application has been approved. Check your loans page for disbursement details.
                  </p>
                </div>
              )}
              {app.status === "DRAFT" && (
                <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <p className="text-sm text-[var(--muted)]">
                    This application is incomplete. Click &quot;Continue&quot; to finish and submit.
                  </p>
                </div>
              )}
            </div>
          );
        })}

        {filteredApps.length === 0 && (
          <div className="text-center py-12">
            <FileText size={48} className="mx-auto text-[var(--muted)] mb-4" />
            <h3 className="text-lg font-semibold text-[var(--text)] mb-2">No applications found</h3>
            <p className="text-[var(--muted)] mb-4">Start by discovering eligible loan programs</p>
            <Link href="/borrower/discover">
              <Button variant="primary">Browse Programs</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
