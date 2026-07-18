"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, Check, AlertCircle, Info,
  DollarSign, FileText, Upload, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  useDiscoverPrograms,
  useMyBorrowerProfile,
  useCreateApplication,
  useSubmitApplication,
  useApplicationEligibility,
  useUploadApplicationDocuments,
} from "@/lib/hooks";
import { computeProgramMatch } from "@/lib/utils";

const steps = [
  { id: 1, title: "Select Program", icon: FileText },
  { id: 2, title: "Loan Details", icon: DollarSign },
  { id: 3, title: "Documents", icon: Upload },
  { id: 4, title: "Review & Submit", icon: Check },
];

const DOCUMENT_TYPES = [
  { type: "FARM_PHOTO", label: "Farm Photo (current)", desc: "Recent photo of your farm showing crops or land" },
  { type: "LAND_TITLE", label: "Land Document", desc: "Certificate of occupancy, lease agreement, or customary right" },
  { type: "BANK_STATEMENT", label: "Bank Statement", desc: "Last 3 months showing farm income (if any)" },
] as const;

const MAX_DOC_SIZE = 5 * 1024 * 1024;
const ACCEPTED_DOC_TYPES = "image/jpeg,image/png,application/pdf";

export default function NewApplicationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedProgramId = searchParams.get("programId");

  const { data: profile } = useMyBorrowerProfile();
  const { data: programsData, isLoading: programsLoading } = useDiscoverPrograms();
  const programs = programsData?.data || [];
  const rankedPrograms = [...programs]
    .map((p) => ({ program: p, match: computeProgramMatch(p, profile) }))
    .sort((a, b) => b.match - a.match);

  const createApplication = useCreateApplication();
  const submitApplication = useSubmitApplication();
  const uploadDocuments = useUploadApplicationDocuments();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [docError, setDocError] = useState<string | null>(null);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    programId: preselectedProgramId || "",
    amount: "",
    purpose: "",
    agreedToTerms: false,
  });

  // Selected document files keyed by document type
  const [documents, setDocuments] = useState<Record<string, File | null>>({});

  useEffect(() => {
    if (preselectedProgramId && !formData.programId) {
      setFormData((f) => ({ ...f, programId: preselectedProgramId }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preselectedProgramId]);

  const selectedProgram = programs.find(p => p.id === formData.programId);
  const { data: eligibility, isLoading: eligibilityLoading } = useApplicationEligibility(
    formData.programId,
    formData.amount ? Number(formData.amount) : undefined
  );

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSelectDocument = (type: string, file: File | null) => {
    setDocError(null);
    if (file && file.size > MAX_DOC_SIZE) {
      setDocError(`${file.name} is larger than 5MB. Please choose a smaller file.`);
      return;
    }
    setDocuments((prev) => ({ ...prev, [type]: file }));
  };

  const handleSubmit = async () => {
    if (!selectedProgram) return;
    setSubmitError(null);
    try {
      const application = await createApplication.mutateAsync({
        programId: selectedProgram.id,
        amount: Number(formData.amount),
        purpose: formData.purpose,
      });

      // Upload any selected documents before submitting the application
      for (const doc of DOCUMENT_TYPES) {
        const file = documents[doc.type];
        if (file) {
          await uploadDocuments.mutateAsync({ id: application.id, files: [file], type: doc.type });
        }
      }

      await submitApplication.mutateAsync(application.id);
      setSubmittedId(application.id);
    } catch (err: any) {
      setSubmitError(err?.response?.data?.message || "Failed to submit application. Please try again.");
    }
  };

  const isSubmitting = createApplication.isPending || submitApplication.isPending || uploadDocuments.isPending;

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return !!formData.programId;
      case 2:
        return !!formData.amount && !!formData.purpose && Number(formData.amount) >= (selectedProgram?.minAmount || 0);
      case 3:
        return true;
      case 4:
        return formData.agreedToTerms;
      default:
        return false;
    }
  };

  if (submittedId) {
    return (
      <div className="p-6 max-w-lg mx-auto">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-8 text-center">
          <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
            <Check size={32} className="text-green-600" />
          </div>
          <h1 className="text-xl font-bold text-[var(--text)] mb-2">Application Submitted!</h1>
          <p className="text-sm text-[var(--muted)] mb-6">
            Your application to {selectedProgram?.name || "the program"} has been sent to the lender.
            You&apos;ll be notified once it&apos;s reviewed. You can track its status any time.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="primary" onClick={() => router.push(`/borrower/applications/${submittedId}`)}>
              View Application
            </Button>
            <Button variant="secondary" onClick={() => router.push("/borrower/applications")}>
              Back to Applications
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/borrower/applications" className="p-2 hover:bg-[var(--surface)] rounded-lg">
          <ArrowLeft size={20} className="text-[var(--muted)]" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">New Loan Application</h1>
          <p className="text-sm text-[var(--muted)]">Complete the steps below to apply for a loan</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, i) => {
          const StepIcon = step.icon;
          const isActive = currentStep === step.id;
          const isComplete = currentStep > step.id;

          return (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    isComplete
                      ? "bg-brand-green text-white"
                      : isActive
                      ? "bg-brand-green/20 text-brand-green border-2 border-brand-green"
                      : "bg-[var(--surface)] text-[var(--muted)] border border-[var(--border)]"
                  }`}
                >
                  {isComplete ? <Check size={18} /> : <StepIcon size={18} />}
                </div>
                <span className={`text-xs mt-2 font-medium ${isActive ? "text-brand-green" : "text-[var(--muted)]"}`}>
                  {step.title}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`w-24 h-0.5 mx-2 ${
                    currentStep > step.id ? "bg-brand-green" : "bg-[var(--border)]"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 mb-6">
        {/* Step 1: Select Program */}
        {currentStep === 1 && (
          <div>
            <h2 className="text-lg font-semibold text-[var(--text)] mb-4">Select a Loan Program</h2>
            <p className="text-sm text-[var(--muted)] mb-6">Choose from programs you're eligible for based on your FarmScore and profile.</p>

            {programsLoading ? (
              <p className="text-sm text-[var(--muted)] text-center py-8">Loading programs…</p>
            ) : rankedPrograms.length === 0 ? (
              <p className="text-sm text-[var(--muted)] text-center py-8">No programs available right now.</p>
            ) : (
              <div className="space-y-3">
                {rankedPrograms.map(({ program, match }) => (
                  <div
                    key={program.id}
                    onClick={() => setFormData({ ...formData, programId: program.id })}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.programId === program.id
                        ? "border-brand-green bg-green-50 dark:bg-green-900/20"
                        : "border-[var(--border)] hover:border-brand-green/50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-[var(--text)]">{program.name}</h3>
                        <p className="text-sm text-[var(--muted)]">{program.lenderOrg?.name}</p>
                      </div>
                      <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                        match >= 90
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : match >= 70
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                          : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}>
                        {match}% match
                      </span>
                    </div>
                    <div className="flex gap-4 mt-3 text-sm">
                      <span className="text-[var(--muted)]">
                        ₦{program.minAmount.toLocaleString()} - ₦{program.maxAmount.toLocaleString()}
                      </span>
                      <span className="text-[var(--muted)]">{program.interestRate}% interest</span>
                      <span className="text-[var(--muted)]">Min score: {program.requiredScore}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Loan Details */}
        {currentStep === 2 && selectedProgram && (
          <div>
            <h2 className="text-lg font-semibold text-[var(--text)] mb-4">Loan Details</h2>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Info size={18} className="text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-700 dark:text-blue-400">Program Limits</p>
                  <p className="text-blue-600 dark:text-blue-400">
                    Min: ₦{selectedProgram.minAmount.toLocaleString()} | Max: ₦{selectedProgram.maxAmount.toLocaleString()} | Interest: {selectedProgram.interestRate}%
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-2">
                  Loan Amount (₦) *
                </label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: e.target.value })}
                  placeholder={`Enter amount (${selectedProgram.minAmount.toLocaleString()} - ${selectedProgram.maxAmount.toLocaleString()})`}
                  className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--text)]"
                />
                {formData.amount && Number(formData.amount) < selectedProgram.minAmount && (
                  <p className="text-sm text-red-500 mt-1">Amount must be at least ₦{selectedProgram.minAmount.toLocaleString()}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-2">
                  Purpose of Loan *
                </label>
                <textarea
                  value={formData.purpose}
                  onChange={e => setFormData({ ...formData, purpose: e.target.value })}
                  placeholder="Describe how you plan to use this loan (e.g., purchase of seeds, fertilizers, equipment...)"
                  rows={4}
                  className="w-full px-4 py-3 bg-[var(--background)] border border-[var(--border)] rounded-lg text-[var(--text)] resize-none"
                />
              </div>

              {formData.amount && (
                <div className="p-4 bg-[var(--background)] rounded-lg">
                  <h4 className="font-medium text-[var(--text)] mb-3">Repayment Estimate</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-[var(--muted)]">Principal</p>
                      <p className="font-semibold text-[var(--text)]">₦{Number(formData.amount).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[var(--muted)]">Interest ({selectedProgram.interestRate}%)</p>
                      <p className="font-semibold text-[var(--text)]">₦{Math.round(Number(formData.amount) * selectedProgram.interestRate / 100).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[var(--muted)]">Total Repayable</p>
                      <p className="font-semibold text-brand-green">₦{Math.round(Number(formData.amount) * (1 + selectedProgram.interestRate / 100)).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Documents */}
        {currentStep === 3 && (
          <div>
            <h2 className="text-lg font-semibold text-[var(--text)] mb-4">Upload Documents</h2>
            <p className="text-sm text-[var(--muted)] mb-6">Upload any additional documents to support your application (optional but recommended).</p>

            <div className="space-y-4">
              {DOCUMENT_TYPES.map((doc) => {
                const file = documents[doc.type];
                return (
                  <div key={doc.type} className="p-4 border border-dashed border-[var(--border)] rounded-lg">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-medium text-[var(--text)]">{doc.label}</p>
                        <p className="text-sm text-[var(--muted)]">{doc.desc}</p>
                        {file && (
                          <p className="mt-1 flex items-center gap-2 text-sm text-brand-green">
                            <Check size={14} /> {file.name} ({(file.size / 1024 / 1024).toFixed(1)}MB)
                          </p>
                        )}
                      </div>
                      {file ? (
                        <button
                          type="button"
                          onClick={() => handleSelectDocument(doc.type, null)}
                          className="flex items-center gap-2 px-4 py-2 bg-[var(--background)] rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <X size={16} /> Remove
                        </button>
                      ) : (
                        <label className="flex items-center gap-2 px-4 py-2 bg-[var(--background)] rounded-lg text-sm text-[var(--text)] cursor-pointer hover:bg-[var(--border)] whitespace-nowrap">
                          <Upload size={16} /> Choose file
                          <input
                            type="file"
                            accept={ACCEPTED_DOC_TYPES}
                            className="hidden"
                            onChange={(e) => handleSelectDocument(doc.type, e.target.files?.[0] || null)}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {docError && (
              <p className="mt-3 text-sm text-red-500">{docError}</p>
            )}

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-start gap-3">
                <Info size={18} className="text-blue-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-700 dark:text-blue-400">Documents strengthen your application</p>
                  <p className="text-blue-600 dark:text-blue-400">
                    Documents are optional, but uploading them helps lenders review your application faster. Accepted formats: JPG, PNG, PDF (max 5MB each).
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review & Submit */}
        {currentStep === 4 && selectedProgram && (
          <div>
            <h2 className="text-lg font-semibold text-[var(--text)] mb-4">Review Your Application</h2>

            <div className="space-y-6">
              <div className="p-4 bg-[var(--background)] rounded-lg">
                <h4 className="font-medium text-[var(--text)] mb-3">Program</h4>
                <p className="text-[var(--text)]">{selectedProgram.name}</p>
                <p className="text-sm text-[var(--muted)]">{selectedProgram.lenderOrg?.name}</p>
              </div>

              <div className="p-4 bg-[var(--background)] rounded-lg">
                <h4 className="font-medium text-[var(--text)] mb-3">Loan Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-[var(--muted)]">Amount Requested</p>
                    <p className="font-semibold text-[var(--text)]">₦{Number(formData.amount).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[var(--muted)]">Interest Rate</p>
                    <p className="font-semibold text-[var(--text)]">{selectedProgram.interestRate}%</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[var(--muted)]">Purpose</p>
                    <p className="text-[var(--text)]">{formData.purpose}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[var(--background)] rounded-lg">
                <h4 className="font-medium text-[var(--text)] mb-3">Eligibility Check</h4>
                {eligibilityLoading || !eligibility ? (
                  <p className="text-sm text-[var(--muted)]">Checking eligibility…</p>
                ) : (
                  <div className="space-y-2">
                    {eligibility.checks.map((check) => (
                      <div key={check.key} className="flex items-start gap-3">
                        {check.pass ? (
                          <Check size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                        ) : (
                          <AlertCircle size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                        )}
                        <div>
                          <p className={`text-sm font-medium ${check.pass ? "text-[var(--text)]" : "text-yellow-700 dark:text-yellow-400"}`}>
                            {check.label}
                          </p>
                          <p className="text-xs text-[var(--muted)]">{check.detail}</p>
                        </div>
                      </div>
                    ))}
                    {!eligibility.eligible && (
                      <p className="text-xs text-yellow-600 dark:text-yellow-400 pt-1">
                        You may still apply, but approval isn't guaranteed.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {submitError && (
                <p className="text-sm text-red-500">{submitError}</p>
              )}

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.agreedToTerms}
                  onChange={e => setFormData({ ...formData, agreedToTerms: e.target.checked })}
                  className="mt-1"
                />
                <span className="text-sm text-[var(--muted)]">
                  I confirm that the information provided is accurate. I understand that providing false information may result in rejection and could affect my FarmScore. I agree to the{" "}
                  <a href="#" className="text-brand-green hover:underline">terms and conditions</a>.
                </span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="secondary" onClick={handleBack} disabled={currentStep === 1 || isSubmitting}>
          <ArrowLeft size={16} className="mr-2" /> Back
        </Button>

        {currentStep < 4 ? (
          <Button variant="primary" onClick={handleNext} disabled={!isStepValid()}>
            Next <ArrowRight size={16} className="ml-2" />
          </Button>
        ) : (
          <Button variant="primary" onClick={handleSubmit} disabled={!isStepValid() || isSubmitting}>
            {isSubmitting ? "Submitting…" : "Submit Application"} <Check size={16} className="ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
