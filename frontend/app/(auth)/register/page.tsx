"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StepIndicator } from "@/components/ui/step-indicator";
import { authApi, RegisterBorrowerRequest } from "@/lib/api";
import { useAuthStore } from "@/lib/stores";
import { AxiosError } from "axios";

const steps = ["Language", "Identity", "Farm Details", "Bank Info", "Review"];

const languages = [
  { code: "en", name: "English", native: "English" },
  { code: "ha", name: "Hausa", native: "Hausa" },
  { code: "yo", name: "Yoruba", native: "Yorùbá" },
  { code: "ig", name: "Igbo", native: "Igbo" },
];

const states = ["Kebbi", "Anambra", "Oyo", "Kano", "Kaduna", "Ekiti", "Lagos", "Rivers", "Plateau"];
const crops = ["Rice", "Cassava", "Maize", "Yam", "Cocoa", "Vegetables", "Sorghum", "Millet"];
const banks = ["Access Bank", "GT Bank", "First Bank", "UBA", "Union Bank", "Zenith Bank", "FCMB"];

export default function RegisterPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<RegisterBorrowerRequest>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    bvn: "",
    nin: "",
    state: "",
    lga: "",
    farmSizeHa: 0,
    primaryCrop: crops[0],
    bankName: "",
    bankAccount: "",
    language: "en",
  });

  const updateField = <K extends keyof RegisterBorrowerRequest>(field: K, value: RegisterBorrowerRequest[K]) => {
    setFormData((prev: RegisterBorrowerRequest) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateStep = () => {
    switch (step) {
      case 1:
        if (!formData.firstName.trim() || !formData.lastName.trim()) {
          setError("Full name is required");
          return false;
        }
        if (!formData.phone.trim()) {
          setError("Phone number is required");
          return false;
        }
        if (formData.password.length < 8) {
          setError("Password must be at least 8 characters");
          return false;
        }
        break;
      case 2:
        if (!formData.state) {
          setError("State is required");
          return false;
        }
        if (!formData.lga.trim()) {
          setError("LGA is required");
          return false;
        }
        if (formData.farmSizeHa <= 0) {
          setError("Farm size is required");
          return false;
        }
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.registerBorrower(formData);

      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
      setUser(response.user);

      setStep(steps.length);
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToDashboard = () => {
    router.push("/borrower/overview");
  };

  return (
    <Card className="p-8 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-[var(--text)] mb-1">Borrower Registration</h1>
      <p className="text-sm text-[var(--muted)] mb-6">
        Register as a farmer on AgroTrack
      </p>

      <div className="mb-6">
        <StepIndicator steps={steps} current={step} />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {step === 0 && (
        <div className="space-y-4">
          <p className="text-sm text-[var(--muted)] mb-4">Choose your preferred language:</p>
          {languages.map((lang) => (
            <div
              key={lang.code}
              onClick={() => updateField("language", lang.code)}
              className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                formData.language === lang.code
                  ? "border-brand-green bg-green-50 dark:bg-green-900/10"
                  : "border-[var(--border)] hover:border-brand-green/50"
              }`}
            >
              <p className="text-sm font-bold text-[var(--text)]">{lang.name}</p>
              <p className="text-xs text-[var(--muted)]">{lang.native}</p>
            </div>
          ))}
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">First Name</label>
              <Input
                placeholder="First name"
                value={formData.firstName}
                onChange={(e) => updateField("firstName", e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">Last Name</label>
              <Input
                placeholder="Last name"
                value={formData.lastName}
                onChange={(e) => updateField("lastName", e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">BVN (Optional)</label>
            <Input
              placeholder="11-digit BVN"
              maxLength={11}
              value={formData.bvn}
              onChange={(e) => updateField("bvn", e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">NIN (Optional)</label>
            <Input
              placeholder="11-digit NIN"
              maxLength={11}
              value={formData.nin}
              onChange={(e) => updateField("nin", e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">Phone Number</label>
            <Input
              placeholder="+234 800 000 0000"
              value={formData.phone}
              onChange={(e) => updateField("phone", e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">Email (Optional)</label>
            <Input
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">Password</label>
            <Input
              type="password"
              placeholder="Min. 8 characters"
              value={formData.password}
              onChange={(e) => updateField("password", e.target.value)}
            />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">State</label>
            <select
              className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-[10px] px-3 py-2 text-sm text-[var(--text)]"
              value={formData.state}
              onChange={(e) => updateField("state", e.target.value)}
            >
              <option value="">Select state</option>
              {states.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">LGA</label>
            <Input
              placeholder="Local Government Area"
              value={formData.lga}
              onChange={(e) => updateField("lga", e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">Farm Size (hectares)</label>
            <Input
              type="number"
              placeholder="e.g., 2.5"
              value={formData.farmSizeHa || ""}
              onChange={(e) => updateField("farmSizeHa", parseFloat(e.target.value) || 0)}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">Primary Crop</label>
            <select
              className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-[10px] px-3 py-2 text-sm text-[var(--text)]"
              value={formData.primaryCrop}
              onChange={(e) => updateField("primaryCrop", e.target.value)}
            >
              {crops.map((crop) => (
                <option key={crop} value={crop}>{crop}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <p className="text-sm text-[var(--muted)] mb-2">Bank details for loan disbursement (Optional)</p>
          <div>
            <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">Bank Name</label>
            <select
              className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-[10px] px-3 py-2 text-sm text-[var(--text)]"
              value={formData.bankName}
              onChange={(e) => updateField("bankName", e.target.value)}
            >
              <option value="">Select bank</option>
              {banks.map((bank) => (
                <option key={bank} value={bank}>{bank}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">Account Number</label>
            <Input
              placeholder="10-digit account number"
              maxLength={10}
              value={formData.bankAccount}
              onChange={(e) => updateField("bankAccount", e.target.value)}
            />
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <p className="text-sm text-[var(--muted)] mb-4">Review your information:</p>
          <div className="bg-[var(--card-hover)] rounded-xl p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-xs text-[var(--muted)]">Name</span>
              <span className="text-sm font-medium text-[var(--text)]">{formData.firstName} {formData.lastName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-[var(--muted)]">Phone</span>
              <span className="text-sm text-[var(--text)]">{formData.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-[var(--muted)]">Location</span>
              <span className="text-sm text-[var(--text)]">{formData.lga}, {formData.state}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-[var(--muted)]">Farm Size</span>
              <span className="text-sm text-[var(--text)]">{formData.farmSizeHa} hectares</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-[var(--muted)]">Primary Crop</span>
              <span className="text-sm font-medium text-brand-green">{formData.primaryCrop}</span>
            </div>
            {formData.bankName && (
              <div className="flex justify-between">
                <span className="text-xs text-[var(--muted)]">Bank</span>
                <span className="text-sm text-[var(--text)]">{formData.bankName}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {step === steps.length && (
        <div className="text-center py-6">
          <div className="w-16 h-16 mx-auto bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">🎉</span>
          </div>
          <h3 className="text-base font-bold text-[var(--text)] mb-2">Registration Complete!</h3>
          <p className="text-sm text-[var(--muted)]">
            Your farmer profile is ready. You can now apply for loans and track your FarmScore.
          </p>
        </div>
      )}

      <div className="flex justify-between mt-6 pt-4 border-t border-[var(--border)]">
        <Button
          variant="ghost"
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0 || step === steps.length || isLoading}
        >
          Back
        </Button>
        {step < steps.length - 1 ? (
          <Button onClick={handleNext} disabled={isLoading}>Continue</Button>
        ) : step === steps.length - 1 ? (
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Complete Registration"
            )}
          </Button>
        ) : (
          <Button onClick={handleGoToDashboard}>Go to Dashboard</Button>
        )}
      </div>

      {step < steps.length && (
        <div className="mt-4 text-center">
          <p className="text-xs text-[var(--muted)]">
            Are you a lender?{" "}
            <Link href="/login" className="text-brand-green font-semibold hover:underline">
              Lender Login
            </Link>
          </p>
        </div>
      )}
    </Card>
  );
}
