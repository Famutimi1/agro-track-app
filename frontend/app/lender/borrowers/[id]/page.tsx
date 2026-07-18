"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, MapPin, Phone, Mail, Calendar, User,
  TrendingUp, CheckCircle, XCircle, AlertTriangle, Clock,
  FileText, Leaf, DollarSign, Flag, Ban, Eye, Download,
  ChevronRight, RefreshCw, Camera, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  borrowersApi,
  type BorrowerProfile,
  type FarmReport,
  type FarmScoreDetail,
  type BorrowerActivityEvent,
  type BorrowerDocument,
  FARM_SCORE_TIERS,
  FLAG_SEVERITIES,
} from "@/lib/api/borrowers";
import { type Loan } from "@/lib/api/loans";

type TabKey = "overview" | "loans" | "reports" | "farmscore" | "documents" | "activity";

const cropColors: Record<string, { bg: string; color: string }> = {
  Rice: { bg: "#dcfce7", color: "#166534" },
  Cassava: { bg: "#fef3c7", color: "#854d0e" },
  Maize: { bg: "#dbeafe", color: "#1e40af" },
  Yam: { bg: "#fed7aa", color: "#9a3412" },
  Cocoa: { bg: "#d1fae5", color: "#065f46" },
};

export default function BorrowerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [borrower, setBorrower] = useState<BorrowerProfile | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [farmReports, setFarmReports] = useState<FarmReport[]>([]);
  const [farmScore, setFarmScore] = useState<FarmScoreDetail | null>(null);
  const [documents, setDocuments] = useState<BorrowerDocument[]>([]);
  const [activity, setActivity] = useState<BorrowerActivityEvent[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  const [showFlagModal, setShowFlagModal] = useState(false);
  const [showBlacklistModal, setShowBlacklistModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [flagReason, setFlagReason] = useState("");
  const [flagSeverity, setFlagSeverity] = useState<"LOW" | "MEDIUM" | "HIGH" | "CRITICAL">("LOW");
  const [blacklistReason, setBlacklistReason] = useState("");
  const [blacklistDuration, setBlacklistDuration] = useState<number | "PERMANENT">(12);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const borrowerData = await borrowersApi.getById(id);
        setBorrower(borrowerData);
      } catch (err) {
        console.error("Failed to fetch borrower:", err);
        setError("Failed to load borrower details");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id]);

  useEffect(() => {
    if (!borrower) return;

    const loadTabData = async () => {
      try {
        if (activeTab === "loans" && loans.length === 0) {
          const data = await borrowersApi.getLoans(id);
          setLoans(data);
        } else if (activeTab === "reports" && farmReports.length === 0) {
          const data = await borrowersApi.getFarmReports(id);
          setFarmReports(data);
        } else if (activeTab === "farmscore" && !farmScore) {
          const data = await borrowersApi.getFarmScore(id);
          setFarmScore(data);
        } else if (activeTab === "documents" && documents.length === 0) {
          const data = await borrowersApi.getDocuments(id);
          setDocuments(data);
        } else if (activeTab === "activity" && activity.length === 0) {
          const data = await borrowersApi.getActivity(id);
          setActivity(data);
        }
      } catch (err) {
        console.error(`Failed to load ${activeTab} data:`, err);
      }
    };
    loadTabData();
  }, [activeTab, borrower, id, loans.length, farmReports.length, farmScore, documents.length, activity.length]);

  const handleFlag = async () => {
    if (!flagReason) return;
    setSubmitting(true);
    try {
      await borrowersApi.flag(id, { reason: flagReason, severity: flagSeverity });
      setShowFlagModal(false);
      setFlagReason("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to flag borrower");
    } finally {
      setSubmitting(false);
    }
  };

  const handleBlacklist = async () => {
    if (!blacklistReason) return;
    setSubmitting(true);
    try {
      await borrowersApi.blacklist(id, { reason: blacklistReason, durationMonths: blacklistDuration });
      setShowBlacklistModal(false);
      router.refresh();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to blacklist borrower");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <RefreshCw size={24} className="animate-spin text-[var(--muted)]" />
      </div>
    );
  }

  if (error || !borrower) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <AlertTriangle size={32} className="text-red-600 mx-auto mb-2" />
          <p className="text-red-700 dark:text-red-300">{error || "Borrower not found"}</p>
          <Link href="/lender/borrowers" className="text-sm underline mt-2 inline-block">
            Back to Borrowers
          </Link>
        </div>
      </div>
    );
  }

  const fullName = `${borrower.user.firstName} ${borrower.user.lastName}`;
  const initials = fullName.split(" ").map((n) => n[0]).join("").toUpperCase();
  const tierStyle = FARM_SCORE_TIERS[borrower.farmScoreTier] || FARM_SCORE_TIERS.POOR;
  const cropStyle = cropColors[borrower.primaryCrop] || { bg: "#f3f4f6", color: "#6b7280" };
  const isBlacklisted = borrower.farmScoreTier === "BLACKLISTED";

  const tabs: { key: TabKey; label: string; icon: React.ElementType }[] = [
    { key: "overview", label: "Overview", icon: User },
    { key: "loans", label: "Loans", icon: DollarSign },
    { key: "reports", label: "Farm Reports", icon: Leaf },
    { key: "farmscore", label: "FarmScore", icon: TrendingUp },
    { key: "documents", label: "Documents", icon: FileText },
    { key: "activity", label: "Activity", icon: Clock },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/lender/borrowers" className="p-2 hover:bg-[var(--surface)] rounded-lg border border-[var(--border)]">
          <ArrowLeft size={20} className="text-[var(--muted)]" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-brand-green flex items-center justify-center text-white font-bold text-xl">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-[var(--text)]">{fullName}</h1>
                <span className={`text-xs font-bold px-2 py-0.5 rounded ${tierStyle.bg} ${tierStyle.color}`}>
                  {tierStyle.label}
                </span>
                {isBlacklisted && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-100 text-red-700">BLACKLISTED</span>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-[var(--muted)] mt-1">
                <span className="font-mono">{borrower.farmerId}</span>
                <span className="flex items-center gap-1"><MapPin size={12} /> {borrower.lga}, {borrower.state}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <p className={`text-4xl font-black ${
              borrower.farmScore >= 700 ? "text-green-600" :
              borrower.farmScore >= 500 ? "text-yellow-600" :
              "text-red-600"
            }`}>
              {borrower.farmScore}
            </p>
            <p className="text-xs text-[var(--muted)]">FarmScore</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setShowFlagModal(true)}>
              <Flag size={14} className="mr-1" /> Flag
            </Button>
            {!isBlacklisted && (
              <Button variant="secondary" className="text-red-600" onClick={() => setShowBlacklistModal(true)}>
                <Ban size={14} className="mr-1" /> Blacklist
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-sm text-[var(--muted)] mb-1">Total Loans</p>
          <p className="text-xl font-bold text-[var(--text)]">{borrower._count?.loans || borrower.loans?.length || 0}</p>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-sm text-[var(--muted)] mb-1">Farm Size</p>
          <p className="text-xl font-bold text-[var(--text)]">{borrower.farmSizeHa} ha</p>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-sm text-[var(--muted)] mb-1">Primary Crop</p>
          <span className="text-sm font-bold px-2 py-0.5 rounded" style={{ background: cropStyle.bg, color: cropStyle.color }}>
            {borrower.primaryCrop}
          </span>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-sm text-[var(--muted)] mb-1">Experience</p>
          <p className="text-xl font-bold text-[var(--text)]">{borrower.yearsExperience} years</p>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
          <p className="text-sm text-[var(--muted)] mb-1">KYC Status</p>
          <div className="flex gap-2 mt-1">
            <span className={`flex items-center gap-1 text-xs ${borrower.bvnVerified ? "text-green-600" : "text-red-600"}`}>
              {borrower.bvnVerified ? <CheckCircle size={12} /> : <XCircle size={12} />} BVN
            </span>
            <span className={`flex items-center gap-1 text-xs ${borrower.ninVerified ? "text-green-600" : "text-red-600"}`}>
              {borrower.ninVerified ? <CheckCircle size={12} /> : <XCircle size={12} />} NIN
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-[var(--border)]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                activeTab === tab.key
                  ? "text-brand-green border-brand-green"
                  : "text-[var(--muted)] border-transparent hover:text-[var(--text)]"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
        {activeTab === "overview" && (
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-[var(--muted)] uppercase mb-3">Personal Information</h3>
              <div className="space-y-3">
                <InfoRow icon={Mail} label="Email" value={borrower.user.email} />
                <InfoRow icon={Phone} label="Phone" value={borrower.user.phone || "—"} />
                <InfoRow icon={MapPin} label="Address" value={borrower.address || `${borrower.lga}, ${borrower.state}`} />
                <InfoRow icon={Calendar} label="Joined" value={new Date(borrower.createdAt).toLocaleDateString()} />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--muted)] uppercase mb-3">Farm Details</h3>
              <div className="space-y-3">
                <InfoRow icon={Leaf} label="Primary Crop" value={borrower.primaryCrop} />
                <InfoRow icon={Leaf} label="Secondary Crops" value={borrower.secondaryCrops?.join(", ") || "—"} />
                <InfoRow icon={MapPin} label="Farm Size" value={`${borrower.farmSizeHa} hectares`} />
                {borrower.farmLatitude && borrower.farmLongitude && (
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-[var(--muted)]" />
                    <a
                      href={`https://maps.google.com/?q=${borrower.farmLatitude},${borrower.farmLongitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-brand-green hover:underline"
                    >
                      View on Map
                    </a>
                  </div>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--muted)] uppercase mb-3">Bank Details</h3>
              <div className="space-y-3">
                <InfoRow icon={DollarSign} label="Bank" value={borrower.bankName || "—"} />
                <InfoRow icon={DollarSign} label="Account" value={borrower.bankAccount || "—"} />
              </div>
            </div>
            {borrower.cooperative && (
              <div>
                <h3 className="text-sm font-semibold text-[var(--muted)] uppercase mb-3">Cooperative</h3>
                <p className="text-sm text-[var(--text)]">{borrower.cooperative.name}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "loans" && (
          <div>
            <h3 className="text-sm font-semibold text-[var(--muted)] uppercase mb-4">Loan History</h3>
            {loans.length === 0 ? (
              <p className="text-sm text-[var(--muted)] text-center py-8">No loans found</p>
            ) : (
              <div className="space-y-4">
                {loans.map((loan) => (
                  <div key={loan.id} className="p-4 bg-[var(--background)] rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-[var(--text)]">{loan.program?.name}</p>
                        <p className="text-xs text-[var(--muted)]">{loan.id.slice(0, 12)}</p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded ${
                        loan.status === "ACTIVE" ? "bg-green-100 text-green-700" :
                        loan.status === "COMPLETED" ? "bg-blue-100 text-blue-700" :
                        loan.status === "DEFAULTED" ? "bg-red-100 text-red-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>
                        {loan.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-[var(--muted)]">Amount</p>
                        <p className="font-semibold">₦{loan.amount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[var(--muted)]">Disbursed</p>
                        <p className="font-semibold text-blue-600">₦{(loan.totalDisbursed || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[var(--muted)]">Repaid</p>
                        <p className="font-semibold text-green-600">₦{(loan.totalRepaid || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[var(--muted)]">Outstanding</p>
                        <p className="font-semibold text-orange-600">₦{(loan.outstandingBalance || 0).toLocaleString()}</p>
                      </div>
                    </div>
                    <Link href={`/lender/loans/${loan.id}`} className="text-xs text-brand-green hover:underline mt-2 inline-block">
                      View Details →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "reports" && (
          <div>
            <h3 className="text-sm font-semibold text-[var(--muted)] uppercase mb-4">Farm Reports</h3>
            {farmReports.length === 0 ? (
              <p className="text-sm text-[var(--muted)] text-center py-8">No farm reports found</p>
            ) : (
              <div className="space-y-4">
                {farmReports.map((report) => (
                  <div key={report.id} className="p-4 bg-[var(--background)] rounded-lg flex items-start gap-4">
                    <div className="w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                      <Camera size={24} className="text-[var(--muted)]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-[var(--text)]">{report.cropStage}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          report.status === "VERIFIED" ? "bg-green-100 text-green-700" :
                          report.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {report.status}
                        </span>
                      </div>
                      {report.notes && <p className="text-sm text-[var(--muted)] mb-1">{report.notes}</p>}
                      <p className="text-xs text-[var(--muted)]">
                        {new Date(report.createdAt).toLocaleDateString()}
                        {report.verifiedBy && ` • Verified by ${report.verifiedBy.user.firstName} ${report.verifiedBy.user.lastName}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "farmscore" && (
          <div>
            <div className="flex items-center gap-8 mb-6">
              <div className="text-center">
                <p className={`text-6xl font-black ${
                  borrower.farmScore >= 700 ? "text-green-600" :
                  borrower.farmScore >= 500 ? "text-yellow-600" :
                  "text-red-600"
                }`}>
                  {borrower.farmScore}
                </p>
                <span className={`text-sm font-bold px-3 py-1 rounded ${tierStyle.bg} ${tierStyle.color}`}>
                  {tierStyle.label}
                </span>
              </div>
              {farmScore && (
                <div className="flex-1 space-y-3">
                  <h3 className="text-sm font-semibold text-[var(--muted)] uppercase">Score Components</h3>
                  {Object.entries(farmScore.components).map(([key, value]) => (
                    <div key={key}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[var(--muted)] capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                        <span className="font-medium text-[var(--text)]">{value}</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                        <div className="h-full bg-brand-green rounded-full" style={{ width: `${Math.min(100, value)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {farmScore && farmScore.history.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-[var(--muted)] uppercase mb-3">Score History</h3>
                <div className="space-y-2">
                  {farmScore.history.slice(0, 6).map((entry, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-[var(--background)] rounded-lg">
                      <span className="text-sm text-[var(--muted)]">
                        {new Date(entry.calculatedAt).toLocaleDateString()}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[var(--text)]">{entry.score}</span>
                        {entry.previousScore && (
                          <span className={`text-xs ${entry.score > entry.previousScore ? "text-green-600" : "text-red-600"}`}>
                            {entry.score > entry.previousScore ? "+" : ""}{entry.score - entry.previousScore}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "documents" && (
          <div>
            <h3 className="text-sm font-semibold text-[var(--muted)] uppercase mb-4">Uploaded Documents</h3>
            {documents.length === 0 ? (
              <p className="text-sm text-[var(--muted)] text-center py-8">No documents found</p>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="p-4 bg-[var(--background)] rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText size={20} className="text-[var(--muted)]" />
                      <div>
                        <p className="font-medium text-sm text-[var(--text)]">{doc.fileName}</p>
                        <p className="text-xs text-[var(--muted)]">{doc.type} • {new Date(doc.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        doc.status === "VERIFIED" ? "bg-green-100 text-green-700" :
                        doc.status === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {doc.status}
                      </span>
                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-[var(--surface)] rounded">
                        <Download size={14} className="text-[var(--muted)]" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "activity" && (
          <div>
            <h3 className="text-sm font-semibold text-[var(--muted)] uppercase mb-4">Activity Timeline</h3>
            {activity.length === 0 ? (
              <p className="text-sm text-[var(--muted)] text-center py-8">No activity found</p>
            ) : (
              <div className="space-y-4">
                {activity.map((event, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${
                        event.type === "DISBURSEMENT" ? "bg-blue-500" :
                        event.type === "REPAYMENT" ? "bg-green-500" :
                        event.type === "APPLICATION_APPROVED" ? "bg-purple-500" :
                        event.type === "FARM_REPORT" ? "bg-yellow-500" :
                        "bg-gray-400"
                      }`} />
                      {idx < activity.length - 1 && <div className="w-0.5 flex-1 bg-[var(--border)]" />}
                    </div>
                    <div className="pb-4 flex-1">
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
                            ₦{event.amount.toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Flag Modal */}
      {showFlagModal && (
        <Modal onClose={() => setShowFlagModal(false)}>
          <h3 className="text-lg font-semibold text-[var(--text)] mb-4">Flag Borrower</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[var(--muted)] uppercase block mb-2">Severity</label>
              <div className="space-y-2">
                {FLAG_SEVERITIES.map((s) => (
                  <label key={s.value} className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="severity"
                      value={s.value}
                      checked={flagSeverity === s.value}
                      onChange={() => setFlagSeverity(s.value as any)}
                      className="mt-1"
                    />
                    <div>
                      <span className={`font-semibold ${s.color}`}>{s.label}</span>
                      <p className="text-xs text-[var(--muted)]">{s.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--muted)] uppercase block mb-1">Reason</label>
              <textarea
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm resize-none"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6 justify-end">
            <Button variant="secondary" onClick={() => setShowFlagModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleFlag} disabled={submitting || !flagReason}>
              {submitting ? "Flagging..." : "Flag Borrower"}
            </Button>
          </div>
        </Modal>
      )}

      {/* Blacklist Modal */}
      {showBlacklistModal && (
        <Modal onClose={() => setShowBlacklistModal(false)}>
          <h3 className="text-lg font-semibold text-[var(--text)] mb-4">Blacklist Borrower</h3>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-700 dark:text-red-300">
              <strong>Warning:</strong> Blacklisting will set FarmScore to 0 and prevent the borrower from applying to any program.
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[var(--muted)] uppercase block mb-1">Duration</label>
              <select
                value={blacklistDuration}
                onChange={(e) => setBlacklistDuration(e.target.value === "PERMANENT" ? "PERMANENT" : Number(e.target.value))}
                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm"
              >
                <option value={12}>12 months</option>
                <option value={24}>24 months</option>
                <option value={48}>48 months</option>
                <option value="PERMANENT">Permanent</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--muted)] uppercase block mb-1">Reason</label>
              <textarea
                value={blacklistReason}
                onChange={(e) => setBlacklistReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm resize-none"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6 justify-end">
            <Button variant="secondary" onClick={() => setShowBlacklistModal(false)}>Cancel</Button>
            <button
              onClick={handleBlacklist}
              disabled={submitting || !blacklistReason}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold disabled:opacity-50"
            >
              {submitting ? "Processing..." : "Blacklist Borrower"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={14} className="text-[var(--muted)]" />
      <span className="text-sm text-[var(--muted)]">{label}:</span>
      <span className="text-sm text-[var(--text)]">{value}</span>
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-[var(--surface)] rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
