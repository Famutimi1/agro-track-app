"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Wheat, Shield, Users, TrendingUp, Clock,
  DollarSign, Calendar, Lock, Unlock, FileText, CheckCircle,
  MapPin, Leaf, Pencil, Play, Pause, BarChart2, AlertCircle,
  Copy, XCircle, PieChart,
} from "lucide-react";
import { programsApi, type Program, type ProgramStats } from "@/lib/api/programs";

// ─── helpers ──────────────────────────────────────────────────────────────────
const PROGRAM_TYPE_LABEL: Record<string, string> = {
  CASH_LOAN: "Loan", INPUT_CREDIT: "Grant", EQUIPMENT_LEASE: "Hybrid", INSURANCE: "Insurance",
};

const CROP_COLORS: Record<string, { bg: string; color: string }> = {
  Rice:       { bg: "#dcfce7", color: "#166534" },
  Cassava:    { bg: "#fef3c7", color: "#854d0e" },
  Maize:      { bg: "#dbeafe", color: "#1e40af" },
  Yam:        { bg: "#fed7aa", color: "#9a3412" },
  Cocoa:      { bg: "#d1fae5", color: "#065f46" },
  Cashew:     { bg: "#fce7f3", color: "#9d174d" },
  Tomato:     { bg: "#fee2e2", color: "#991b1b" },
  Sorghum:    { bg: "#ede9fe", color: "#5b21b6" },
  Wheat:      { bg: "#e0f2fe", color: "#0c4a6e" },
};

function typeColor(type: string) {
  return { Grant: "#7c3aed", Hybrid: "#d97706", Insurance: "#0891b2" }[type] ?? "#16a34a";
}

function fmtAmt(n: number) {
  if (n >= 1_000_000_000) return `₦${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  return `₦${(n / 1000).toFixed(0)}K`;
}

function fmtDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" });
}

// ─── section card ─────────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
      <h3 className="text-xs font-bold uppercase text-[var(--muted)] tracking-wider mb-4">{title}</h3>
      {children}
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: React.ReactNode; accent?: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
      <span className="text-xs text-[var(--muted)]">{label}</span>
      <span className="text-xs font-semibold text-right" style={{ color: accent ?? "var(--text)" }}>{value}</span>
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────
export default function ProgramDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();

  const [program, setProgram] = useState<Program | null>(null);
  const [stats, setStats] = useState<ProgramStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [toggling, setToggling] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closing, setClosing] = useState(false);
  const [duplicating, setDuplicating] = useState(false);

  useEffect(() => {
    Promise.all([
      programsApi.getById(id),
      programsApi.getStats(id).catch(() => null),
    ])
      .then(([prog, statsData]) => {
        setProgram(prog);
        setStats(statsData);
      })
      .catch(() => setError("Program not found or you don't have access."))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleToggle() {
    if (!program) return;
    setToggling(true);
    try {
      const next = program.status === "ACTIVE" ? "PAUSED" : "ACTIVE";
      const updated = await programsApi.updateStatus(id, next);
      setProgram(updated);
    } finally {
      setToggling(false);
    }
  }

  async function handleClose(forceClose: boolean) {
    if (!program) return;
    setClosing(true);
    try {
      const updated = await programsApi.close(id, forceClose);
      setProgram(updated);
      setShowCloseModal(false);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to close program");
    } finally {
      setClosing(false);
    }
  }

  async function handleDuplicate() {
    if (!program) return;
    setDuplicating(true);
    try {
      const newProgram = await programsApi.duplicate(id);
      router.push(`/lender/loan-programs/${newProgram.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to duplicate program");
    } finally {
      setDuplicating(false);
    }
  }

  if (loading) return (
    <div className="p-6 flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-[var(--muted)]">Loading program…</p>
      </div>
    </div>
  );

  if (error || !program) return (
    <div className="p-6 flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-xs">
        <AlertCircle size={40} className="text-red-400 mx-auto mb-3" />
        <p className="text-sm font-semibold text-[var(--text)] mb-1">Program not found</p>
        <p className="text-xs text-[var(--muted)] mb-4">{error}</p>
        <button onClick={() => router.back()}
          className="px-4 py-2 rounded-xl bg-[#1B5E20] text-white text-sm cursor-pointer">
          Go Back
        </button>
      </div>
    </div>
  );

  const displayType   = PROGRAM_TYPE_LABEL[program.type] ?? "Loan";
  const color         = typeColor(displayType);
  const bgLight       = { Grant: "#ede9fe", Hybrid: "#fef3c7", Insurance: "#e0f2fe" }[displayType] ?? "#dcfce7";
  const maxAmt        = typeof program.maxAmount === "string" ? parseFloat(program.maxAmount) : Number(program.maxAmount);
  const minAmt        = typeof program.minAmount === "string" ? parseFloat(program.minAmount) : Number(program.minAmount);
  const totalFundRaw  = program.totalFund != null ? (typeof program.totalFund === "string" ? parseFloat(program.totalFund) : Number(program.totalFund)) : null;

  const statusCls: Record<string, string> = {
    ACTIVE:  "bg-green-100 text-green-700",
    DRAFT:   "bg-amber-100 text-amber-700",
    PAUSED:  "bg-orange-100 text-orange-700",
    CLOSED:  "bg-gray-100 text-gray-500",
  };
  const statusLabel: Record<string, string> = {
    ACTIVE: "Active", DRAFT: "Draft", PAUSED: "Paused", CLOSED: "Closed",
  };
  const typeCls: Record<string, string> = {
    Loan: "bg-blue-100 text-blue-700", Grant: "bg-purple-100 text-purple-700",
    Hybrid: "bg-pink-100 text-pink-700", Insurance: "bg-cyan-100 text-cyan-700",
  };
  const genderLabel: Record<string, string> = {
    ALL: "All Genders", FEMALE: "Female Only", MALE: "Male Only", YOUTH: "Youth (18–35)",
  };
  const cooperativeLabel: Record<string, string> = {
    OPTIONAL: "Optional", REQUIRED: "Required", NOT_REQUIRED: "Not Required",
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Back + actions */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--text)] cursor-pointer transition-colors">
          <ArrowLeft size={16} /> Back to Programs
        </button>
        <div className="flex gap-2">
          {program.status !== "CLOSED" && (
            <button onClick={() => router.push(`/lender/loan-programs/${id}/edit`)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--border)] text-sm text-[var(--muted)] cursor-pointer hover:text-[var(--text)] transition-colors">
              <Pencil size={14} /> Edit
            </button>
          )}
          {(program.status === "ACTIVE" || program.status === "PAUSED") && (
            <button disabled={toggling} onClick={handleToggle}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-60 transition-colors ${
                program.status === "ACTIVE"
                  ? "bg-orange-100 text-orange-700 hover:bg-orange-200"
                  : "bg-green-100 text-green-700 hover:bg-green-200"
              }`}>
              {program.status === "ACTIVE"
                ? <><Pause size={14} /> {toggling ? "Pausing…" : "Pause"}</>
                : <><Play size={14} /> {toggling ? "Resuming…" : "Resume"}</>}
            </button>
          )}
          {program.status === "DRAFT" && (
            <button disabled={toggling} onClick={handleToggle}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1B5E20] text-white text-sm font-semibold cursor-pointer disabled:opacity-60 hover:bg-green-800 transition-colors">
              <BarChart2 size={14} /> {toggling ? "Publishing…" : "Publish"}
            </button>
          )}
          <button disabled={duplicating} onClick={handleDuplicate}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[var(--border)] text-sm text-[var(--muted)] cursor-pointer hover:text-[var(--text)] transition-colors disabled:opacity-60">
            <Copy size={14} /> {duplicating ? "Duplicating…" : "Duplicate"}
          </button>
          {program.status !== "CLOSED" && program.status !== "DRAFT" && (
            <button onClick={() => setShowCloseModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-200 text-sm text-red-600 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
              <XCircle size={14} /> Close
            </button>
          )}
        </div>
      </div>

      {/* Hero */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden mb-6 shadow-sm">
        <div className="h-2" style={{ background: color }} />
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: bgLight }}>
              <Wheat size={28} color={color} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap gap-2 mb-2">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${statusCls[program.status] ?? "bg-gray-100 text-gray-500"}`}>
                  {program.status === "ACTIVE" && "● "}
                  {statusLabel[program.status] ?? program.status}
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${typeCls[displayType] ?? "bg-blue-100 text-blue-700"}`}>
                  {displayType.toUpperCase()}
                </span>
                {program.disbursementType === "TRANCHE" && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">LAYERED</span>
                )}
              </div>
              <h1 className="text-xl font-bold text-[var(--text)] leading-snug mb-1">{program.name}</h1>
              <p className="text-sm text-[var(--muted)]">{program.lenderOrg?.name ?? "—"}</p>
            </div>
          </div>
          {program.description && (
            <p className="mt-4 text-sm text-[var(--muted)] leading-relaxed border-t border-[var(--border)] pt-4">
              {program.description}
            </p>
          )}
          {/* Key stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            {[
              { icon: Users,      label: "Borrowers",   value: (program._count?.loans ?? 0).toLocaleString(),          color: color },
              { icon: TrendingUp, label: "Applications", value: (program._count?.applications ?? 0).toLocaleString(),  color: "#6b7280" },
              { icon: DollarSign, label: "Interest",     value: displayType === "Grant" ? "0%" : `${program.interestRate}%`, color: "#2563eb" },
              { icon: Clock,      label: "Duration",     value: `${program.durationMonths} months`,                    color: "#6b7280" },
            ].map(({ label, value, color: c }) => (
              <div key={label} className="text-center py-3 px-2 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <p className="text-lg font-bold" style={{ color: c }}>{value}</p>
                <p className="text-[11px] text-[var(--muted)]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Portfolio Performance */}
      {stats && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <PieChart size={18} className="text-[var(--muted)]" />
            <h3 className="text-xs font-bold uppercase text-[var(--muted)] tracking-wider">Portfolio Performance</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <p className="text-xl font-bold text-blue-600">{fmtAmt(stats.totalDisbursed)}</p>
              <p className="text-[11px] text-[var(--muted)]">Total Disbursed</p>
            </div>
            <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <p className="text-xl font-bold text-green-600">{fmtAmt(stats.totalRepaid)}</p>
              <p className="text-[11px] text-[var(--muted)]">Total Repaid</p>
            </div>
            <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
              <p className="text-xl font-bold text-orange-600">{stats.remainingFund != null ? fmtAmt(stats.remainingFund) : "—"}</p>
              <p className="text-[11px] text-[var(--muted)]">Remaining Fund</p>
            </div>
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
              <p className="text-xl font-bold text-purple-600">{stats.repaymentRate}%</p>
              <p className="text-[11px] text-[var(--muted)]">Repayment Rate</p>
            </div>
          </div>
          {/* Fund flow bar */}
          {stats.totalFund > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-xs mb-2">
                <span className="text-[var(--muted)]">Fund Utilization</span>
                <span className="font-medium text-[var(--text)]">
                  {Math.round((stats.totalDisbursed / stats.totalFund) * 100)}% deployed
                </span>
              </div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-blue-500"
                  style={{ width: `${Math.min(100, (stats.totalDisbursed / stats.totalFund) * 100)}%` }}
                />
                <div
                  className="h-full bg-green-500"
                  style={{ width: `${Math.min(100 - (stats.totalDisbursed / stats.totalFund) * 100, (stats.totalRepaid / stats.totalFund) * 100)}%` }}
                />
              </div>
              <div className="flex gap-4 mt-2 text-[10px]">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Disbursed</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Repaid</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-200" /> Available</span>
              </div>
            </div>
          )}
          {/* Loan status breakdown */}
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-[var(--border)]">
            <div>
              <p className="text-[10px] font-semibold uppercase text-[var(--muted)] mb-2">Applications</p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between"><span className="text-[var(--muted)]">Total</span><span className="font-semibold">{stats.applicationsByStatus.total}</span></div>
                <div className="flex justify-between"><span className="text-[var(--muted)]">Pending</span><span className="font-semibold text-yellow-600">{stats.applicationsByStatus.pending}</span></div>
                <div className="flex justify-between"><span className="text-[var(--muted)]">Approved</span><span className="font-semibold text-green-600">{stats.applicationsByStatus.approved}</span></div>
                <div className="flex justify-between"><span className="text-[var(--muted)]">Rejected</span><span className="font-semibold text-red-600">{stats.applicationsByStatus.rejected}</span></div>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase text-[var(--muted)] mb-2">Loans</p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between"><span className="text-[var(--muted)]">Total</span><span className="font-semibold">{stats.loansByStatus.total}</span></div>
                <div className="flex justify-between"><span className="text-[var(--muted)]">Active</span><span className="font-semibold text-green-600">{stats.loansByStatus.active}</span></div>
                <div className="flex justify-between"><span className="text-[var(--muted)]">Completed</span><span className="font-semibold text-blue-600">{stats.loansByStatus.completed}</span></div>
                <div className="flex justify-between"><span className="text-[var(--muted)]">Defaulted</span><span className="font-semibold text-red-600">{stats.loansByStatus.defaulted}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Two-column detail grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

        {/* Financials */}
        <Section title="Financial Terms">
          {totalFundRaw != null && (
            <Row label="Total Fund Pool" value={fmtAmt(totalFundRaw)} accent={color} />
          )}
          <Row label="Loan Range" value={`${fmtAmt(minAmt)} – ${fmtAmt(maxAmt)}`} />
          <Row label="Interest Rate" value={displayType === "Grant" ? "0% (Grant)" : `${program.interestRate}% p.a.`} accent={displayType === "Grant" ? "#7c3aed" : "#2563eb"} />
          <Row label="Duration" value={`${program.durationMonths} months`} />
          <Row label="Grace Period" value={program.gracePeriodDays > 0 ? `${program.gracePeriodDays} days` : "None"} />
          <Row label="Min FarmScore" value={program.requiredScore > 0 ? String(program.requiredScore) : "Any score"} accent={program.requiredScore > 0 ? "#d97706" : "#16a34a"} />
          <Row label="Max Borrowers" value={program.maxBorrowers ? program.maxBorrowers.toLocaleString() : "Unlimited"} />
        </Section>

        {/* Disbursement */}
        <Section title="Disbursement">
          <Row label="Method" value={program.disbursementType === "TRANCHE" ? "Layered Tranches" : "Lump Sum"} accent={color} />
          {program.disbursementType === "TRANCHE" && (
            <Row label="Number of Tranches" value={String(program.trancheCount)} />
          )}
          <Row label="Collateral" value={program.collateralRequired ? "Required" : "Not required"} accent={program.collateralRequired ? "#d97706" : "#16a34a"} />
          <Row label="Insurance" value={program.insuranceRequired ? "Required" : "Not required"} accent={program.insuranceRequired ? "#2563eb" : "#16a34a"} />
          <Row label="Start Date" value={fmtDate(program.startDate)} />
          <Row label="End Date"   value={fmtDate(program.endDate)} />
          <Row label="Created"    value={fmtDate(program.createdAt)} />
          {program.disbursementType === "TRANCHE" && (
            <div className="mt-3 pt-3 border-t border-[var(--border)]">
              <p className="text-[10px] font-semibold uppercase text-[var(--muted)] mb-2">Tranche Locks</p>
              <div className="flex gap-2 flex-wrap">
                {Array.from({ length: program.trancheCount }).map((_, i) => (
                  <div key={i} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold ${i === 0 ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-500"}`}>
                    {i === 0 ? <Unlock size={11} /> : <Lock size={11} />}
                    Layer {i + 1}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Section>

        {/* Eligibility */}
        <Section title="Eligibility Criteria">
          <Row label="Gender Focus"
            value={genderLabel[program.gender] ?? program.gender}
            accent={program.gender !== "ALL" ? "#db2777" : undefined} />
          <Row label="Cooperative"
            value={cooperativeLabel[program.cooperative] ?? program.cooperative}
            accent={program.cooperative === "REQUIRED" ? "#0d9488" : undefined} />
          {(program.minAge != null || program.maxAge != null) && (
            <Row label="Age Range"
              value={`${program.minAge ?? 18} – ${program.maxAge ?? "no limit"} years`}
              accent="#ea580c" />
          )}
          <div className="mt-3 pt-3 border-t border-[var(--border)]">
            <p className="text-[10px] font-semibold uppercase text-[var(--muted)] mb-2 flex items-center gap-1">
              <MapPin size={10} /> Target States ({program.targetStates.length})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {program.targetStates.length > 0
                ? program.targetStates.map(s => (
                    <span key={s} className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-[var(--muted)]">{s}</span>
                  ))
                : <span className="text-xs text-[var(--muted)]">All states</span>}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-[var(--border)]">
            <p className="text-[10px] font-semibold uppercase text-[var(--muted)] mb-2 flex items-center gap-1">
              <Leaf size={10} /> Target Crops ({program.targetCrops.length})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {program.targetCrops.length > 0
                ? program.targetCrops.map(c => {
                    const cc = CROP_COLORS[c] ?? { bg: "#f3f4f6", color: "#6b7280" };
                    return (
                      <span key={c} className="text-[11px] font-bold px-2 py-0.5 rounded"
                        style={{ background: cc.bg, color: cc.color }}>{c}</span>
                    );
                  })
                : <span className="text-xs text-[var(--muted)]">All crops</span>}
            </div>
          </div>
        </Section>

        {/* Required Documents */}
        <Section title="Required Documents">
          {program.requiredDocuments && program.requiredDocuments.length > 0 ? (
            <div className="flex flex-col gap-2">
              {program.requiredDocuments.map(doc => (
                <div key={doc} className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={13} color="#16a34a" />
                  </div>
                  <span className="text-sm font-medium text-[var(--text)]">{doc}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
              <FileText size={14} /> No documents required
            </div>
          )}
        </Section>
      </div>

      {/* Dates footer */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 flex flex-wrap gap-6">
        {[
          { icon: Calendar, label: "Program Start", value: fmtDate(program.startDate) },
          { icon: Calendar, label: "Program End",   value: fmtDate(program.endDate)   },
          { icon: Clock,    label: "Created",        value: fmtDate(program.createdAt) },
          { icon: Clock,    label: "Last Updated",   value: fmtDate(program.updatedAt) },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-2">
            <Icon size={14} className="text-[var(--muted)]" />
            <div>
              <p className="text-[10px] text-[var(--muted)]">{label}</p>
              <p className="text-xs font-semibold text-[var(--text)]">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Close Program Modal */}
      {showCloseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCloseModal(false)}>
          <div className="bg-[var(--surface)] rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4">Close Program</h3>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-700 dark:text-red-300">
                <strong>Warning:</strong> Closing this program will prevent new applications. Active loans will continue normally.
              </p>
            </div>
            {stats && stats.applicationsByStatus.pending > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  This program has <strong>{stats.applicationsByStatus.pending}</strong> pending applications. Use "Force Close" to auto-reject them.
                </p>
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCloseModal(false)}
                className="px-4 py-2 rounded-xl border border-[var(--border)] text-sm cursor-pointer"
              >
                Cancel
              </button>
              {stats && stats.applicationsByStatus.pending > 0 ? (
                <button
                  onClick={() => handleClose(true)}
                  disabled={closing}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold cursor-pointer disabled:opacity-60"
                >
                  {closing ? "Closing…" : "Force Close"}
                </button>
              ) : (
                <button
                  onClick={() => handleClose(false)}
                  disabled={closing}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold cursor-pointer disabled:opacity-60"
                >
                  {closing ? "Closing…" : "Close Program"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
