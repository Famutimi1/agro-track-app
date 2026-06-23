"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, ArrowRight, Check, AlertCircle, Info,
  DollarSign, FileText, Camera, Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";

const programs = [
  { id: "PRG001", name: "CBN Rice Fund 2025", lender: "Central Bank of Nigeria", minAmount: 100000, maxAmount: 2000000, interestRate: 9, requiredScore: 500, matchPercent: 96 },
  { id: "PRG002", name: "Kebbi State Irrigation Scheme", lender: "Kebbi State Government", minAmount: 100000, maxAmount: 750000, interestRate: 7, requiredScore: 450, matchPercent: 88 },
  { id: "PRG003", name: "NIRSAL Cassava Grant", lender: "NIRSAL", minAmount: 50000, maxAmount: 500000, interestRate: 0, requiredScore: 400, matchPercent: 74 },
];

const steps = [
  { id: 1, title: "Select Program", icon: FileText },
  { id: 2, title: "Loan Details", icon: DollarSign },
  { id: 3, title: "Documents", icon: Upload },
  { id: 4, title: "Review & Submit", icon: Check },
];

export default function NewApplicationPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    programId: "",
    amount: "",
    purpose: "",
    documents: [] as string[],
    agreedToTerms: false,
  });

  const selectedProgram = programs.find(p => p.id === formData.programId);

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    alert("Application submitted successfully!");
    router.push("/borrower-applications");
  };

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

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/borrower-applications" className="p-2 hover:bg-[var(--surface)] rounded-lg">
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

            <div className="space-y-3">
              {programs.map(program => (
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
                      <p className="text-sm text-[var(--muted)]">{program.lender}</p>
                    </div>
                    <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                      program.matchPercent >= 90
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : program.matchPercent >= 70
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    }`}>
                      {program.matchPercent}% match
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
              {[
                { label: "Farm Photo (current)", desc: "Recent photo of your farm showing crops or land" },
                { label: "Land Document", desc: "Certificate of occupancy, lease agreement, or customary right" },
                { label: "Bank Statement", desc: "Last 3 months showing farm income (if any)" },
              ].map((doc, i) => (
                <div key={i} className="p-4 border border-dashed border-[var(--border)] rounded-lg hover:border-brand-green transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-[var(--text)]">{doc.label}</p>
                      <p className="text-sm text-[var(--muted)]">{doc.desc}</p>
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[var(--background)] rounded-lg text-sm text-[var(--muted)] hover:text-brand-green">
                      <Upload size={16} /> Upload
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle size={18} className="text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-700 dark:text-yellow-400">Documents help your application</p>
                  <p className="text-yellow-600 dark:text-yellow-400">
                    While optional, uploading supporting documents can speed up the review process and increase approval chances.
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
                <p className="text-sm text-[var(--muted)]">{selectedProgram.lender}</p>
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

              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Check size={18} className="text-green-600" />
                  <p className="font-medium text-green-700 dark:text-green-400">Eligibility Confirmed</p>
                </div>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Your FarmScore (720) exceeds the minimum requirement ({selectedProgram.requiredScore}). You are eligible for this program.
                </p>
              </div>

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
        <Button variant="secondary" onClick={handleBack} disabled={currentStep === 1}>
          <ArrowLeft size={16} className="mr-2" /> Back
        </Button>

        {currentStep < 4 ? (
          <Button variant="primary" onClick={handleNext} disabled={!isStepValid()}>
            Next <ArrowRight size={16} className="ml-2" />
          </Button>
        ) : (
          <Button variant="primary" onClick={handleSubmit} disabled={!isStepValid()}>
            Submit Application <Check size={16} className="ml-2" />
          </Button>
        )}
      </div>
    </div>
  );
}
