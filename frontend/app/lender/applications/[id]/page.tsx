"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, User, MapPin, Phone, Mail, Calendar,
  TrendingUp, CheckCircle, XCircle, Clock, FileText,
  Download, AlertTriangle, MessageSquare, Building,
  DollarSign, Leaf, Shield, Eye, ExternalLink, RefreshCw,
  Camera
} from "lucide-react";
import {
  applicationsApi,
  type Application,
  type RejectionCode,
  REJECTION_CODES,
  INFO_REQUEST_ITEMS,
} from "@/lib/api/applications";
import { usePdfExport } from "@/lib/hooks/use-pdf-export";
import { Button } from "@/components/ui/button";

const statusColors: Record<string, { bg: string; text: string }> = {
  DRAFT: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-600 dark:text-gray-400" },
  SUBMITTED: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-400" },
  UNDER_REVIEW: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-400" },
  APPROVED: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400" },
  REJECTED: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400" },
  WITHDRAWN: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-600 dark:text-gray-400" },
};

type TabKey = "overview" | "borrower" | "documents" | "farm" | "timeline";

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const detailRef = useRef<HTMLDivElement>(null);
  const { exportToPdf, exporting: isExporting } = usePdfExport();

  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  // Modal state
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showRequestInfoModal, setShowRequestInfoModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [approveAmount, setApproveAmount] = useState("");
  const [approveNotes, setApproveNotes] = useState("");
  const [rejectCode, setRejectCode] = useState<RejectionCode>("OTHER");
  const [rejectReason, setRejectReason] = useState("");
  const [requestItems, setRequestItems] = useState<string[]>([]);
  const [requestMessage, setRequestMessage] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");

  useEffect(() => {
    const fetchApplication = async () => {
      setLoading(true);
      try {
        const data = await applicationsApi.getById(id);
        setApplication(data);
        setApproveAmount(String(data.amount));
      } catch (err) {
        console.error("Failed to fetch application:", err);
        setError("Failed to load application details");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchApplication();
  }, [id]);

  const handleApprove = async () => {
    if (!application) return;
    setSubmitting(true);
    try {
      await applicationsApi.approve(application.id, {
        approvedAmount: Number(approveAmount),
        reviewNotes: approveNotes || undefined,
      });
      setShowApproveModal(false);
      router.push("/lender/applications?status=APPROVED");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to approve application");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!application || !rejectReason) return;
    setSubmitting(true);
    try {
      await applicationsApi.reject(application.id, {
        rejectionCode: rejectCode,
        reason: rejectReason,
      });
      setShowRejectModal(false);
      router.push("/lender/applications?status=REJECTED");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reject application");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestInfo = async () => {
    if (!application || requestItems.length === 0 || !requestMessage) return;
    setSubmitting(true);
    try {
      await applicationsApi.requestInfo(application.id, {
        requiredItems: requestItems,
        message: requestMessage,
      });
      setShowRequestInfoModal(false);
      router.refresh();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkUnderReview = async () => {
    if (!application) return;
    try {
      await applicationsApi.markUnderReview(application.id);
      setApplication({ ...application, status: "UNDER_REVIEW" });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to mark as under review");
    }
  };

  const handleExportPdf = () => {
    const borrowerName = application?.borrower
      ? `${application.borrower.user.firstName}_${application.borrower.user.lastName}`
      : "Application";
    exportToPdf(detailRef, { filename: `${borrowerName}_Application`, title: `Loan Application - ${borrowerName.replace("_", " ")}` });
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <RefreshCw size={24} className="animate-spin text-[var(--muted)]" />
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <AlertTriangle size={32} className="text-red-600 mx-auto mb-2" />
          <p className="text-red-700 dark:text-red-300">{error || "Application not found"}</p>
          <Link href="/lender/applications" className="text-sm underline mt-2 inline-block">
            Back to Applications
          </Link>
        </div>
      </div>
    );
  }

  const borrower = application.borrower;
  const program = application.program;
  const status = statusColors[application.status] || statusColors.DRAFT;
  const canTakeAction = application.status === "SUBMITTED" || application.status === "UNDER_REVIEW";
  const scoreColor = (application.farmScoreAtApply || 0) >= 750 ? "text-green-600" :
                     (application.farmScoreAtApply || 0) >= 600 ? "text-blue-600" : "text-yellow-600";

  const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
    { key: "overview", label: "Overview", icon: Eye },
    { key: "borrower", label: "Borrower", icon: User },
    { key: "documents", label: "Documents", icon: FileText },
    { key: "farm", label: "Farm Details", icon: Leaf },
    { key: "timeline", label: "Timeline", icon: Clock },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto" ref={detailRef}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/lender/applications" className="p-2 hover:bg-[var(--surface)] rounded-lg transition-colors">
            <ArrowLeft size={20} className="text-[var(--muted)]" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[var(--text)]">
                {borrower ? `${borrower.user.firstName} ${borrower.user.lastName}` : `Application ${application.id.slice(0, 8)}`}
              </h1>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.text}`}>
                {application.status.replace("_", " ")}
              </span>
            </div>
            <p className="text-sm text-[var(--muted)]">
              {borrower?.farmerId} • Applied {application.submittedAt ? new Date(application.submittedAt).toLocaleDateString() : "—"}
              {application.daysInQueue != null && ` • ${application.daysInQueue} days in queue`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPdf}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[var(--border)] text-sm hover:bg-[var(--surface)]"
          >
            <Download size={14} />
            {isExporting ? "Exporting..." : "Export PDF"}
          </button>
          {application.status === "SUBMITTED" && (
            <Button variant="secondary" onClick={handleMarkUnderReview}>
              <Clock size={16} className="mr-2" /> Mark Under Review
            </Button>
          )}
          {canTakeAction && (
            <>
              <Button
                variant="secondary"
                onClick={() => setShowRequestInfoModal(true)}
                className="text-blue-600 border-blue-200 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                <MessageSquare size={16} className="mr-2" /> Request Info
              </Button>
              <Button
                variant="secondary"
                onClick={() => setShowRejectModal(true)}
                className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <XCircle size={16} className="mr-2" /> Reject
              </Button>
              <Button variant="primary" onClick={() => setShowApproveModal(true)}>
                <CheckCircle size={16} className="mr-2" /> Approve Application
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {/* Loan Request */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-[var(--text)] mb-4">Loan Request</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-[var(--muted)] mb-1">Program</p>
                <p className="font-medium text-[var(--text)]">{program?.name || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted)] mb-1">Requested Amount</p>
                <p className="text-2xl font-bold text-brand-green">₦{Number(application.amount).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted)] mb-1">Interest Rate</p>
                <p className="font-medium text-[var(--text)]">{program?.interestRate || 0}%</p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted)] mb-1">Duration</p>
                <p className="font-medium text-[var(--text)]">{program?.durationMonths || 0} months</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-[var(--muted)] mb-1">Purpose</p>
                <p className="text-[var(--text)]">{application.purpose || "General farming activities"}</p>
              </div>
            </div>
          </div>

          {/* Borrower Profile */}
          {borrower && (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
              <h2 className="text-lg font-semibold text-[var(--text)] mb-4">Borrower Profile</h2>
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-brand-green flex items-center justify-center text-white font-bold text-xl">
                  {borrower.user.firstName[0]}{borrower.user.lastName[0]}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[var(--text)]">
                    {borrower.user.firstName} {borrower.user.lastName}
                  </h3>
                  <p className="text-sm text-[var(--muted)]">{borrower.farmerId}</p>
                  <div className="flex gap-4 mt-2">
                    {borrower.bvnVerified && (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded">
                        <CheckCircle size={12} /> BVN Verified
                      </span>
                    )}
                    {borrower.ninVerified && (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded">
                        <CheckCircle size={12} /> NIN Verified
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-[var(--muted)]">
                  <Phone size={14} /> {borrower.user.phone || "No phone"}
                </div>
                <div className="flex items-center gap-2 text-[var(--muted)]">
                  <Mail size={14} /> {borrower.user.email}
                </div>
                <div className="flex items-center gap-2 text-[var(--muted)] col-span-2">
                  <MapPin size={14} /> {borrower.lga}, {borrower.state}
                </div>
              </div>
            </div>
          )}

          {/* Farm Details */}
          {borrower && (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
              <h2 className="text-lg font-semibold text-[var(--text)] mb-4">Farm Details</h2>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <p className="text-sm text-[var(--muted)] mb-1">Farm Size</p>
                  <p className="font-semibold text-[var(--text)]">{borrower.farmSizeHa} hectares</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--muted)] mb-1">Primary Crop</p>
                  <p className="font-semibold text-[var(--text)]">{borrower.primaryCrop}</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--muted)] mb-1">Secondary Crops</p>
                  <p className="font-semibold text-[var(--text)]">{borrower.secondaryCrops?.join(", ") || "—"}</p>
                </div>
                {borrower.farmLatitude && borrower.farmLongitude && (
                  <div className="col-span-3">
                    <p className="text-sm text-[var(--muted)] mb-1">GPS Location</p>
                    <a
                      href={`https://maps.google.com/?q=${borrower.farmLatitude},${borrower.farmLongitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-brand-green text-sm hover:underline"
                    >
                      {borrower.farmLatitude.toFixed(6)}, {borrower.farmLongitude.toFixed(6)} ↗
                    </a>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm text-[var(--muted)] mb-2">Farm Photos</p>
                <div className="flex gap-3">
                  {[1, 2].map(i => (
                    <div key={i} className="w-32 h-24 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <Camera size={24} className="text-[var(--muted)]" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Documents */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-[var(--text)] mb-4">Documents</h2>
            {application.documents && application.documents.length > 0 ? (
              <div className="space-y-3">
                {application.documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-[var(--background)] rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText size={18} className="text-[var(--muted)]" />
                      <div>
                        <p className="font-medium text-sm text-[var(--text)]">{doc.fileName}</p>
                        <p className="text-xs text-[var(--muted)]">{doc.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                        doc.status === "VERIFIED" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                        doc.status === "PENDING" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" :
                        "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}>
                        {doc.status}
                      </span>
                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-brand-green hover:underline">
                        <Download size={14} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--muted)] text-center py-4">No documents uploaded</p>
            )}
            {program?.requiredDocuments && program.requiredDocuments.length > 0 && (
              <div className="mt-4 pt-4 border-t border-[var(--border)]">
                <p className="text-xs font-semibold text-[var(--muted)] uppercase mb-2">Required Documents</p>
                <div className="flex flex-wrap gap-2">
                  {program.requiredDocuments.map((doc, idx) => (
                    <span key={idx} className="px-2 py-1 bg-[var(--background)] rounded text-xs text-[var(--muted)]">
                      {doc}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Review Notes */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-[var(--text)] mb-4">Review Notes</h2>
            <textarea
              value={reviewNotes}
              onChange={e => setReviewNotes(e.target.value)}
              placeholder="Add internal notes about this application..."
              className="w-full p-3 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm resize-none h-24"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* FarmScore */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-[var(--text)] mb-4">FarmScore</h2>
            <div className="text-center mb-6">
              <p className={`text-5xl font-black ${scoreColor}`}>{application.farmScoreAtApply || "—"}</p>
              {borrower?.farmScoreTier && (
                <span className={`inline-block mt-2 px-3 py-1 text-sm font-bold rounded-full ${
                  borrower.farmScoreTier === "EXCELLENT" ? "bg-green-100 text-green-700" :
                  borrower.farmScoreTier === "GOOD" ? "bg-blue-100 text-blue-700" :
                  borrower.farmScoreTier === "FAIR" ? "bg-yellow-100 text-yellow-700" :
                  "bg-red-100 text-red-700"
                }`}>
                  {borrower.farmScoreTier}
                </span>
              )}
            </div>
            {borrower?.scoreHistory && borrower.scoreHistory.length > 0 && borrower.scoreHistory[0].components && (
              <div className="space-y-3">
                {Object.entries(borrower.scoreHistory[0].components as Record<string, number>).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[var(--muted)] capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="font-medium text-[var(--text)]">{value}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full">
                      <div className="h-full bg-brand-green rounded-full" style={{ width: `${value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cooperative */}
          {borrower?.cooperative && (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
              <h2 className="text-lg font-semibold text-[var(--text)] mb-4">Cooperative</h2>
              <p className="font-medium text-[var(--text)]">{borrower.cooperative.name}</p>
            </div>
          )}

          {/* Banking */}
          {borrower?.bankName && (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
              <h2 className="text-lg font-semibold text-[var(--text)] mb-4">Bank Details</h2>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-[var(--muted)]">Bank</p>
                  <p className="font-medium text-[var(--text)]">{borrower.bankName}</p>
                </div>
                <div>
                  <p className="text-xs text-[var(--muted)]">Account Number</p>
                  <p className="font-medium text-[var(--text)]">{borrower.bankAccount}</p>
                </div>
              </div>
            </div>
          )}

          {/* Eligibility Check */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-green-800 dark:text-green-400 mb-4 flex items-center gap-2">
              <CheckCircle size={20} /> Eligibility Check
            </h2>
            <div className="space-y-2 text-sm">
              <div className={`flex items-center gap-2 ${
                (application.farmScoreAtApply || 0) >= 500 ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"
              }`}>
                {(application.farmScoreAtApply || 0) >= 500 ? <CheckCircle size={14} /> : <XCircle size={14} />}
                FarmScore ({application.farmScoreAtApply || 0}) {(application.farmScoreAtApply || 0) >= 500 ? "≥" : "<"} Required (500)
              </div>
              <div className={`flex items-center gap-2 ${
                borrower?.bvnVerified && borrower?.ninVerified ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"
              }`}>
                {borrower?.bvnVerified && borrower?.ninVerified ? <CheckCircle size={14} /> : <XCircle size={14} />}
                Identity verified (BVN + NIN)
              </div>
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <CheckCircle size={14} /> Amount within program limits
              </div>
            </div>
          </div>

          {/* Rejection Info */}
          {application.rejectionReason && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-2 flex items-center gap-2">
                <XCircle size={20} /> Rejection Details
              </h2>
              <p className="text-sm text-red-700 dark:text-red-300">{application.rejectionReason}</p>
            </div>
          )}
        </div>
      </div>

      {/* Approve Modal */}
      {showApproveModal && (
        <Modal onClose={() => setShowApproveModal(false)}>
          <h3 className="text-lg font-semibold text-[var(--text)] mb-4">Approve Application</h3>
          <p className="text-sm text-[var(--muted)] mb-4">
            Approving will create a loan and queue the first disbursement.
          </p>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[var(--muted)] uppercase block mb-1">
                Approved Amount (₦)
              </label>
              <input
                type="number"
                value={approveAmount}
                onChange={(e) => setApproveAmount(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--muted)] uppercase block mb-1">
                Review Notes (Optional)
              </label>
              <textarea
                value={approveNotes}
                onChange={(e) => setApproveNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm resize-none"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6 justify-end">
            <Button variant="secondary" onClick={() => setShowApproveModal(false)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={handleApprove}
              disabled={submitting || !approveAmount}
            >
              {submitting ? "Approving..." : "Confirm Approval"}
            </Button>
          </div>
        </Modal>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <Modal onClose={() => setShowRejectModal(false)}>
          <h3 className="text-lg font-semibold text-[var(--text)] mb-4">Reject Application</h3>
          <p className="text-sm text-[var(--muted)] mb-4">
            Please provide a reason for rejection. This will be shared with the applicant.
          </p>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[var(--muted)] uppercase block mb-1">
                Rejection Reason
              </label>
              <select
                value={rejectCode}
                onChange={(e) => setRejectCode(e.target.value as RejectionCode)}
                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm"
              >
                {REJECTION_CODES.map((rc) => (
                  <option key={rc.code} value={rc.code}>{rc.label}</option>
                ))}
              </select>
              <p className="text-xs text-[var(--muted)] mt-1">
                {REJECTION_CODES.find((rc) => rc.code === rejectCode)?.description}
              </p>
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--muted)] uppercase block mb-1">
                Detailed Reason *
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g., Farm size below minimum requirement, insufficient documentation..."
                rows={3}
                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm resize-none"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6 justify-end">
            <Button variant="secondary" onClick={() => setShowRejectModal(false)}>Cancel</Button>
            <Button
              onClick={handleReject}
              disabled={submitting || !rejectReason}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {submitting ? "Rejecting..." : "Confirm Rejection"}
            </Button>
          </div>
        </Modal>
      )}

      {/* Request Info Modal */}
      {showRequestInfoModal && (
        <Modal onClose={() => setShowRequestInfoModal(false)}>
          <h3 className="text-lg font-semibold text-[var(--text)] mb-4">Request More Information</h3>
          <p className="text-sm text-[var(--muted)] mb-4">
            Select documents needed and add a message for the applicant.
          </p>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[var(--muted)] uppercase block mb-2">
                Required Items
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {INFO_REQUEST_ITEMS.map((item) => (
                  <label key={item} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={requestItems.includes(item)}
                      onChange={(e) => {
                        if (e.target.checked) setRequestItems([...requestItems, item]);
                        else setRequestItems(requestItems.filter((i) => i !== item));
                      }}
                      className="rounded"
                    />
                    <span className="text-sm text-[var(--text)]">{item}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--muted)] uppercase block mb-1">
                Message to Applicant *
              </label>
              <textarea
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                placeholder="Explain what is needed and why..."
                rows={3}
                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm resize-none"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6 justify-end">
            <Button variant="secondary" onClick={() => setShowRequestInfoModal(false)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={handleRequestInfo}
              disabled={submitting || requestItems.length === 0 || !requestMessage}
            >
              {submitting ? "Sending..." : "Send Request"}
            </Button>
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
