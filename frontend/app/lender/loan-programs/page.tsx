"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, Download, Search, Eye, MoreHorizontal, X, Check,
  Calendar, Lock, Unlock, Wheat, Pencil, Copy, Shield,
  BarChart2, ChevronLeft, ChevronRight, Clock, Users,
  DollarSign, TrendingUp, Play, Pause,
} from "lucide-react";
import { programsApi, type Program, type CreateProgramRequest } from "@/lib/api/programs";
import { programs as mockPrograms } from "@/lib/data/programs";

// ─── constants ────────────────────────────────────────────────────────────────
const STEPS = ["Basic Info", "Eligibility", "Loan Terms", "Disbursement", "Documents", "Review"];

const NIGERIAN_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Benue","Cross River","Delta",
  "Ekiti","Enugu","Gombe","Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi",
  "Kwara","Lagos","Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers",
  "Sokoto","Taraba","Yobe","Zamfara","FCT",
];

const CROP_OPTIONS = [
  "Rice","Cassava","Maize","Yam","Cocoa","Cashew","Sorghum","Wheat",
  "Tomato","Pepper","Oil Palm","Groundnut","Soybean","Cotton","Other",
];

const CROP_COLORS: Record<string, { bg: string; color: string }> = {
  Rice:       { bg: "#dcfce7", color: "#166534" },
  Cassava:    { bg: "#fef3c7", color: "#854d0e" },
  Maize:      { bg: "#dbeafe", color: "#1e40af" },
  Yam:        { bg: "#fed7aa", color: "#9a3412" },
  Cocoa:      { bg: "#d1fae5", color: "#065f46" },
  Cashew:     { bg: "#fce7f3", color: "#9d174d" },
  Tomato:     { bg: "#fee2e2", color: "#991b1b" },
  Pepper:     { bg: "#fef9c3", color: "#713f12" },
  Vegetables: { bg: "#d1fae5", color: "#065f46" },
  Sorghum:    { bg: "#ede9fe", color: "#5b21b6" },
  Wheat:      { bg: "#e0f2fe", color: "#0c4a6e" },
};

// Backend enum → display label
const PROGRAM_TYPE_LABEL: Record<string, string> = {
  CASH_LOAN:       "Loan",
  INPUT_CREDIT:    "Grant",
  EQUIPMENT_LEASE: "Hybrid",
  INSURANCE:       "Insurance",
};
// Display label → backend enum
const TYPE_LABEL_TO_ENUM: Record<string, CreateProgramRequest["type"]> = {
  Loan:      "CASH_LOAN",
  Grant:     "INPUT_CREDIT",
  Hybrid:    "EQUIPMENT_LEASE",
  Insurance: "INSURANCE",
};

// ─── display interface ────────────────────────────────────────────────────────
interface DisplayProgram {
  id: string | number;
  name: string;
  lender: string;
  type: string;              // "Loan" | "Grant" | "Hybrid" | "Insurance"
  status: string;            // "Active" | "Draft" | "Closed" | "Paused"
  totalPool: number;         // ₦M (maxAmount / 1_000_000)
  disbursed: number;         // ₦M
  borrowers: number;
  applications: number;
  states: number;
  interest: number;
  repayRate: number;
  cropTypes: string[];
  startDate: string;
  endDate: string;
  durationMonths: number;
  minAmount: number;         // raw ₦
  maxAmount: number;         // raw ₦
  requiredScore: number;
  maxBorrowers: number | null;
  gracePeriodDays: number;
  disbursementType: string;  // "FULL" | "TRANCHE"
  trancheCount: number;
  collateralRequired: boolean;
  insuranceRequired: boolean;
  requiredDocuments: string[];
  totalFund: number | null;    // total fund pool ₦M (separate from maxAmount per-borrower)
  minAge: number | null;
  maxAge: number | null;
  gender: string;              // "ALL" | "FEMALE" | "MALE" | "YOUTH"
  cooperative: string;         // "OPTIONAL" | "REQUIRED" | "NOT_REQUIRED"
  color: string;
  bgLight: string;
  layers: number;            // same as trancheCount for display
}

function typeColor(type: string, status: string) {
  if (status === "Closed" || status === "CLOSED") return "#6b7280";
  return { Grant: "#7c3aed", Hybrid: "#d97706", Insurance: "#0891b2" }[type] ?? "#16a34a";
}

function mapApiProgram(p: Program): DisplayProgram {
  const displayType  = PROGRAM_TYPE_LABEL[p.type] ?? "Loan";
  const displayStatus =
    p.status === "ACTIVE"  ? "Active"
    : p.status === "DRAFT" ? "Draft"
    : p.status === "PAUSED" ? "Paused"
    : "Closed";
  const color = typeColor(displayType, displayStatus);
  const maxAmt = typeof p.maxAmount === "string" ? parseFloat(p.maxAmount) : Number(p.maxAmount);
  const minAmt = typeof p.minAmount === "string" ? parseFloat(p.minAmount) : Number(p.minAmount);
  return {
    id: p.id,
    name: p.name,
    lender: p.lenderOrg?.name ?? "—",
    type: displayType,
    status: displayStatus,
    totalPool: Math.round(maxAmt / 1_000_000),
    disbursed: 0,
    borrowers: p._count?.loans ?? 0,
    applications: p._count?.applications ?? 0,
    states: p.targetStates.length,
    interest: p.interestRate,
    repayRate: 0,
    cropTypes: p.targetCrops,
    startDate: p.startDate
      ? new Date(p.startDate).toLocaleDateString("en-NG", { month: "short", year: "numeric" }) : "—",
    endDate: p.endDate
      ? new Date(p.endDate).toLocaleDateString("en-NG", { month: "short", year: "numeric" }) : "—",
    durationMonths: p.durationMonths,
    minAmount: minAmt,
    maxAmount: maxAmt,
    requiredScore: p.requiredScore,
    maxBorrowers: p.maxBorrowers ?? null,
    gracePeriodDays: p.gracePeriodDays,
    disbursementType: p.disbursementType,
    trancheCount: p.trancheCount,
    collateralRequired: p.collateralRequired,
    insuranceRequired: p.insuranceRequired,
    requiredDocuments: p.requiredDocuments ?? [],
    totalFund: p.totalFund != null ? (typeof p.totalFund === "string" ? parseFloat(p.totalFund) : Number(p.totalFund)) / 1_000_000 : null,
    minAge: p.minAge ?? null,
    maxAge: p.maxAge ?? null,
    gender: p.gender ?? "ALL",
    cooperative: p.cooperative ?? "OPTIONAL",
    color,
    bgLight: { Grant: "#ede9fe", Hybrid: "#fef3c7", Insurance: "#e0f2fe" }[displayType] ?? "#dcfce7",
    layers: p.trancheCount,
  };
}

// Mock programs also typed as DisplayProgram via cast (mock data doesn't have all fields)
function coerceMock(p: typeof mockPrograms[0]): DisplayProgram {
  return {
    ...p,
    id: p.id,
    applications: 0,
    startDate: "—",
    endDate: p.deadline,
    durationMonths: 12,
    minAmount: 50_000,
    maxAmount: p.totalPool * 1_000_000,
    requiredScore: 0,
    maxBorrowers: null,
    gracePeriodDays: 30,
    disbursementType: "TRANCHE",
    trancheCount: p.layers,
    collateralRequired: false,
    insuranceRequired: false,
    requiredDocuments: ["BVN", "NIN", "Farm Photos"],
    totalFund: null,
    minAge: null,
    maxAge: null,
    gender: "ALL",
    cooperative: "OPTIONAL",
  } as DisplayProgram;
}

// ─── CSV export ───────────────────────────────────────────────────────────────
function exportCSV(data: DisplayProgram[]) {
  const headers = [
    "Name","Lender","Type","Status",
    "Total Fund (₦M)","Max Amount (₦)","Min Amount (₦)","Interest %","Duration (months)",
    "Grace (days)","Disbursement","Tranches","Min FarmScore",
    "Max Borrowers","Collateral","Insurance","Required Documents",
    "Min Age","Max Age","Gender Focus","Cooperative",
    "Borrowers","Applications","States","Crops",
    "Start Date","End Date",
  ];
  const rows = data.map(p => [
    `"${p.name}"`, `"${p.lender}"`, p.type, p.status,
    p.totalFund ?? "—", p.maxAmount, p.minAmount, p.interest, p.durationMonths,
    p.gracePeriodDays, p.disbursementType, p.trancheCount, p.requiredScore,
    p.maxBorrowers ?? "Unlimited",
    p.collateralRequired ? "Yes" : "No",
    p.insuranceRequired ? "Yes" : "No",
    `"${p.requiredDocuments.join("; ")}"`,
    p.minAge ?? "—", p.maxAge ?? "—", p.gender, p.cooperative,
    p.borrowers, p.applications, p.states,
    `"${p.cropTypes.join(", ")}"`,
    p.startDate, p.endDate,
  ]);
  const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = "loan-programs.csv"; a.click();
  URL.revokeObjectURL(url);
}

// ─── form state ───────────────────────────────────────────────────────────────
interface LayerDef { name: string; percent: string; trigger: string; proof: string }

interface FormState {
  // Step 0 — Basic Info
  name: string;
  description: string;
  type: string;          // display label: Loan | Grant | Hybrid | Insurance
  totalFund: string;     // total fund pool in ₦M
  maxBorrowers: string;
  startDate: string;
  endDate: string;
  // Step 1 — Eligibility
  states: string[];
  crops: string[];
  minAge: string;
  maxAge: string;
  gender: string;        // "ALL" | "FEMALE" | "MALE" | "YOUTH"
  cooperative: string;   // "OPTIONAL" | "REQUIRED" | "NOT_REQUIRED"
  // Step 2 — Loan Terms
  minLoan: string;
  maxLoan: string;
  interest: string;
  duration: string;
  graceDays: string;     // days (not months) → maps directly to gracePeriodDays
  requiredScore: string;
  disbursementType: string;  // "TRANCHE" | "FULL"
  insuranceRequired: boolean;
  collateralRequired: boolean;
  // Step 3 — Disbursement layers
  layers: LayerDef[];
  // Step 4 — Documents (stored in requiredDocuments[])
  requiredDocuments: string[];
}

const DEFAULT_FORM: FormState = {
  name: "", description: "", type: "Loan",
  totalFund: "", maxBorrowers: "", startDate: "", endDate: "",
  states: [], crops: [],
  minAge: "", maxAge: "", gender: "ALL", cooperative: "OPTIONAL",
  minLoan: "", maxLoan: "", interest: "", duration: "12",
  graceDays: "30", requiredScore: "0",
  disbursementType: "TRANCHE",
  insuranceRequired: false, collateralRequired: false,
  layers: [
    { name: "Land Preparation",  percent: "30", trigger: "Loan Approval",            proof: "Farm photos + GPS" },
    { name: "Planting & Inputs", percent: "40", trigger: "Layer 1 report submitted", proof: "Input receipts + farm photos" },
    { name: "Crop Maintenance",  percent: "30", trigger: "Crop growth confirmed",     proof: "Agent visit + growth photos" },
  ],
  requiredDocuments: ["BVN", "NIN"],
};

const DOC_LIST = [
  { value: "BVN",              label: "BVN Verification",   desc: "Bank Verification Number",       alwaysOn: true  },
  { value: "NIN",              label: "NIN Verification",   desc: "National Identification Number", alwaysOn: true  },
  { value: "Farm Photos",      label: "Farm Photos",         desc: "Min 3 geotagged photos",         alwaysOn: false },
  { value: "Cooperative Letter",label: "Cooperative Letter", desc: "Membership proof letter",        alwaysOn: false },
  { value: "Bank Statement",   label: "Bank Statement",      desc: "Last 3 months",                  alwaysOn: false },
  { value: "Land Title",       label: "Land/Title Document", desc: "C of O or community letter",     alwaysOn: false },
];

// ─── modal ────────────────────────────────────────────────────────────────────
function CreateProgramModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (p: DisplayProgram) => void;
}) {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const inp = "w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-green-600 transition-colors";

  const toggle = (field: "states" | "crops", val: string) =>
    setForm(f => ({
      ...f,
      [field]: f[field].includes(val) ? f[field].filter(v => v !== val) : [...f[field], val],
    }));

  function buildPayload(status: "DRAFT" | "ACTIVE"): CreateProgramRequest {
    return {
      name:            form.name,
      description:     form.description || form.name,
      type:            TYPE_LABEL_TO_ENUM[form.type],
      interestRate:    parseFloat(form.interest) || 0,
      maxAmount:       parseFloat(form.maxLoan) || 0,
      minAmount:       parseFloat(form.minLoan) || 0,
      durationMonths:  parseInt(form.duration) || 12,
      requiredScore:   parseInt(form.requiredScore) || 0,
      targetCrops:     form.crops,
      targetStates:    form.states,
      maxBorrowers:    form.maxBorrowers ? parseInt(form.maxBorrowers) : undefined,
      gracePeriodDays: parseInt(form.graceDays) || 0,
      disbursementType: form.disbursementType === "TRANCHE" ? "TRANCHE" : "FULL",
      trancheCount:    form.disbursementType === "TRANCHE" ? form.layers.length : 1,
      collateralRequired:  form.collateralRequired,
      insuranceRequired:   form.insuranceRequired,
      requiredDocuments:   form.requiredDocuments,
      totalFund:    form.totalFund ? parseFloat(form.totalFund) * 1_000_000 : undefined,
      minAge:       form.minAge ? parseInt(form.minAge) : undefined,
      maxAge:       form.maxAge ? parseInt(form.maxAge) : undefined,
      gender:       form.gender as CreateProgramRequest["gender"],
      cooperative:  form.cooperative as CreateProgramRequest["cooperative"],
      status,
      startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
      endDate:   form.endDate   ? new Date(form.endDate).toISOString()   : undefined,
    };
  }

  async function handleSaveDraft() {
    setSubmitting(true);
    setApiError(null);
    try {
      const created = await programsApi.create(buildPayload("DRAFT"));
      onCreated(mapApiProgram(created));
      onClose();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setApiError(msg ?? "Failed to save draft. Check required fields (name, loan amounts, interest).");
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePublish() {
    setSubmitting(true);
    setApiError(null);
    try {
      const created = await programsApi.create(buildPayload("ACTIVE"));
      onCreated(mapApiProgram(created));
      onClose();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setApiError(msg ?? "Failed to publish. Check all required fields.");
    } finally {
      setSubmitting(false);
    }
  }

  const renderStep = () => {
    switch (step) {

      // ── Step 0: Basic Info ─────────────────────────────────────────────────
      case 0: return (
        <div className="flex flex-col gap-4">
          <div>
            <label className="field-label">Program Name *</label>
            <input className={inp} placeholder="e.g. CBN Rice Farmers Support Fund 2025"
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="field-label">Description *</label>
            <textarea className={`${inp} min-h-[70px] resize-y`} placeholder="Who is this program for? What crops and regions does it target?"
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Program Type *</label>
              <select className={inp} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option>Loan</option><option>Grant</option><option>Hybrid</option><option>Insurance</option>
              </select>
            </div>
            <div>
              <label className="field-label">Total Fund Pool (₦M)</label>
              <input className={inp} type="number" step="0.1" placeholder="e.g. 500 = ₦500M"
                value={form.totalFund} onChange={e => setForm({ ...form, totalFund: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Max Borrowers</label>
              <input className={inp} type="number" placeholder="Unlimited"
                value={form.maxBorrowers} onChange={e => setForm({ ...form, maxBorrowers: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Start Date</label>
              <input className={inp} type="date" value={form.startDate}
                onChange={e => setForm({ ...form, startDate: e.target.value })} />
            </div>
            <div>
              <label className="field-label">End / Deadline Date</label>
              <input className={inp} type="date" value={form.endDate}
                onChange={e => setForm({ ...form, endDate: e.target.value })} />
            </div>
          </div>
        </div>
      );

      // ── Step 1: Eligibility ────────────────────────────────────────────────
      case 1: return (
        <div className="flex flex-col gap-5">
          {/* Borrower Demographics */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Min Borrower Age</label>
              <input className={inp} type="number" min={18} max={100} placeholder="18"
                value={form.minAge} onChange={e => setForm({ ...form, minAge: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Max Borrower Age</label>
              <input className={inp} type="number" min={18} max={100} placeholder="No limit"
                value={form.maxAge} onChange={e => setForm({ ...form, maxAge: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Gender Focus</label>
              <select className={inp} value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                <option value="ALL">All Genders</option>
                <option value="FEMALE">Female Only</option>
                <option value="MALE">Male Only</option>
                <option value="YOUTH">Youth (18–35)</option>
              </select>
            </div>
            <div>
              <label className="field-label">Cooperative Membership</label>
              <select className={inp} value={form.cooperative} onChange={e => setForm({ ...form, cooperative: e.target.value })}>
                <option value="OPTIONAL">Optional</option>
                <option value="REQUIRED">Required</option>
                <option value="NOT_REQUIRED">Not Required</option>
              </select>
            </div>
          </div>
          <div>
            <label className="field-label">Target States ({form.states.length} selected)</label>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {NIGERIAN_STATES.map(s => (
                <button key={s} type="button" onClick={() => toggle("states", s)}
                  className={`text-[11px] px-2.5 py-1 rounded-full border cursor-pointer transition-colors ${
                    form.states.includes(s)
                      ? "border-green-500 bg-green-50 text-green-700 font-semibold"
                      : "border-[var(--border)] text-[var(--muted)]"
                  }`}>{s}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="field-label">Eligible Crops ({form.crops.length} selected)</label>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {CROP_OPTIONS.map(c => (
                <button key={c} type="button" onClick={() => toggle("crops", c)}
                  className={`text-[11px] px-2.5 py-1 rounded-full border cursor-pointer transition-colors ${
                    form.crops.includes(c)
                      ? "border-blue-500 bg-blue-50 text-blue-700 font-semibold"
                      : "border-[var(--border)] text-[var(--muted)]"
                  }`}>{c}</button>
              ))}
            </div>
          </div>
        </div>
      );

      // ── Step 2: Loan Terms ─────────────────────────────────────────────────
      case 2: return (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Min Loan Amount (₦) *</label>
              <input className={inp} type="number" placeholder="50,000"
                value={form.minLoan} onChange={e => setForm({ ...form, minLoan: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Max Loan Amount (₦) *</label>
              <input className={inp} type="number" placeholder="2,000,000"
                value={form.maxLoan} onChange={e => setForm({ ...form, maxLoan: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Interest Rate % p.a. *</label>
              <input className={inp} type="number" step="0.1" placeholder={form.type === "Grant" ? "0" : "9"}
                value={form.interest} onChange={e => setForm({ ...form, interest: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Duration (months) *</label>
              <select className={inp} value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })}>
                {[3,6,9,12,18,24,36,48,60].map(m => <option key={m} value={m}>{m} months</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Grace Period (days)</label>
              <select className={inp} value={form.graceDays} onChange={e => setForm({ ...form, graceDays: e.target.value })}>
                {[0,14,30,60,90,180].map(d => <option key={d} value={d}>{d === 0 ? "None" : `${d} days`}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Min FarmScore Required</label>
              <input className={inp} type="number" min={0} max={850} placeholder="0 (any score)"
                value={form.requiredScore} onChange={e => setForm({ ...form, requiredScore: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Disbursement Method *</label>
              <select className={inp} value={form.disbursementType}
                onChange={e => setForm({ ...form, disbursementType: e.target.value })}>
                <option value="TRANCHE">Layered (Tranches)</option>
                <option value="FULL">Lump Sum</option>
              </select>
            </div>
          </div>
          {/* Toggles for collateral + insurance */}
          <div className="grid grid-cols-2 gap-3">
            {([
              { key: "collateralRequired" as const, label: "Collateral Required", desc: "Borrowers must provide land or asset collateral" },
              { key: "insuranceRequired"  as const, label: "Insurance Required",   desc: "Crop insurance must be in place before disbursement" },
            ] as const).map(({ key, label, desc }) => (
              <div key={key}
                onClick={() => setForm(f => ({ ...f, [key]: !f[key] }))}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  form[key]
                    ? "border-green-300 bg-green-50 dark:bg-green-900/20"
                    : "border-[var(--border)] bg-[var(--input-bg)]"
                }`}>
                <div className={`w-5 h-5 rounded-md border-2 flex-shrink-0 flex items-center justify-center mt-0.5 transition-colors ${
                  form[key] ? "border-green-600 bg-green-600" : "border-gray-300"
                }`}>
                  {form[key] && <Check size={11} color="#fff" />}
                </div>
                <div>
                  <p className="text-xs font-semibold text-[var(--text)]">{label}</p>
                  <p className="text-[10px] text-[var(--muted)] mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

      // ── Step 3: Disbursement layers ────────────────────────────────────────
      case 3: return (
        <div className="flex flex-col gap-3">
          {form.disbursementType === "FULL" ? (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-center">
              <p className="text-sm font-semibold text-[var(--text)] mb-1">Lump Sum disbursement selected</p>
              <p className="text-xs text-[var(--muted)]">The full amount will be disbursed in one payment. No layer configuration needed.</p>
            </div>
          ) : (
            <>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1">Why layered disbursement?</p>
                <p className="text-[11px] text-[var(--muted)]">Releasing funds in tranches tied to verified farm activity reduces diversion and improves repayment.</p>
              </div>
              {form.layers.map((layer, i) => {
                const cls = ["bg-green-100 text-green-700","bg-blue-100 text-blue-700","bg-amber-100 text-amber-700"][i] ?? "bg-gray-100 text-gray-600";
                return (
                  <div key={i} className="border border-[var(--border)] rounded-xl p-3.5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${cls}`}>{i+1}</span>
                      <span className="text-sm font-semibold text-[var(--text)]">Layer {i+1}</span>
                      <span className={`ml-auto text-sm font-bold ${cls.split(" ")[1]}`}>{layer.percent}%</span>
                    </div>
                    <div className="grid grid-cols-[1fr_72px] gap-2 mb-2">
                      <div>
                        <label className="text-[10px] text-[var(--muted)] uppercase block mb-1">Name</label>
                        <input className={inp} value={layer.name} onChange={e => {
                          const l = [...form.layers]; l[i] = { ...l[i], name: e.target.value };
                          setForm({ ...form, layers: l });
                        }} />
                      </div>
                      <div>
                        <label className="text-[10px] text-[var(--muted)] uppercase block mb-1">%</label>
                        <input className={inp} type="number" value={layer.percent} onChange={e => {
                          const l = [...form.layers]; l[i] = { ...l[i], percent: e.target.value };
                          setForm({ ...form, layers: l });
                        }} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-[var(--muted)] uppercase block mb-1">Release Trigger</label>
                        <input className={inp} value={layer.trigger} onChange={e => {
                          const l = [...form.layers]; l[i] = { ...l[i], trigger: e.target.value };
                          setForm({ ...form, layers: l });
                        }} />
                      </div>
                      <div>
                        <label className="text-[10px] text-[var(--muted)] uppercase block mb-1">Required Proof</label>
                        <input className={inp} value={layer.proof} onChange={e => {
                          const l = [...form.layers]; l[i] = { ...l[i], proof: e.target.value };
                          setForm({ ...form, layers: l });
                        }} />
                      </div>
                    </div>
                  </div>
                );
              })}
              <button type="button"
                onClick={() => setForm({ ...form, layers: [...form.layers, { name: "", percent: "", trigger: "", proof: "" }] })}
                className="border border-dashed border-[var(--border)] rounded-xl p-2.5 text-sm text-[var(--muted)] cursor-pointer flex items-center justify-center gap-2 hover:border-green-500 hover:text-green-600 transition-colors">
                <Plus size={14} /> Add layer
              </button>
            </>
          )}
        </div>
      );

      // ── Step 4: Documents ──────────────────────────────────────────────────
      case 4: return (
        <div className="flex flex-col gap-2">
          <p className="text-xs text-[var(--muted)] mb-1">
            Choose which documents borrowers must submit when applying to this program.
            These are saved to the program and shown to applicants.
          </p>
          {DOC_LIST.map(({ value, label, desc, alwaysOn }) => {
            const selected = form.requiredDocuments.includes(value);
            const toggle = () => {
              if (alwaysOn) return;
              setForm(f => ({
                ...f,
                requiredDocuments: selected
                  ? f.requiredDocuments.filter(d => d !== value)
                  : [...f.requiredDocuments, value],
              }));
            };
            return (
              <div key={value} onClick={toggle}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
                  alwaysOn ? "cursor-default" : "cursor-pointer"
                } ${
                  selected
                    ? "border-green-300 bg-green-50 dark:bg-green-900/20"
                    : "border-[var(--border)] bg-[var(--input-bg)]"
                }`}>
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                  selected ? "border-green-600 bg-green-600" : "border-gray-300 dark:border-gray-600"
                }`}>
                  {selected && <Check size={11} color="#fff" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[var(--text)]">{label}</span>
                    {alwaysOn && (
                      <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-semibold">REQUIRED</span>
                    )}
                  </div>
                  <p className="text-[11px] text-[var(--muted)] mt-0.5">{desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      );

      // ── Step 5: Review ─────────────────────────────────────────────────────
      case 5: return (
        <div className="flex flex-col gap-3">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-4">
            <p className="text-[11px] font-bold text-green-700 dark:text-green-400 uppercase mb-3">Program Summary</p>
            {[
              ["Name",           form.name || "—"],
              ["Type",           form.type],
              ["Total Fund Pool", form.totalFund ? `₦${Number(form.totalFund).toLocaleString()}M` : "—"],
              ["Start Date",     form.startDate || "—"],
              ["End / Deadline", form.endDate || "—"],
              ["Age Range",      form.minAge || form.maxAge ? `${form.minAge || "18"}–${form.maxAge || "no limit"}` : "All ages"],
              ["Gender Focus",   { ALL: "All Genders", FEMALE: "Female Only", MALE: "Male Only", YOUTH: "Youth (18–35)" }[form.gender] ?? form.gender],
              ["Cooperative",    { OPTIONAL: "Optional", REQUIRED: "Required", NOT_REQUIRED: "Not Required" }[form.cooperative] ?? form.cooperative],
              ["States",         form.states.length > 0 ? form.states.slice(0,3).join(", ") + (form.states.length > 3 ? ` +${form.states.length-3}` : "") : "—"],
              ["Crops",          form.crops.slice(0,4).join(", ") || "—"],
              ["Loan Range",     form.minLoan && form.maxLoan ? `₦${Number(form.minLoan).toLocaleString()} – ₦${Number(form.maxLoan).toLocaleString()}` : "—"],
              ["Interest",       form.interest ? `${form.interest}% p.a.` : form.type === "Grant" ? "0% (Grant)" : "—"],
              ["Duration",       `${form.duration} months`],
              ["Grace Period",   form.graceDays === "0" ? "None" : `${form.graceDays} days`],
              ["Min FarmScore",  form.requiredScore || "0 (any)"],
              ["Max Borrowers",  form.maxBorrowers || "Unlimited"],
              ["Disbursement",   form.disbursementType === "TRANCHE" ? `Layered — ${form.layers.length} tranches` : "Lump Sum"],
              ["Collateral",          form.collateralRequired ? "Required" : "Not required"],
              ["Insurance",           form.insuranceRequired  ? "Required" : "Not required"],
              ["Required Documents",  form.requiredDocuments.length > 0 ? form.requiredDocuments.join(", ") : "None selected"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-1.5 border-b border-green-100 dark:border-green-800 last:border-0">
                <span className="text-xs text-[var(--muted)]">{k}</span>
                <span className="text-xs font-semibold text-[var(--text)] text-right max-w-[220px]">{v}</span>
              </div>
            ))}
          </div>
          {apiError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-xl">
              <p className="text-xs text-red-600 dark:text-red-400">{apiError}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2.5">
            <button type="button" disabled={submitting} onClick={handleSaveDraft}
              className="py-2.5 rounded-xl border border-[var(--border)] text-sm text-[var(--muted)] bg-[var(--input-bg)] cursor-pointer disabled:opacity-50 hover:border-amber-400 hover:text-amber-700 transition-colors">
              {submitting ? "Saving..." : "Save as Draft"}
            </button>
            <button type="button" disabled={submitting} onClick={handlePublish}
              className="py-2.5 rounded-xl bg-[#1B5E20] text-white text-sm font-semibold cursor-pointer disabled:opacity-60 hover:bg-green-800 transition-colors">
              {submitting ? "Publishing..." : "Publish Program"}
            </button>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--surface)] rounded-2xl w-full max-w-[580px] max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <div>
            <h2 className="text-base font-bold text-[var(--text)]">Create New Program</h2>
            <p className="text-xs text-[var(--muted)] mt-0.5">Step {step+1} of {STEPS.length} — {STEPS[step]}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] cursor-pointer">
            <X size={15} />
          </button>
        </div>
        <div className="px-6 py-3 border-b border-[var(--border)]">
          <div className="flex gap-1">
            {STEPS.map((s, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1"
                style={{ cursor: i < step ? "pointer" : "default" }} onClick={() => i < step && setStep(i)}>
                <div className={`w-full h-1 rounded-full transition-colors ${i < step ? "bg-green-500" : i === step ? "bg-[#1B5E20]" : "bg-[var(--border)]"}`} />
                <span className={`text-[10px] whitespace-nowrap ${i === step ? "text-[#1B5E20] font-semibold" : "text-[var(--muted)]"}`}>{s}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{renderStep()}</div>
        <div className="px-6 py-3.5 border-t border-[var(--border)] flex gap-2.5">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)}
              className="flex-1 py-2.5 rounded-xl border border-[var(--border)] text-sm text-[var(--muted)] cursor-pointer hover:text-[var(--text)] flex items-center justify-center gap-1.5">
              <ChevronLeft size={14} /> Back
            </button>
          )}
          {step < STEPS.length - 1 && (
            <button onClick={() => setStep(step + 1)}
              className="flex-[2] py-2.5 rounded-xl bg-[#1B5E20] text-white text-sm font-semibold cursor-pointer hover:bg-green-800 flex items-center justify-center gap-1.5">
              Continue <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Edit Program Modal ───────────────────────────────────────────────────────
function EditProgramModal({
  program,
  onClose,
  onUpdated,
}: {
  program: DisplayProgram;
  onClose: () => void;
  onUpdated: (p: DisplayProgram) => void;
}) {
  const ENUM_TO_LABEL: Record<string, string> = {
    CASH_LOAN: "Loan", INPUT_CREDIT: "Grant", EQUIPMENT_LEASE: "Hybrid", INSURANCE: "Insurance",
  };

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    name:        program.name,
    description: "",
    type:        ENUM_TO_LABEL[
                   Object.entries(TYPE_LABEL_TO_ENUM).find(([, v]) => PROGRAM_TYPE_LABEL[v ?? ""] === program.type)?.[1] ?? "CASH_LOAN"
                 ] ?? program.type,
    totalFund:   program.totalFund != null ? String(program.totalFund) : "",
    maxBorrowers: program.maxBorrowers != null ? String(program.maxBorrowers) : "",
    startDate:   "",
    endDate:     "",
    states:      [],
    crops:       program.cropTypes,
    minAge:      program.minAge != null ? String(program.minAge) : "",
    maxAge:      program.maxAge != null ? String(program.maxAge) : "",
    gender:      program.gender,
    cooperative: program.cooperative,
    minLoan:     String(program.minAmount),
    maxLoan:     String(program.maxAmount),
    interest:    String(program.interest),
    duration:    String(program.durationMonths),
    graceDays:   String(program.gracePeriodDays),
    requiredScore: String(program.requiredScore),
    disbursementType: program.disbursementType,
    insuranceRequired: program.insuranceRequired,
    collateralRequired: program.collateralRequired,
    layers: DEFAULT_FORM.layers,
    requiredDocuments: program.requiredDocuments,
  });

  const inp = "w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-green-600 transition-colors";

  const toggle = (field: "states" | "crops", val: string) =>
    setForm(f => ({
      ...f,
      [field]: f[field].includes(val) ? f[field].filter(v => v !== val) : [...f[field], val],
    }));

  async function handleSave(status?: "DRAFT" | "ACTIVE") {
    if (typeof program.id !== "string") return;
    setSubmitting(true);
    setApiError(null);
    try {
      const patch: Partial<CreateProgramRequest> = {
        name:            form.name,
        description:     form.description || undefined,
        type:            TYPE_LABEL_TO_ENUM[form.type],
        interestRate:    parseFloat(form.interest) || undefined,
        maxAmount:       parseFloat(form.maxLoan) || undefined,
        minAmount:       parseFloat(form.minLoan) || undefined,
        durationMonths:  parseInt(form.duration) || undefined,
        requiredScore:   parseInt(form.requiredScore) || 0,
        targetCrops:     form.crops,
        targetStates:    form.states.length > 0 ? form.states : undefined,
        maxBorrowers:    form.maxBorrowers ? parseInt(form.maxBorrowers) : undefined,
        gracePeriodDays: parseInt(form.graceDays),
        disbursementType: form.disbursementType as "FULL" | "TRANCHE",
        trancheCount:    form.disbursementType === "TRANCHE" ? form.layers.length : 1,
        collateralRequired: form.collateralRequired,
        insuranceRequired:  form.insuranceRequired,
        requiredDocuments:  form.requiredDocuments,
        totalFund:    form.totalFund ? parseFloat(form.totalFund) * 1_000_000 : undefined,
        minAge:       form.minAge ? parseInt(form.minAge) : undefined,
        maxAge:       form.maxAge ? parseInt(form.maxAge) : undefined,
        gender:       form.gender as CreateProgramRequest["gender"],
        cooperative:  form.cooperative as CreateProgramRequest["cooperative"],
        ...(status ? { status } : {}),
      };
      const updated = await programsApi.update(program.id, patch);
      onUpdated(mapApiProgram(updated));
      onClose();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setApiError(msg ?? "Update failed. Please check all fields.");
    } finally {
      setSubmitting(false);
    }
  }

  const renderStep = () => {
    switch (step) {
      case 0: return (
        <div className="flex flex-col gap-4">
          <div>
            <label className="field-label">Program Name *</label>
            <input className={inp} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="field-label">Description</label>
            <textarea className={`${inp} min-h-[70px] resize-y`} value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Program Type</label>
              <select className={inp} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option>Loan</option><option>Grant</option><option>Hybrid</option><option>Insurance</option>
              </select>
            </div>
            <div>
              <label className="field-label">Total Fund Pool (₦M)</label>
              <input className={inp} type="number" step="0.1" value={form.totalFund}
                onChange={e => setForm({ ...form, totalFund: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Max Borrowers</label>
              <input className={inp} type="number" placeholder="Unlimited" value={form.maxBorrowers}
                onChange={e => setForm({ ...form, maxBorrowers: e.target.value })} />
            </div>
          </div>
        </div>
      );
      case 1: return (
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Min Age</label>
              <input className={inp} type="number" min={18} value={form.minAge}
                onChange={e => setForm({ ...form, minAge: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Max Age</label>
              <input className={inp} type="number" min={18} value={form.maxAge}
                onChange={e => setForm({ ...form, maxAge: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Gender Focus</label>
              <select className={inp} value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                <option value="ALL">All Genders</option>
                <option value="FEMALE">Female Only</option>
                <option value="MALE">Male Only</option>
                <option value="YOUTH">Youth (18–35)</option>
              </select>
            </div>
            <div>
              <label className="field-label">Cooperative</label>
              <select className={inp} value={form.cooperative} onChange={e => setForm({ ...form, cooperative: e.target.value })}>
                <option value="OPTIONAL">Optional</option>
                <option value="REQUIRED">Required</option>
                <option value="NOT_REQUIRED">Not Required</option>
              </select>
            </div>
          </div>
          <div>
            <label className="field-label">Eligible Crops ({form.crops.length} selected)</label>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {CROP_OPTIONS.map(c => (
                <button key={c} type="button" onClick={() => toggle("crops", c)}
                  className={`text-[11px] px-2.5 py-1 rounded-full border cursor-pointer transition-colors ${form.crops.includes(c) ? "border-blue-500 bg-blue-50 text-blue-700 font-semibold" : "border-[var(--border)] text-[var(--muted)]"}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>
      );
      case 2: return (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Min Loan (₦)</label>
              <input className={inp} type="number" value={form.minLoan}
                onChange={e => setForm({ ...form, minLoan: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Max Loan (₦)</label>
              <input className={inp} type="number" value={form.maxLoan}
                onChange={e => setForm({ ...form, maxLoan: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Interest Rate %</label>
              <input className={inp} type="number" step="0.1" value={form.interest}
                onChange={e => setForm({ ...form, interest: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Duration (months)</label>
              <select className={inp} value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })}>
                {[3,6,9,12,18,24,36,48,60].map(m => <option key={m} value={m}>{m} months</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Grace Period (days)</label>
              <select className={inp} value={form.graceDays} onChange={e => setForm({ ...form, graceDays: e.target.value })}>
                {[0,14,30,60,90,180].map(d => <option key={d} value={d}>{d === 0 ? "None" : `${d} days`}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Min FarmScore</label>
              <input className={inp} type="number" min={0} max={850} value={form.requiredScore}
                onChange={e => setForm({ ...form, requiredScore: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Disbursement Method</label>
              <select className={inp} value={form.disbursementType} onChange={e => setForm({ ...form, disbursementType: e.target.value })}>
                <option value="TRANCHE">Layered (Tranches)</option>
                <option value="FULL">Lump Sum</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {([
              { key: "collateralRequired" as const, label: "Collateral Required" },
              { key: "insuranceRequired"  as const, label: "Insurance Required"  },
            ] as const).map(({ key, label }) => (
              <div key={key} onClick={() => setForm(f => ({ ...f, [key]: !f[key] }))}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${form[key] ? "border-green-300 bg-green-50" : "border-[var(--border)]"}`}>
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${form[key] ? "border-green-600 bg-green-600" : "border-gray-300"}`}>
                  {form[key] && <Check size={11} color="#fff" />}
                </div>
                <span className="text-xs font-semibold text-[var(--text)]">{label}</span>
              </div>
            ))}
          </div>
        </div>
      );
      case 3: return (
        <div className="flex flex-col gap-2">
          {DOC_LIST.map(({ value, label, desc, alwaysOn }) => {
            const selected = form.requiredDocuments.includes(value);
            const toggleDoc = () => {
              if (alwaysOn) return;
              setForm(f => ({
                ...f,
                requiredDocuments: selected
                  ? f.requiredDocuments.filter(d => d !== value)
                  : [...f.requiredDocuments, value],
              }));
            };
            return (
              <div key={value} onClick={toggleDoc}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${alwaysOn ? "cursor-default" : "cursor-pointer"} ${selected ? "border-green-300 bg-green-50" : "border-[var(--border)]"}`}>
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${selected ? "border-green-600 bg-green-600" : "border-gray-300"}`}>
                  {selected && <Check size={11} color="#fff" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[var(--text)]">{label}</span>
                    {alwaysOn && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-semibold">REQUIRED</span>}
                  </div>
                  <p className="text-[11px] text-[var(--muted)] mt-0.5">{desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      );
      default: return null;
    }
  };

  const EDIT_STEPS = ["Basic Info", "Eligibility", "Loan Terms", "Documents"];

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--surface)] rounded-2xl w-full max-w-[580px] max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <div>
            <h2 className="text-base font-bold text-[var(--text)]">Edit Program</h2>
            <p className="text-xs text-[var(--muted)] mt-0.5">Step {step+1} of {EDIT_STEPS.length} — {EDIT_STEPS[step]}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--muted)] cursor-pointer">
            <X size={15} />
          </button>
        </div>
        <div className="px-6 py-3 border-b border-[var(--border)]">
          <div className="flex gap-1">
            {EDIT_STEPS.map((s, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1"
                style={{ cursor: i < step ? "pointer" : "default" }} onClick={() => i < step && setStep(i)}>
                <div className={`w-full h-1 rounded-full transition-colors ${i < step ? "bg-green-500" : i === step ? "bg-[#1B5E20]" : "bg-[var(--border)]"}`} />
                <span className={`text-[10px] whitespace-nowrap ${i === step ? "text-[#1B5E20] font-semibold" : "text-[var(--muted)]"}`}>{s}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{renderStep()}</div>
        {apiError && (
          <div className="px-6 pb-2">
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-xs text-red-600">{apiError}</p>
            </div>
          </div>
        )}
        <div className="px-6 py-3.5 border-t border-[var(--border)] flex gap-2.5">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)}
              className="flex-1 py-2.5 rounded-xl border border-[var(--border)] text-sm text-[var(--muted)] cursor-pointer flex items-center justify-center gap-1.5">
              <ChevronLeft size={14} /> Back
            </button>
          )}
          {step < EDIT_STEPS.length - 1 ? (
            <button onClick={() => setStep(step + 1)}
              className="flex-[2] py-2.5 rounded-xl bg-[#1B5E20] text-white text-sm font-semibold cursor-pointer hover:bg-green-800 flex items-center justify-center gap-1.5">
              Continue <ChevronRight size={14} />
            </button>
          ) : (
            <div className="flex-[2] grid grid-cols-2 gap-2">
              <button disabled={submitting} onClick={() => handleSave("DRAFT")}
                className="py-2.5 rounded-xl border border-[var(--border)] text-sm text-[var(--muted)] cursor-pointer disabled:opacity-50 hover:border-amber-400 hover:text-amber-700 transition-colors">
                {submitting ? "Saving…" : "Save Draft"}
              </button>
              <button disabled={submitting} onClick={() => handleSave("ACTIVE")}
                className="py-2.5 rounded-xl bg-[#1B5E20] text-white text-sm font-semibold cursor-pointer disabled:opacity-60 hover:bg-green-800 transition-colors">
                {submitting ? "Saving…" : "Save & Publish"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Program Card ─────────────────────────────────────────────────────────────
function ProgramCard({
  prog,
  onView,
  onEdit,
  onToggleStatus,
}: {
  prog: DisplayProgram;
  onView: () => void;
  onEdit: () => void;
  onToggleStatus: () => void;
}) {
  const pct = prog.totalPool > 0 ? Math.round((prog.disbursed / prog.totalPool) * 100) : 0;

  const statusCls = {
    Active: "bg-green-100 text-green-700",
    Draft:  "bg-amber-100 text-amber-700",
    Paused: "bg-orange-100 text-orange-700",
    Closed: "bg-gray-100 text-gray-500",
  }[prog.status] ?? "bg-gray-100 text-gray-500";

  const typeCls = {
    Loan:      "bg-blue-100 text-blue-700",
    Grant:     "bg-purple-100 text-purple-700",
    Hybrid:    "bg-pink-100 text-pink-700",
    Insurance: "bg-cyan-100 text-cyan-700",
  }[prog.type] ?? "bg-blue-100 text-blue-700";

  const fmtAmt = (n: number) =>
    n >= 1_000_000 ? `₦${(n/1_000_000).toFixed(1)}M` : `₦${(n/1000).toFixed(0)}K`;

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="h-1 cursor-pointer" style={{ background: prog.color }} onClick={onView} />
      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: prog.bgLight }}>
            <Wheat size={20} color={prog.color} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${statusCls}`}>
                {prog.status === "Active" ? "● " : ""}{prog.status.toUpperCase()}
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${typeCls}`}>{prog.type.toUpperCase()}</span>
              {prog.disbursementType === "TRANCHE" && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700">LAYERED</span>
              )}
            </div>
            <h3 onClick={onView} className="text-[13px] font-bold text-[var(--text)] leading-snug line-clamp-2 cursor-pointer hover:underline">{prog.name}</h3>
            <p className="text-[11px] text-[var(--muted)] mt-0.5">{prog.lender}</p>
          </div>
          <button className="w-7 h-7 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] flex-shrink-0 cursor-pointer">
            <MoreHorizontal size={14} />
          </button>
        </div>

        {/* 4-stat grid */}
        <div className="grid grid-cols-4 gap-1.5 mb-4">
          {[
            { icon: Users,       l: "Borrowers", v: prog.borrowers.toLocaleString(),         c: prog.color },
            { icon: TrendingUp,  l: "Apps",       v: prog.applications.toLocaleString(),      c: "#6b7280" },
            { icon: DollarSign,  l: "Interest",   v: prog.type === "Grant" ? "0%" : `${prog.interest}%`, c: prog.type === "Grant" ? "#7c3aed" : "#2563eb" },
            { icon: Clock,       l: "Duration",   v: `${prog.durationMonths}mo`,              c: "#6b7280" },
          ].map(({ l, v, c }) => (
            <div key={l} className="text-center py-2 px-1 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm font-bold" style={{ color: c }}>{v}</p>
              <p className="text-[10px] text-[var(--muted)]">{l}</p>
            </div>
          ))}
        </div>

        {/* Loan range + FarmScore row */}
        <div className="flex items-center gap-2 mb-3 px-1">
          {prog.totalFund != null && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-[var(--muted)] mb-0.5">Total Fund</p>
                <p className="text-xs font-semibold text-[var(--text)]">₦{prog.totalFund.toLocaleString()}M</p>
              </div>
              <div className="w-px h-8 bg-[var(--border)]" />
            </>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-[var(--muted)] mb-0.5">Loan Range</p>
            <p className="text-xs font-semibold text-[var(--text)]">
              {fmtAmt(prog.minAmount)} – {fmtAmt(prog.maxAmount)}
            </p>
          </div>
          <div className="w-px h-8 bg-[var(--border)]" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-[var(--muted)] mb-0.5">Min FarmScore</p>
            <p className="text-xs font-semibold" style={{ color: prog.requiredScore > 0 ? "#d97706" : "#16a34a" }}>
              {prog.requiredScore > 0 ? prog.requiredScore : "Any"}
            </p>
          </div>
          <div className="w-px h-8 bg-[var(--border)]" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-[var(--muted)] mb-0.5">Grace Period</p>
            <p className="text-xs font-semibold text-[var(--text)]">
              {prog.gracePeriodDays > 0 ? `${prog.gracePeriodDays}d` : "None"}
            </p>
          </div>
        </div>

        {/* Badges: states + collateral + insurance + max borrowers + gender + cooperative + age */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-[var(--muted)]">
            {prog.states} state{prog.states !== 1 ? "s" : ""}
          </span>
          {prog.collateralRequired && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 flex items-center gap-0.5">
              <Shield size={9} /> Collateral
            </span>
          )}
          {prog.insuranceRequired && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 flex items-center gap-0.5">
              <Shield size={9} /> Insurance
            </span>
          )}
          {prog.maxBorrowers && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
              Cap: {prog.maxBorrowers.toLocaleString()}
            </span>
          )}
          {prog.gender !== "ALL" && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-pink-50 text-pink-700">
              {{ FEMALE: "Female Only", MALE: "Male Only", YOUTH: "Youth" }[prog.gender] ?? prog.gender}
            </span>
          )}
          {prog.cooperative === "REQUIRED" && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-teal-50 text-teal-700">
              Cooperative Req.
            </span>
          )}
          {(prog.minAge != null || prog.maxAge != null) && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-orange-50 text-orange-700">
              Age {prog.minAge ?? 18}–{prog.maxAge ?? "∞"}
            </span>
          )}
        </div>

        {/* Fund utilisation progress */}
        <div className="mb-3">
          <div className="flex justify-between text-[11px] mb-1.5">
            <span className="text-[var(--muted)]">Fund utilisation</span>
            <span className="font-semibold text-[var(--text)]">₦{prog.disbursed}M / ₦{prog.totalPool}M ({pct}%)</span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct === 100 ? "#6b7280" : prog.color }} />
          </div>
        </div>

        {/* Tranche locks */}
        {prog.disbursementType === "TRANCHE" && (
          <div className="flex gap-1.5 mb-3">
            {Array.from({ length: prog.layers }).map((_, i) => {
              const released = prog.status !== "Draft" && (i === 0 || (i === 1 && pct > 30));
              return (
                <div key={i} className={`flex-1 flex items-center gap-1 px-2 py-1 rounded-md ${released ? "bg-green-50 dark:bg-green-900/30" : "bg-gray-50 dark:bg-gray-800"}`}>
                  {released ? <Unlock size={10} color="#16a34a" /> : <Lock size={10} className="text-gray-400" />}
                  <span className={`text-[10px] font-medium ${released ? "text-green-700" : "text-[var(--muted)]"}`}>L{i+1}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Crops + dates */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {prog.cropTypes.slice(0, 4).map(c => {
            const cc = CROP_COLORS[c] ?? { bg: "#f3f4f6", color: "#6b7280" };
            return <span key={c} className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: cc.bg, color: cc.color }}>{c}</span>;
          })}
          {prog.cropTypes.length > 4 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">+{prog.cropTypes.length - 4}</span>
          )}
          {prog.endDate && prog.endDate !== "—" && (
            <span className="ml-auto text-[10px] text-[var(--muted)] flex items-center gap-1">
              <Calendar size={10} /> {prog.endDate}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button onClick={onView}
            className="flex-1 py-2 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-80"
            style={{ borderColor: prog.color, color: prog.color }}>
            <Eye size={13} /> View
          </button>
          {prog.status === "Draft" && (
            <button onClick={onEdit}
              className="flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-80 text-white"
              style={{ background: prog.color }}>
              <Pencil size={13} /> Edit
            </button>
          )}
          {prog.status === "Active" && (
            <button onClick={onToggleStatus}
              className="flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-80 text-white bg-orange-500">
              <Pause size={13} /> Pause
            </button>
          )}
          {prog.status === "Paused" && (
            <button onClick={onToggleStatus}
              className="flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-80 text-white"
              style={{ background: prog.color }}>
              <Play size={13} /> Resume
            </button>
          )}
          {prog.status === "Closed" && (
            <button
              className="flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-80 bg-gray-100 text-gray-500">
              <Copy size={13} /> Duplicate
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LoanProgramsPage() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [editingProgram, setEditingProgram] = useState<DisplayProgram | null>(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [search, setSearch] = useState("");
  const [displayPrograms, setDisplayPrograms] = useState<DisplayProgram[]>(
    () => mockPrograms.map(coerceMock)
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    programsApi
      .list({ limit: 50 })
      .then(res => {
        if (res.data && res.data.length > 0) {
          setDisplayPrograms(res.data.map(mapApiProgram));
        }
      })
      .catch(() => { /* keep mock data */ })
      .finally(() => setLoading(false));
  }, []);

  async function handleToggleStatus(prog: DisplayProgram) {
    if (typeof prog.id !== "string") return;
    const next = prog.status === "Active" ? "PAUSED" : "ACTIVE";
    try {
      const updated = await programsApi.updateStatus(prog.id, next);
      setDisplayPrograms(prev => prev.map(p => p.id === prog.id ? mapApiProgram(updated) : p));
    } catch {
      // silently ignore — UI stays unchanged
    }
  }

  const filtered = displayPrograms.filter(p =>
    (filterStatus === "All" || p.status === filterStatus) &&
    (filterType   === "All" || p.type   === filterType) &&
    (p.name.toLowerCase().includes(search.toLowerCase()) || p.lender.toLowerCase().includes(search.toLowerCase()))
  );

  const stats = [
    { l: "Total Programs", v: displayPrograms.length,                                         c: "#1B5E20", bg: "#dcfce7" },
    { l: "Active",         v: displayPrograms.filter(p => p.status === "Active").length,       c: "#16a34a", bg: "#f0fdf4" },
    { l: "Total Pool",     v: `₦${displayPrograms.reduce((a,p) => a+p.totalPool, 0).toLocaleString()}M`, c: "#2563eb", bg: "#dbeafe" },
    { l: "Disbursed",      v: `₦${displayPrograms.reduce((a,p) => a+p.disbursed, 0).toLocaleString()}M`, c: "#7c3aed", bg: "#ede9fe" },
  ];

  return (
    <div className="p-6">
      <style>{`.field-label { display:block; font-size:11px; font-weight:600; text-transform:uppercase; color:var(--muted); margin-bottom:6px; letter-spacing:0.05em; }`}</style>

      {showModal && (
        <CreateProgramModal
          onClose={() => setShowModal(false)}
          onCreated={p => setDisplayPrograms(prev => [p, ...prev])}
        />
      )}

      {editingProgram && (
        <EditProgramModal
          program={editingProgram}
          onClose={() => setEditingProgram(null)}
          onUpdated={p => setDisplayPrograms(prev => prev.map(x => x.id === p.id ? p : x))}
        />
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-[22px] font-bold text-[var(--text)] mb-1">Loan Programs</h1>
          <p className="text-[13px] text-[var(--muted)]">Manage all active and upcoming funding programs</p>
        </div>
        <div className="flex gap-2.5">
          <button onClick={() => exportCSV(filtered)}
            className="flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)] cursor-pointer transition-colors">
            <Download size={13} /> Export
          </button>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl bg-[#F9A825] text-[#1B5E20] cursor-pointer hover:bg-yellow-400 transition-colors">
            <Plus size={15} /> New Program
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {stats.map(({ l, v, c, bg }) => (
          <div key={l} className="rounded-xl p-4" style={{ background: bg }}>
            <p className="text-[22px] font-bold mb-0.5" style={{ color: c }}>{v}</p>
            <p className="text-xs text-[var(--muted)]">{l}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--input-bg)] border border-[var(--border)] flex-1 min-w-[180px] max-w-xs">
          <Search size={14} className="text-[var(--muted)] flex-shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search programs..."
            className="bg-transparent border-none outline-none text-sm text-[var(--text)] flex-1 min-w-0" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {["All","Active","Draft","Paused","Closed"].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer border transition-colors ${
                filterStatus === s
                  ? "bg-[#1B5E20] text-white border-[#1B5E20]"
                  : "bg-[var(--surface)] text-[var(--muted)] border-[var(--border)]"
              }`}>{s}</button>
          ))}
        </div>
        <div className="w-px h-5 bg-[var(--border)]" />
        <div className="flex gap-1.5 flex-wrap">
          {["All","Loan","Grant","Hybrid","Insurance"].map(t => (
            <button key={t} onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer border transition-colors ${
                filterType === t
                  ? "bg-purple-600 text-white border-purple-600"
                  : "bg-[var(--surface)] text-[var(--muted)] border-[var(--border)]"
              }`}>{t}</button>
          ))}
        </div>
        <span className="ml-auto text-xs text-[var(--muted)]">
          {filtered.length} program{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-16 text-[var(--muted)] text-sm">Loading programs...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(p => (
            <ProgramCard
              key={p.id}
              prog={p}
              onView={() => router.push(`/lender/loan-programs/${p.id}`)}
              onEdit={() => setEditingProgram(p)}
              onToggleStatus={() => handleToggleStatus(p)}
            />
          ))}
          <button onClick={() => setShowModal(true)}
            className="border-2 border-dashed border-[var(--border)] rounded-2xl p-10 bg-transparent cursor-pointer flex flex-col items-center justify-center gap-3 min-h-[200px] hover:border-green-500 group transition-colors">
            <div className="w-11 h-11 rounded-xl bg-[var(--input-bg)] group-hover:bg-green-50 flex items-center justify-center transition-colors">
              <Plus size={22} className="text-[var(--muted)] group-hover:text-green-600 transition-colors" />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-[var(--text)]">Create New Program</p>
              <p className="text-xs text-[var(--muted)] mt-0.5">Set up a loan or grant program</p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
