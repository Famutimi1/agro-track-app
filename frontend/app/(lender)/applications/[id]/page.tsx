"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, User, MapPin, Phone, Mail, Calendar,
  FileText, CheckCircle, XCircle, Clock, AlertTriangle,
  TrendingUp, Camera, Download, MessageSquare, Flag
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const mockApplication = {
  id: "APP001",
  status: "SUBMITTED",
  submittedAt: "2025-06-20T10:30:00Z",
  amount: 500000,
  purpose: "Purchase of improved rice seedlings and fertilizers for the 2025 wet season planting.",

  borrower: {
    id: "BRW001",
    name: "Musa Garba",
    farmerId: "FRM-2024-001",
    phone: "+234 803 123 4567",
    email: "musa.garba@example.com",
    state: "Kebbi",
    lga: "Birnin Kebbi",
    address: "Plot 45, Irrigation Scheme, Argungu",
    bvnVerified: true,
    ninVerified: true,
    phoneVerified: true,
    avatar: "MG",
  },

  farm: {
    size: 2.5,
    primaryCrop: "Rice",
    secondaryCrops: ["Maize", "Vegetables"],
    yearsExperience: 8,
    hasIrrigation: true,
    soilType: "Clay loam",
    latitude: 12.4567,
    longitude: 4.2345,
    photos: ["/farm1.jpg", "/farm2.jpg"],
  },

  farmScore: {
    score: 720,
    tier: "GOLD",
    breakdown: {
      repaymentHistory: 85,
      farmProductivity: 78,
      creditUtilization: 72,
      reportConsistency: 68,
      cooperativeMembership: 100,
      yearsExperience: 80,
    },
  },

  program: {
    id: "PRG001",
    name: "CBN Rice Fund 2025",
    minAmount: 100000,
    maxAmount: 2000000,
    interestRate: 9,
    requiredScore: 500,
  },

  documents: [
    { name: "National ID Card", type: "ID_CARD", status: "VERIFIED", url: "#" },
    { name: "BVN Slip", type: "BVN_SLIP", status: "VERIFIED", url: "#" },
    { name: "Farm Photo 1", type: "FARM_PHOTO", status: "PENDING", url: "#" },
    { name: "Farm Photo 2", type: "FARM_PHOTO", status: "PENDING", url: "#" },
  ],

  previousLoans: [
    { id: "LN001", amount: 300000, status: "COMPLETED", repaymentRate: 100 },
    { id: "LN002", amount: 450000, status: "COMPLETED", repaymentRate: 100 },
  ],

  cooperative: {
    name: "Kebbi Rice Farmers Cooperative",
    role: "Member",
    memberSince: "2020-03-15",
  },
};

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [reviewNotes, setReviewNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  const app = mockApplication;
  const scoreColor = app.farmScore.score >= 750 ? "text-green-600" : app.farmScore.score >= 600 ? "text-blue-600" : "text-yellow-600";

  const handleApprove = () => {
    alert("Application approved! Loan will be created and first disbursement queued.");
    router.push("/applications");
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }
    alert("Application rejected.");
    router.push("/applications");
  };

  const handleMarkUnderReview = () => {
    alert("Application marked as Under Review");
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href="/applications" className="p-2 hover:bg-[var(--surface)] rounded-lg transition-colors">
            <ArrowLeft size={20} className="text-[var(--muted)]" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[var(--text)]">Application {app.id}</h1>
            <p className="text-sm text-[var(--muted)]">Submitted on {new Date(app.submittedAt).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {app.status === "SUBMITTED" && (
            <Button variant="secondary" onClick={handleMarkUnderReview}>
              <Clock size={16} className="mr-2" /> Mark Under Review
            </Button>
          )}
          {(app.status === "SUBMITTED" || app.status === "UNDER_REVIEW") && (
            <>
              <Button variant="secondary" onClick={() => setShowRejectModal(true)} className="text-red-600 border-red-200 hover:bg-red-50">
                <XCircle size={16} className="mr-2" /> Reject
              </Button>
              <Button variant="primary" onClick={handleApprove}>
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
                <p className="font-medium text-[var(--text)]">{app.program.name}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted)] mb-1">Requested Amount</p>
                <p className="text-2xl font-bold text-brand-green">₦{app.amount.toLocaleString()}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-[var(--muted)] mb-1">Purpose</p>
                <p className="text-[var(--text)]">{app.purpose}</p>
              </div>
            </div>
          </div>

          {/* Borrower Profile */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-[var(--text)] mb-4">Borrower Profile</h2>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-brand-green flex items-center justify-center text-white font-bold text-xl">
                {app.borrower.avatar}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[var(--text)]">{app.borrower.name}</h3>
                <p className="text-sm text-[var(--muted)]">{app.borrower.farmerId}</p>
                <div className="flex gap-4 mt-2">
                  {app.borrower.bvnVerified && (
                    <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded">
                      <CheckCircle size={12} /> BVN Verified
                    </span>
                  )}
                  {app.borrower.ninVerified && (
                    <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded">
                      <CheckCircle size={12} /> NIN Verified
                    </span>
                  )}
                  {app.borrower.phoneVerified && (
                    <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded">
                      <CheckCircle size={12} /> Phone Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-[var(--muted)]">
                <Phone size={14} /> {app.borrower.phone}
              </div>
              <div className="flex items-center gap-2 text-[var(--muted)]">
                <Mail size={14} /> {app.borrower.email}
              </div>
              <div className="flex items-center gap-2 text-[var(--muted)] col-span-2">
                <MapPin size={14} /> {app.borrower.address}, {app.borrower.lga}, {app.borrower.state}
              </div>
            </div>
          </div>

          {/* Farm Details */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-[var(--text)] mb-4">Farm Details</h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div>
                <p className="text-sm text-[var(--muted)] mb-1">Farm Size</p>
                <p className="font-semibold text-[var(--text)]">{app.farm.size} hectares</p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted)] mb-1">Primary Crop</p>
                <p className="font-semibold text-[var(--text)]">{app.farm.primaryCrop}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted)] mb-1">Experience</p>
                <p className="font-semibold text-[var(--text)]">{app.farm.yearsExperience} years</p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted)] mb-1">Irrigation</p>
                <p className="font-semibold text-[var(--text)]">{app.farm.hasIrrigation ? "Yes" : "No"}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted)] mb-1">Soil Type</p>
                <p className="font-semibold text-[var(--text)]">{app.farm.soilType}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--muted)] mb-1">GPS Location</p>
                <p className="font-semibold text-brand-green text-sm">{app.farm.latitude}, {app.farm.longitude}</p>
              </div>
            </div>

            {/* Farm Photos */}
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

          {/* Documents */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-[var(--text)] mb-4">Documents</h2>
            <div className="space-y-3">
              {app.documents.map((doc, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-[var(--background)] rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText size={18} className="text-[var(--muted)]" />
                    <div>
                      <p className="font-medium text-sm text-[var(--text)]">{doc.name}</p>
                      <p className="text-xs text-[var(--muted)]">{doc.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                      doc.status === "VERIFIED" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    }`}>
                      {doc.status}
                    </span>
                    <button className="text-brand-green hover:underline text-sm">
                      <Download size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
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
              <p className={`text-5xl font-black ${scoreColor}`}>{app.farmScore.score}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-brand-gold/20 text-brand-gold text-sm font-bold rounded-full">
                {app.farmScore.tier}
              </span>
            </div>
            <div className="space-y-3">
              {Object.entries(app.farmScore.breakdown).map(([key, value]) => (
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
          </div>

          {/* Previous Loans */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-[var(--text)] mb-4">Loan History</h2>
            {app.previousLoans.length > 0 ? (
              <div className="space-y-3">
                {app.previousLoans.map(loan => (
                  <div key={loan.id} className="p-3 bg-[var(--background)] rounded-lg">
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-sm text-[var(--text)]">₦{loan.amount.toLocaleString()}</span>
                      <span className="text-xs text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded">{loan.status}</span>
                    </div>
                    <p className="text-xs text-[var(--muted)]">Repayment Rate: {loan.repaymentRate}%</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--muted)]">No previous loans</p>
            )}
          </div>

          {/* Cooperative */}
          {app.cooperative && (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
              <h2 className="text-lg font-semibold text-[var(--text)] mb-4">Cooperative</h2>
              <p className="font-medium text-[var(--text)]">{app.cooperative.name}</p>
              <p className="text-sm text-[var(--muted)]">{app.cooperative.role} since {new Date(app.cooperative.memberSince).toLocaleDateString()}</p>
            </div>
          )}

          {/* Eligibility Check */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-green-800 dark:text-green-400 mb-4 flex items-center gap-2">
              <CheckCircle size={20} /> Eligibility Check
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <CheckCircle size={14} /> FarmScore ({app.farmScore.score}) ≥ Required ({app.program.requiredScore})
              </div>
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <CheckCircle size={14} /> Amount within program limits
              </div>
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <CheckCircle size={14} /> Identity verified (BVN + NIN)
              </div>
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <CheckCircle size={14} /> No active defaults
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--surface)] rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4">Reject Application</h3>
            <p className="text-sm text-[var(--muted)] mb-4">Please provide a reason for rejection. This will be shared with the applicant.</p>
            <textarea
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              placeholder="e.g., Farm size below minimum requirement, insufficient documentation..."
              className="w-full p-3 bg-[var(--background)] border border-[var(--border)] rounded-lg text-sm resize-none h-24 mb-4"
            />
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setShowRejectModal(false)}>Cancel</Button>
              <Button onClick={handleReject} className="bg-red-600 hover:bg-red-700 text-white">Confirm Rejection</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
