"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, ChevronLeft, ChevronRight, Check, Plus, X,
  AlertCircle, Wheat, Lock,
} from "lucide-react";
import { programsApi, type Program, type CreateProgramRequest } from "@/lib/api/programs";

const STEPS = ["Basic Info", "Eligibility", "Loan Terms", "Disbursement", "Documents", "Review"];

const NIGERIAN_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
  "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","Gombe","Imo","Jigawa",
  "Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa","Niger",
  "Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara","FCT",
];

const CROP_OPTIONS = [
  "Rice","Cassava","Maize","Yam","Cocoa","Cashew","Sorghum","Wheat",
  "Tomato","Pepper","Oil Palm","Groundnut","Soybean","Cotton","Other",
];

const PROGRAM_TYPE_LABEL: Record<string, string> = {
  CASH_LOAN: "Loan", INPUT_CREDIT: "Grant", EQUIPMENT_LEASE: "Hybrid", INSURANCE: "Insurance",
};
const TYPE_LABEL_TO_ENUM: Record<string, CreateProgramRequest["type"]> = {
  Loan: "CASH_LOAN", Grant: "INPUT_CREDIT", Hybrid: "EQUIPMENT_LEASE", Insurance: "INSURANCE",
};

const DOC_LIST = [
  { value: "BVN",              label: "BVN Verification",   desc: "Bank Verification Number",       alwaysOn: true  },
  { value: "NIN",              label: "NIN Verification",   desc: "National Identification Number", alwaysOn: true  },
  { value: "Farm Photos",      label: "Farm Photos",         desc: "Min 3 geotagged photos",         alwaysOn: false },
  { value: "Cooperative Letter",label: "Cooperative Letter", desc: "Membership proof letter",        alwaysOn: false },
  { value: "Bank Statement",   label: "Bank Statement",      desc: "Last 3 months",                  alwaysOn: false },
  { value: "Land Title",       label: "Land/Title Document", desc: "C of O or community letter",     alwaysOn: false },
];

interface LayerDef { name: string; percent: string; trigger: string; proof: string }

interface FormState {
  name: string;
  description: string;
  type: string;
  totalFund: string;
  maxBorrowers: string;
  startDate: string;
  endDate: string;
  states: string[];
  crops: string[];
  minAge: string;
  maxAge: string;
  gender: string;
  cooperative: string;
  minLoan: string;
  maxLoan: string;
  interest: string;
  duration: string;
  graceDays: string;
  requiredScore: string;
  disbursementType: string;
  insuranceRequired: boolean;
  collateralRequired: boolean;
  layers: LayerDef[];
  requiredDocuments: string[];
}

function fmtDate(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toISOString().split("T")[0];
}

export default function EditProgramPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [form, setForm] = useState<FormState>({
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
  });

  useEffect(() => {
    programsApi.getById(id)
      .then(prog => {
        setProgram(prog);
        const displayType = PROGRAM_TYPE_LABEL[prog.type] ?? "Loan";
        const maxAmt = typeof prog.maxAmount === "string" ? parseFloat(prog.maxAmount) : Number(prog.maxAmount);
        const minAmt = typeof prog.minAmount === "string" ? parseFloat(prog.minAmount) : Number(prog.minAmount);
        const totalFundRaw = prog.totalFund != null
          ? (typeof prog.totalFund === "string" ? parseFloat(prog.totalFund) : Number(prog.totalFund))
          : null;

        setForm({
          name: prog.name,
          description: prog.description || "",
          type: displayType,
          totalFund: totalFundRaw != null ? String(totalFundRaw / 1_000_000) : "",
          maxBorrowers: prog.maxBorrowers != null ? String(prog.maxBorrowers) : "",
          startDate: fmtDate(prog.startDate),
          endDate: fmtDate(prog.endDate),
          states: prog.targetStates || [],
          crops: prog.targetCrops || [],
          minAge: prog.minAge != null ? String(prog.minAge) : "",
          maxAge: prog.maxAge != null ? String(prog.maxAge) : "",
          gender: prog.gender || "ALL",
          cooperative: prog.cooperative || "OPTIONAL",
          minLoan: String(minAmt),
          maxLoan: String(maxAmt),
          interest: String(prog.interestRate),
          duration: String(prog.durationMonths),
          graceDays: String(prog.gracePeriodDays),
          requiredScore: String(prog.requiredScore),
          disbursementType: prog.disbursementType || "TRANCHE",
          insuranceRequired: prog.insuranceRequired,
          collateralRequired: prog.collateralRequired,
          layers: Array.from({ length: prog.trancheCount || 3 }, (_, i) => ({
            name: ["Land Preparation", "Planting & Inputs", "Crop Maintenance"][i] || `Layer ${i + 1}`,
            percent: i === 0 ? "30" : i === 1 ? "40" : "30",
            trigger: i === 0 ? "Loan Approval" : `Layer ${i} report submitted`,
            proof: "Farm photos + GPS",
          })),
          requiredDocuments: prog.requiredDocuments || ["BVN", "NIN"],
        });
      })
      .catch(() => setError("Program not found or you don't have access."))
      .finally(() => setLoading(false));
  }, [id]);

  const isDraft = program?.status === "DRAFT";
  const isActive = program?.status === "ACTIVE" || program?.status === "PAUSED";

  const inp = "w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 text-sm text-[var(--text)] outline-none focus:border-green-600 transition-colors";
  const disabledInp = `${inp} opacity-60 cursor-not-allowed`;

  const toggle = (field: "states" | "crops", val: string) => {
    if (isActive) return;
    setForm(f => ({
      ...f,
      [field]: f[field].includes(val) ? f[field].filter(v => v !== val) : [...f[field], val],
    }));
  };

  function buildPayload(): Partial<CreateProgramRequest> {
    const base: Partial<CreateProgramRequest> = {
      name: form.name,
      description: form.description || undefined,
      startDate: form.startDate ? new Date(form.startDate).toISOString() : undefined,
      endDate: form.endDate ? new Date(form.endDate).toISOString() : undefined,
    };

    if (isDraft) {
      return {
        ...base,
        type: TYPE_LABEL_TO_ENUM[form.type],
        interestRate: parseFloat(form.interest) || 0,
        maxAmount: parseFloat(form.maxLoan) || 0,
        minAmount: parseFloat(form.minLoan) || 0,
        durationMonths: parseInt(form.duration) || 12,
        requiredScore: parseInt(form.requiredScore) || 0,
        targetCrops: form.crops,
        targetStates: form.states,
        maxBorrowers: form.maxBorrowers ? parseInt(form.maxBorrowers) : undefined,
        gracePeriodDays: parseInt(form.graceDays) || 0,
        disbursementType: form.disbursementType === "TRANCHE" ? "TRANCHE" : "FULL",
        trancheCount: form.disbursementType === "TRANCHE" ? form.layers.length : 1,
        collateralRequired: form.collateralRequired,
        insuranceRequired: form.insuranceRequired,
        requiredDocuments: form.requiredDocuments,
        totalFund: form.totalFund ? parseFloat(form.totalFund) * 1_000_000 : undefined,
        minAge: form.minAge ? parseInt(form.minAge) : undefined,
        maxAge: form.maxAge ? parseInt(form.maxAge) : undefined,
        gender: form.gender as CreateProgramRequest["gender"],
        cooperative: form.cooperative as CreateProgramRequest["cooperative"],
      };
    }

    return base;
  }

  async function handleSave(publish?: boolean) {
    setSubmitting(true);
    setApiError(null);
    try {
      const payload = buildPayload();
      if (publish && isDraft) {
        (payload as CreateProgramRequest).status = "ACTIVE";
      }
      await programsApi.update(id, payload);
      router.push(`/lender/loan-programs/${id}`);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setApiError(msg ?? "Update failed. Please check all fields.");
    } finally {
      setSubmitting(false);
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

  if (program.status === "CLOSED") return (
    <div className="p-6 flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-xs">
        <Lock size={40} className="text-gray-400 mx-auto mb-3" />
        <p className="text-sm font-semibold text-[var(--text)] mb-1">Program is Closed</p>
        <p className="text-xs text-[var(--muted)] mb-4">Closed programs cannot be edited. You can duplicate it to create a new version.</p>
        <button onClick={() => router.push(`/lender/loan-programs/${id}`)}
          className="px-4 py-2 rounded-xl bg-[#1B5E20] text-white text-sm cursor-pointer">
          View Program
        </button>
      </div>
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 0: return (
        <div className="flex flex-col gap-4">
          <div>
            <label className="field-label">Program Name *</label>
            <input className={inp} placeholder="e.g. CBN Rice Farmers Support Fund 2025"
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="field-label">Description *</label>
            <textarea className={`${inp} min-h-[80px] resize-y`} placeholder="Who is this program for? What crops and regions does it target?"
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Program Type {isActive && <span className="text-red-500">(Locked)</span>}</label>
              <select className={isActive ? disabledInp : inp} disabled={isActive}
                value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option>Loan</option><option>Grant</option><option>Hybrid</option><option>Insurance</option>
              </select>
            </div>
            <div>
              <label className="field-label">Total Fund Pool (₦M) {isActive && <span className="text-red-500">(Locked)</span>}</label>
              <input className={isActive ? disabledInp : inp} type="number" step="0.1" placeholder="e.g. 500 = ₦500M"
                disabled={isActive}
                value={form.totalFund} onChange={e => setForm({ ...form, totalFund: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Max Borrowers {isActive && <span className="text-red-500">(Locked)</span>}</label>
              <input className={isActive ? disabledInp : inp} type="number" placeholder="Unlimited"
                disabled={isActive}
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
          {isActive && (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl">
              <p className="text-xs text-amber-700 dark:text-amber-300">
                <strong>Note:</strong> This program is active. Only description and dates can be modified. Loan terms, amounts, and eligibility are locked because borrowers may have already applied based on those terms.
              </p>
            </div>
          )}
        </div>
      );

      case 1: return (
        <div className="flex flex-col gap-5">
          {isActive && (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl">
              <p className="text-xs text-amber-700 dark:text-amber-300">
                <strong>Locked:</strong> Eligibility criteria cannot be changed for active programs.
              </p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Min Borrower Age</label>
              <input className={isActive ? disabledInp : inp} type="number" min={18} max={100} placeholder="18"
                disabled={isActive}
                value={form.minAge} onChange={e => setForm({ ...form, minAge: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Max Borrower Age</label>
              <input className={isActive ? disabledInp : inp} type="number" min={18} max={100} placeholder="No limit"
                disabled={isActive}
                value={form.maxAge} onChange={e => setForm({ ...form, maxAge: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Gender Focus</label>
              <select className={isActive ? disabledInp : inp} disabled={isActive}
                value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                <option value="ALL">All Genders</option>
                <option value="FEMALE">Female Only</option>
                <option value="MALE">Male Only</option>
                <option value="YOUTH">Youth (18–35)</option>
              </select>
            </div>
            <div>
              <label className="field-label">Cooperative Membership</label>
              <select className={isActive ? disabledInp : inp} disabled={isActive}
                value={form.cooperative} onChange={e => setForm({ ...form, cooperative: e.target.value })}>
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
                  disabled={isActive}
                  className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                    isActive ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                  } ${
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
                  disabled={isActive}
                  className={`text-[11px] px-2.5 py-1 rounded-full border transition-colors ${
                    isActive ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                  } ${
                    form.crops.includes(c)
                      ? "border-blue-500 bg-blue-50 text-blue-700 font-semibold"
                      : "border-[var(--border)] text-[var(--muted)]"
                  }`}>{c}</button>
              ))}
            </div>
          </div>
        </div>
      );

      case 2: return (
        <div className="flex flex-col gap-4">
          {isActive && (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl">
              <p className="text-xs text-amber-700 dark:text-amber-300">
                <strong>Locked:</strong> Loan terms cannot be changed for active programs.
              </p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Min Loan Amount (₦) *</label>
              <input className={isActive ? disabledInp : inp} type="number" placeholder="50,000"
                disabled={isActive}
                value={form.minLoan} onChange={e => setForm({ ...form, minLoan: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Max Loan Amount (₦) *</label>
              <input className={isActive ? disabledInp : inp} type="number" placeholder="2,000,000"
                disabled={isActive}
                value={form.maxLoan} onChange={e => setForm({ ...form, maxLoan: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Interest Rate % p.a. *</label>
              <input className={isActive ? disabledInp : inp} type="number" step="0.1" placeholder={form.type === "Grant" ? "0" : "9"}
                disabled={isActive}
                value={form.interest} onChange={e => setForm({ ...form, interest: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Duration (months) *</label>
              <select className={isActive ? disabledInp : inp} disabled={isActive}
                value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })}>
                {[3,6,9,12,18,24,36,48,60].map(m => <option key={m} value={m}>{m} months</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Grace Period (days)</label>
              <select className={isActive ? disabledInp : inp} disabled={isActive}
                value={form.graceDays} onChange={e => setForm({ ...form, graceDays: e.target.value })}>
                {[0,14,30,60,90,180].map(d => <option key={d} value={d}>{d === 0 ? "None" : `${d} days`}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Min FarmScore Required</label>
              <input className={isActive ? disabledInp : inp} type="number" min={0} max={850} placeholder="0 (any score)"
                disabled={isActive}
                value={form.requiredScore} onChange={e => setForm({ ...form, requiredScore: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Disbursement Method *</label>
              <select className={isActive ? disabledInp : inp} disabled={isActive}
                value={form.disbursementType}
                onChange={e => setForm({ ...form, disbursementType: e.target.value })}>
                <option value="TRANCHE">Layered (Tranches)</option>
                <option value="FULL">Lump Sum</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {([
              { key: "collateralRequired" as const, label: "Collateral Required", desc: "Borrowers must provide land or asset collateral" },
              { key: "insuranceRequired"  as const, label: "Insurance Required",   desc: "Crop insurance must be in place before disbursement" },
            ] as const).map(({ key, label, desc }) => (
              <div key={key}
                onClick={() => !isActive && setForm(f => ({ ...f, [key]: !f[key] }))}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
                  isActive ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                } ${
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

      case 3: return (
        <div className="flex flex-col gap-3">
          {isActive && (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl">
              <p className="text-xs text-amber-700 dark:text-amber-300">
                <strong>Locked:</strong> Disbursement layers cannot be changed for active programs.
              </p>
            </div>
          )}
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
                        <input className={isActive ? disabledInp : inp} disabled={isActive}
                          value={layer.name} onChange={e => {
                            const l = [...form.layers]; l[i] = { ...l[i], name: e.target.value };
                            setForm({ ...form, layers: l });
                          }} />
                      </div>
                      <div>
                        <label className="text-[10px] text-[var(--muted)] uppercase block mb-1">%</label>
                        <input className={isActive ? disabledInp : inp} type="number" disabled={isActive}
                          value={layer.percent} onChange={e => {
                            const l = [...form.layers]; l[i] = { ...l[i], percent: e.target.value };
                            setForm({ ...form, layers: l });
                          }} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] text-[var(--muted)] uppercase block mb-1">Release Trigger</label>
                        <input className={isActive ? disabledInp : inp} disabled={isActive}
                          value={layer.trigger} onChange={e => {
                            const l = [...form.layers]; l[i] = { ...l[i], trigger: e.target.value };
                            setForm({ ...form, layers: l });
                          }} />
                      </div>
                      <div>
                        <label className="text-[10px] text-[var(--muted)] uppercase block mb-1">Required Proof</label>
                        <input className={isActive ? disabledInp : inp} disabled={isActive}
                          value={layer.proof} onChange={e => {
                            const l = [...form.layers]; l[i] = { ...l[i], proof: e.target.value };
                            setForm({ ...form, layers: l });
                          }} />
                      </div>
                    </div>
                  </div>
                );
              })}
              {!isActive && (
                <button type="button"
                  onClick={() => setForm({ ...form, layers: [...form.layers, { name: "", percent: "", trigger: "", proof: "" }] })}
                  className="border border-dashed border-[var(--border)] rounded-xl p-2.5 text-sm text-[var(--muted)] cursor-pointer flex items-center justify-center gap-2 hover:border-green-500 hover:text-green-600 transition-colors">
                  <Plus size={14} /> Add layer
                </button>
              )}
            </>
          )}
        </div>
      );

      case 4: return (
        <div className="flex flex-col gap-2">
          {isActive && (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl mb-2">
              <p className="text-xs text-amber-700 dark:text-amber-300">
                <strong>Locked:</strong> Required documents cannot be changed for active programs.
              </p>
            </div>
          )}
          <p className="text-xs text-[var(--muted)] mb-1">
            Choose which documents borrowers must submit when applying to this program.
          </p>
          {DOC_LIST.map(({ value, label, desc, alwaysOn }) => {
            const selected = form.requiredDocuments.includes(value);
            const toggleDoc = () => {
              if (alwaysOn || isActive) return;
              setForm(f => ({
                ...f,
                requiredDocuments: selected
                  ? f.requiredDocuments.filter(d => d !== value)
                  : [...f.requiredDocuments, value],
              }));
            };
            return (
              <div key={value} onClick={toggleDoc}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
                  alwaysOn || isActive ? "cursor-default" : "cursor-pointer"
                } ${isActive ? "opacity-60" : ""} ${
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

      case 5: return (
        <div className="flex flex-col gap-3">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-4">
            <p className="text-[11px] font-bold text-green-700 dark:text-green-400 uppercase mb-3">Program Summary</p>
            {[
              ["Name",           form.name || "—"],
              ["Type",           form.type],
              ["Status",         program.status],
              ["Total Fund Pool", form.totalFund ? `₦${Number(form.totalFund).toLocaleString()}M` : "—"],
              ["Start Date",     form.startDate || "—"],
              ["End / Deadline", form.endDate || "—"],
              ["Age Range",      form.minAge || form.maxAge ? `${form.minAge || "18"}–${form.maxAge || "no limit"}` : "All ages"],
              ["Gender Focus",   { ALL: "All Genders", FEMALE: "Female Only", MALE: "Male Only", YOUTH: "Youth (18–35)" }[form.gender] ?? form.gender],
              ["Cooperative",    { OPTIONAL: "Optional", REQUIRED: "Required", NOT_REQUIRED: "Not Required" }[form.cooperative] ?? form.cooperative],
              ["States",         form.states.length > 0 ? form.states.slice(0,3).join(", ") + (form.states.length > 3 ? ` +${form.states.length-3}` : "") : "All states"],
              ["Crops",          form.crops.slice(0,4).join(", ") || "All crops"],
              ["Loan Range",     form.minLoan && form.maxLoan ? `₦${Number(form.minLoan).toLocaleString()} – ₦${Number(form.maxLoan).toLocaleString()}` : "—"],
              ["Interest",       form.interest ? `${form.interest}% p.a.` : form.type === "Grant" ? "0% (Grant)" : "—"],
              ["Duration",       `${form.duration} months`],
              ["Grace Period",   form.graceDays === "0" ? "None" : `${form.graceDays} days`],
              ["Min FarmScore",  form.requiredScore || "0 (any)"],
              ["Max Borrowers",  form.maxBorrowers || "Unlimited"],
              ["Disbursement",   form.disbursementType === "TRANCHE" ? `Layered — ${form.layers.length} tranches` : "Lump Sum"],
              ["Collateral",     form.collateralRequired ? "Required" : "Not required"],
              ["Insurance",      form.insuranceRequired ? "Required" : "Not required"],
              ["Required Documents", form.requiredDocuments.length > 0 ? form.requiredDocuments.join(", ") : "None selected"],
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
          {isActive ? (
            <button type="button" disabled={submitting} onClick={() => handleSave()}
              className="w-full py-2.5 rounded-xl bg-[#1B5E20] text-white text-sm font-semibold cursor-pointer disabled:opacity-60 hover:bg-green-800 transition-colors">
              {submitting ? "Saving…" : "Save Changes"}
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2.5">
              <button type="button" disabled={submitting} onClick={() => handleSave(false)}
                className="py-2.5 rounded-xl border border-[var(--border)] text-sm text-[var(--muted)] bg-[var(--input-bg)] cursor-pointer disabled:opacity-50 hover:border-amber-400 hover:text-amber-700 transition-colors">
                {submitting ? "Saving…" : "Save as Draft"}
              </button>
              <button type="button" disabled={submitting} onClick={() => handleSave(true)}
                className="py-2.5 rounded-xl bg-[#1B5E20] text-white text-sm font-semibold cursor-pointer disabled:opacity-60 hover:bg-green-800 transition-colors">
                {submitting ? "Publishing…" : "Save & Publish"}
              </button>
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <style>{`.field-label { display:block; font-size:11px; font-weight:600; text-transform:uppercase; color:var(--muted); margin-bottom:6px; letter-spacing:0.05em; }`}</style>

      <button onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--text)] cursor-pointer transition-colors mb-6">
        <ArrowLeft size={16} /> Back to Program
      </button>

      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
              <Wheat size={20} className="text-green-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text)]">Edit Program</h2>
              <p className="text-xs text-[var(--muted)] mt-0.5">Step {step+1} of {STEPS.length} — {STEPS[step]}</p>
            </div>
          </div>
          <div className={`text-[10px] font-bold px-2 py-0.5 rounded ${
            isDraft ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
          }`}>
            {program.status}
          </div>
        </div>

        <div className="px-6 py-3 border-b border-[var(--border)]">
          <div className="flex gap-1">
            {STEPS.map((s, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1"
                style={{ cursor: i !== step ? "pointer" : "default" }} onClick={() => setStep(i)}>
                <div className={`w-full h-1 rounded-full transition-colors ${i < step ? "bg-green-500" : i === step ? "bg-[#1B5E20]" : "bg-[var(--border)]"}`} />
                <span className={`text-[10px] whitespace-nowrap ${i === step ? "text-[#1B5E20] font-semibold" : "text-[var(--muted)]"}`}>{s}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">{renderStep()}</div>

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
