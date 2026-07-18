"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Clock, CheckCircle, XCircle, FileText,
  AlertCircle, ChevronRight, Eye,
  Download, MessageCircle, Leaf, Upload, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useApplication,
  useWithdrawApplication,
  useUploadApplicationDocuments,
  useRespondToInfoRequest,
} from "@/lib/hooks";

const MAX_DOC_SIZE = 5 * 1024 * 1024;
const ACCEPTED_DOC_TYPES = "image/jpeg,image/png,application/pdf";

function parseInfoRequest(notes?: string | null): { items: string; message: string } | null {
  if (!notes || !notes.includes("[INFO_REQUESTED]")) return null;
  // A response appends [INFO_PROVIDED]; once present, the request is considered resolved.
  if (notes.includes("[INFO_PROVIDED]")) return null;
  const section = notes.split("[INFO_REQUESTED]")[1] ?? "";
  const [itemsPart, ...rest] = section.split("\nMessage:");
  return {
    items: itemsPart.trim(),
    message: rest.join("\nMessage:").trim(),
  };
}

const statusConfig: Record<string, { bg: string; text: string; icon: React.ElementType; label: string }> = {
  DRAFT: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-600 dark:text-gray-400", icon: FileText, label: "Draft" },
  SUBMITTED: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-400", icon: Clock, label: "Submitted" },
  UNDER_REVIEW: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-400", icon: Eye, label: "Under Review" },
  APPROVED: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400", icon: CheckCircle, label: "Approved" },
  REJECTED: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400", icon: XCircle, label: "Rejected" },
  WITHDRAWN: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-600 dark:text-gray-400", icon: XCircle, label: "Withdrawn" },
};

const WITHDRAWABLE_STATUSES = ["DRAFT", "SUBMITTED", "UNDER_REVIEW"];

export default function BorrowerApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data: app, isLoading } = useApplication(id);
  const withdrawApplication = useWithdrawApplication();
  const uploadDocuments = useUploadApplicationDocuments();
  const respondToInfo = useRespondToInfoRequest();

  const [infoFiles, setInfoFiles] = useState<File[]>([]);
  const [infoMessage, setInfoMessage] = useState("");
  const [infoError, setInfoError] = useState<string | null>(null);
  const [infoSubmitted, setInfoSubmitted] = useState(false);

  const handleInfoFileSelect = (fileList: FileList | null) => {
    setInfoError(null);
    if (!fileList) return;
    const picked = Array.from(fileList);
    const tooBig = picked.find((f) => f.size > MAX_DOC_SIZE);
    if (tooBig) {
      setInfoError(`${tooBig.name} is larger than 5MB.`);
      return;
    }
    setInfoFiles((prev) => [...prev, ...picked].slice(0, 5));
  };

  const handleRespondToInfo = async () => {
    setInfoError(null);
    try {
      for (const file of infoFiles) {
        await uploadDocuments.mutateAsync({ id, files: [file] });
      }
      await respondToInfo.mutateAsync({ id, message: infoMessage || undefined });
      setInfoFiles([]);
      setInfoMessage("");
      setInfoSubmitted(true);
    } catch (err: any) {
      setInfoError(err?.response?.data?.message || "Failed to send response. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <p className="text-sm text-[var(--muted)] text-center py-12">Loading application…</p>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="p-6 max-w-5xl mx-auto text-center py-12">
        <FileText size={48} className="mx-auto text-[var(--muted)] mb-4" />
        <h3 className="text-lg font-semibold text-[var(--text)] mb-2">Application not found</h3>
        <Link href="/borrower/applications">
          <Button variant="primary">Back to Applications</Button>
        </Link>
      </div>
    );
  }

  const status = statusConfig[app.status];
  const StatusIcon = status.icon;
  const infoRequest = app.status === "UNDER_REVIEW" ? parseInfoRequest(app.notes) : null;
  const interestRate = app.program?.interestRate ?? 0;
  const durationMonths = app.program?.durationMonths ?? 12;
  const interest = Math.round(app.amount * (interestRate / 100));
  const total = app.amount + interest;
  const monthly = durationMonths > 0 ? Math.round(total / durationMonths) : total;
  const farmScore = app.farmScoreAtApply ?? app.borrower?.farmScore;

  const timeline = [
    { date: app.createdAt, event: "Application Created", done: true },
    ...(app.submittedAt ? [{ date: app.submittedAt, event: "Application Submitted", done: true }] : []),
    ...(app.status === "UNDER_REVIEW" || app.reviewedAt
      ? [{ date: app.reviewedAt || null, event: app.reviewedAt ? "Reviewed" : "Under Review", done: !!app.reviewedAt || app.status !== "SUBMITTED" }]
      : []),
    ...(app.reviewedAt
      ? [{ date: app.reviewedAt, event: app.status === "APPROVED" ? "Approved" : app.status === "REJECTED" ? "Rejected" : "Decision Made", done: true }]
      : []),
  ];

  const handleWithdraw = () => {
    if (confirm("Are you sure you want to withdraw this application?")) {
      withdrawApplication.mutate(id);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/borrower/applications" className="p-2 hover:bg-[var(--surface)] rounded-lg">
          <ArrowLeft size={20} className="text-[var(--muted)]" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[var(--text)]">{app.program?.name || "Loan Application"}</h1>
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${status.bg} ${status.text}`}>
              <StatusIcon size={14} />
              {status.label}
            </span>
          </div>
          <p className="text-sm text-[var(--muted)]">{app.program?.lenderOrg?.name}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/borrower/messages">
            <Button variant="secondary">
              <MessageCircle size={16} className="mr-2" /> Contact Lender
            </Button>
          </Link>
          {WITHDRAWABLE_STATUSES.includes(app.status) && (
            <Button
              variant="secondary"
              className="text-red-600 hover:bg-red-50"
              onClick={handleWithdraw}
              disabled={withdrawApplication.isPending}
            >
              {withdrawApplication.isPending ? "Withdrawing…" : "Withdraw Application"}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {/* Status Banner */}
          {app.status === "UNDER_REVIEW" && !infoRequest && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <Clock size={20} className="text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-300">Application Under Review</h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                    {infoSubmitted
                      ? "Your response has been sent. The lender will continue reviewing your application."
                      : "Your application is being reviewed by the lender. You will be notified once a decision is made."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Info Request — Action Required */}
          {infoRequest && (
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-orange-800 dark:text-orange-300">Action Required: Information Requested</h3>
                  <p className="text-sm text-orange-700 dark:text-orange-400 mt-1">
                    The lender needs more information before continuing their review.
                  </p>
                  {infoRequest.items && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold text-orange-800 dark:text-orange-300 uppercase">Requested items</p>
                      <p className="text-sm text-orange-700 dark:text-orange-400">{infoRequest.items}</p>
                    </div>
                  )}
                  {infoRequest.message && (
                    <div className="mt-2">
                      <p className="text-xs font-semibold text-orange-800 dark:text-orange-300 uppercase">Message</p>
                      <p className="text-sm text-orange-700 dark:text-orange-400">{infoRequest.message}</p>
                    </div>
                  )}

                  {/* Response form */}
                  <div className="mt-4 space-y-3">
                    {infoFiles.length > 0 && (
                      <div className="space-y-2">
                        {infoFiles.map((file, i) => (
                          <div key={i} className="flex items-center justify-between gap-3 p-2 bg-white dark:bg-[var(--surface)] rounded-lg">
                            <span className="flex items-center gap-2 text-sm text-[var(--text)] min-w-0">
                              <FileText size={14} className="flex-shrink-0" />
                              <span className="truncate">{file.name}</span>
                              <span className="text-[var(--muted)] flex-shrink-0">({(file.size / 1024 / 1024).toFixed(1)}MB)</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => setInfoFiles((prev) => prev.filter((_, idx) => idx !== i))}
                              className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {infoFiles.length < 5 && (
                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-[var(--surface)] border border-orange-200 dark:border-orange-800 rounded-lg text-sm text-[var(--text)] cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-900/30">
                        <Upload size={16} /> Attach document
                        <input
                          type="file"
                          accept={ACCEPTED_DOC_TYPES}
                          multiple
                          className="hidden"
                          onChange={(e) => handleInfoFileSelect(e.target.files)}
                        />
                      </label>
                    )}

                    <textarea
                      value={infoMessage}
                      onChange={(e) => setInfoMessage(e.target.value)}
                      placeholder="Add a message to the lender (optional)"
                      rows={3}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-orange-200 dark:border-orange-800 bg-white dark:bg-[var(--surface)] text-[var(--text)] resize-none"
                    />

                    {infoError && <p className="text-sm text-red-500">{infoError}</p>}

                    <Button
                      variant="primary"
                      onClick={handleRespondToInfo}
                      disabled={respondToInfo.isPending || uploadDocuments.isPending || (infoFiles.length === 0 && !infoMessage.trim())}
                    >
                      {respondToInfo.isPending || uploadDocuments.isPending ? "Sending…" : "Send Response"}
                    </Button>
                  </div>
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
                    {app.rejectionReason || "Unfortunately, your application was not approved at this time. You may apply again after improving your FarmScore."}
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
                <p className="text-lg font-bold text-[var(--text)]">{interestRate}%</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-[var(--muted)]">Purpose</p>
                <p className="text-[var(--text)]">{app.purpose || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted)]">Submitted</p>
                <p className="text-[var(--text)]">{app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : "Not yet submitted"}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted)]">Lender</p>
                <p className="text-[var(--text)]">{app.program?.lenderOrg?.name || "—"}</p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
            <h3 className="font-semibold text-[var(--text)] mb-4">Application Timeline</h3>
            <div className="space-y-4">
              {timeline.map((item, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="relative">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      item.done ? "bg-green-100 dark:bg-green-900/30" : "bg-yellow-100 dark:bg-yellow-900/30"
                    }`}>
                      {item.done ? (
                        <CheckCircle size={16} className="text-green-600" />
                      ) : (
                        <Clock size={16} className="text-yellow-600" />
                      )}
                    </div>
                    {i < timeline.length - 1 && (
                      <div className={`absolute top-8 left-1/2 -translate-x-1/2 w-0.5 h-8 ${
                        item.done ? "bg-green-300 dark:bg-green-700" : "bg-gray-200 dark:bg-gray-700"
                      }`} />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className={`font-medium ${!item.done ? "text-yellow-700 dark:text-yellow-400" : "text-[var(--text)]"}`}>
                      {item.event}
                    </p>
                    <p className="text-sm text-[var(--muted)]">{item.date ? new Date(item.date).toLocaleDateString() : "Pending"}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Documents */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
            <h3 className="font-semibold text-[var(--text)] mb-4">Uploaded Documents</h3>
            {!app.documents || app.documents.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">No documents uploaded for this application.</p>
            ) : (
              <div className="space-y-3">
                {app.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-[var(--background)] rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <FileText size={18} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-[var(--text)]">{doc.fileName}</p>
                        <p className="text-xs text-[var(--muted)]">Uploaded {new Date(doc.createdAt).toLocaleDateString()}</p>
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
                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-[var(--surface)] rounded-lg">
                        <Download size={16} className="text-[var(--muted)]" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* FarmScore */}
          {farmScore != null && (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
              <h3 className="font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
                <Leaf size={18} className="text-brand-green" /> FarmScore
              </h3>
              <div className="text-center mb-4">
                <p className="text-4xl font-bold text-brand-green">{farmScore}</p>
                <p className="text-sm text-[var(--muted)]">out of 850</p>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full mb-2">
                <div
                  className="h-full bg-brand-green rounded-full"
                  style={{ width: `${Math.min(100, (farmScore / 850) * 100)}%` }}
                />
              </div>
              {app.borrower?.farmScoreTier && (
                <p className="text-xs text-[var(--muted)] text-center">Tier: {app.borrower.farmScoreTier}</p>
              )}
            </div>
          )}

          {/* Repayment Estimate */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
            <h3 className="font-semibold text-[var(--text)] mb-4">Repayment Estimate</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted)]">Principal</span>
                <span className="text-[var(--text)]">₦{app.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted)]">Interest ({interestRate}%)</span>
                <span className="text-[var(--text)]">₦{interest.toLocaleString()}</span>
              </div>
              <div className="pt-3 border-t border-[var(--border)] flex justify-between">
                <span className="font-medium text-[var(--text)]">Total Repayable</span>
                <span className="font-bold text-[var(--text)]">₦{total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted)]">Monthly Payment</span>
                <span className="font-semibold text-brand-green">₦{monthly.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--muted)]">Tenure</span>
                <span className="text-[var(--text)]">{durationMonths} months</span>
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
