"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/badge";
import { ScoreRing } from "@/components/ui/score-ring";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Phone, Calendar } from "lucide-react";
import Link from "next/link";
import { borrowers, cropColors } from "@/lib/data/borrowers";

const tabs = ["Overview", "Loan Details", "Reports", "Score History", "Activity"];

export default function BorrowerDetailPage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState("Overview");

  const borrower = borrowers.find((b) => b.id === params.id) || borrowers[0];

  return (
    <div>
      <Link href="/borrowers" className="inline-flex items-center gap-1 text-xs text-[var(--muted)] hover:text-[var(--text)] mb-4">
        <ArrowLeft size={12} /> Back to Borrowers
      </Link>

      {/* Header */}
      <Card className="mb-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-brand-gold flex items-center justify-center text-brand-green font-bold text-lg">
              {borrower.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--text)]">{borrower.name}</h1>
              <div className="flex items-center gap-3 text-xs text-[var(--muted)] mt-1">
                <span className="font-mono">{borrower.id}</span>
                <span className="flex items-center gap-1"><MapPin size={10} /> {borrower.state}, {borrower.lga}</span>
                <span className="flex items-center gap-1"><Phone size={10} /> {borrower.phone}</span>
                <span className="flex items-center gap-1"><Calendar size={10} /> Joined {borrower.joined}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusPill status={borrower.status} />
            <ScoreRing score={borrower.score} size={50} />
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-[var(--border)]">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2.5 text-xs font-semibold transition-colors cursor-pointer border-b-2 -mb-px ${
              activeTab === t
                ? "text-brand-green border-brand-green"
                : "text-[var(--muted)] border-transparent hover:text-[var(--text)]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {activeTab === "Overview" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <p className="text-[10px] text-[var(--muted)] uppercase mb-1">Loan Amount</p>
            <p className="text-lg font-bold text-[var(--text)]">{borrower.loan}</p>
          </Card>
          <Card>
            <p className="text-[10px] text-[var(--muted)] uppercase mb-1">Disbursed</p>
            <p className="text-lg font-bold text-[var(--text)]">{borrower.disbursed}</p>
          </Card>
          <Card>
            <p className="text-[10px] text-[var(--muted)] uppercase mb-1">Repaid</p>
            <p className="text-lg font-bold text-green-600">{borrower.repaid}</p>
          </Card>
          <Card>
            <p className="text-[10px] text-[var(--muted)] uppercase mb-1">Crop</p>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded"
              style={{
                background: cropColors[borrower.crop]?.bg || "#f3f4f6",
                color: cropColors[borrower.crop]?.color || "#6b7280",
              }}
            >
              {borrower.crop}
            </span>
          </Card>
          <Card>
            <p className="text-[10px] text-[var(--muted)] uppercase mb-1">Farm Size</p>
            <p className="text-lg font-bold text-[var(--text)]">{borrower.farm}</p>
          </Card>
          <Card>
            <p className="text-[10px] text-[var(--muted)] uppercase mb-1">Program</p>
            <p className="text-xs font-semibold text-[var(--text)]">{borrower.program}</p>
          </Card>
          <Card>
            <p className="text-[10px] text-[var(--muted)] uppercase mb-1">Last Report</p>
            <p className="text-xs font-semibold text-[var(--text)]">{borrower.lastReport}</p>
          </Card>
          <Card>
            <p className="text-[10px] text-[var(--muted)] uppercase mb-1">Layers</p>
            <div className="flex gap-1 mt-1">
              {borrower.layers.map((l, i) => (
                <div
                  key={i}
                  className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center ${
                    l ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === "Loan Details" && (
        <Card>
          <h3 className="text-sm font-bold text-[var(--text)] mb-3">Loan Information</h3>
          <p className="text-xs text-[var(--muted)]">
            Detailed loan terms and disbursement history for {borrower.name}.
          </p>
        </Card>
      )}

      {activeTab === "Reports" && (
        <Card>
          <h3 className="text-sm font-bold text-[var(--text)] mb-3">Farm Reports</h3>
          <p className="text-xs text-[var(--muted)]">
            All submitted farm reports from {borrower.name}.
          </p>
        </Card>
      )}

      {activeTab === "Score History" && (
        <Card>
          <h3 className="text-sm font-bold text-[var(--text)] mb-3">FarmScore History</h3>
          <div className="flex items-center gap-4">
            <ScoreRing score={borrower.score} size={100} />
            <div>
              <p className="text-sm text-[var(--text)]">Current Score: <strong>{borrower.score}</strong></p>
              <p className="text-xs text-[var(--muted)]">
                {borrower.score >= 750 ? "Platinum" : borrower.score >= 650 ? "Gold" : borrower.score >= 500 ? "Silver" : "Bronze"} Tier
              </p>
            </div>
          </div>
        </Card>
      )}

      {activeTab === "Activity" && (
        <Card>
          <h3 className="text-sm font-bold text-[var(--text)] mb-3">Activity Timeline</h3>
          <p className="text-xs text-[var(--muted)]">
            Recent activity for {borrower.name}.
          </p>
        </Card>
      )}
    </div>
  );
}
