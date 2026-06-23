"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StepIndicator } from "@/components/ui/step-indicator";
import { authApi, RegisterLenderRequest } from "@/lib/api";
import { useAuthStore } from "@/lib/stores";
import { AxiosError } from "axios";

const steps = ["Organization", "Contact", "Plan", "Review"];
const planOptions = [
  { id: "STARTER", name: "Starter", price: "₦250K/mo", description: "Up to 500 borrowers" },
  { id: "GROWTH", name: "Growth", price: "₦750K/mo", description: "Up to 5,000 borrowers" },
  { id: "ENTERPRISE", name: "Enterprise", price: "Custom", description: "Unlimited borrowers" },
];

const orgTypes = [
  "Federal Government Agency",
  "State Government",
  "Commercial Bank",
  "Microfinance Bank",
  "Development Finance Institution",
  "International NGO",
];

export default function SignupPage() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<RegisterLenderRequest & { plan: string }>({
    organizationName: "",
    organizationType: orgTypes[0],
    cacNumber: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    plan: "GROWTH",
  });

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev: typeof formData) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateStep = () => {
    switch (step) {
      case 0:
        if (!formData.organizationName.trim()) {
          setError("Organization name is required");
          return false;
        }
        break;
      case 1:
        if (!formData.firstName.trim() || !formData.lastName.trim()) {
          setError("Full name is required");
          return false;
        }
        if (!formData.email.trim() || !formData.email.includes("@")) {
          setError("Valid email is required");
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
      const { plan, ...registerData } = formData;
      const response = await authApi.registerLender(registerData);

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
    router.push("/dashboard");
  };

  return (
    <Card className="p-8 max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-[var(--text)] mb-1">Create Lender Account</h1>
      <p className="text-sm text-[var(--muted)] mb-6">
        Set up your organization on AgroTrack
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
          <div>
            <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">Organization Name</label>
            <Input
              placeholder="e.g., Federal Ministry of Agriculture"
              value={formData.organizationName}
              onChange={(e) => updateField("organizationName", e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">Organization Type</label>
            <select
              className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-[10px] px-3 py-2 text-sm text-[var(--text)]"
              value={formData.organizationType}
              onChange={(e) => updateField("organizationType", e.target.value)}
            >
              {orgTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">CAC Registration Number (Optional)</label>
            <Input
              placeholder="RC-XXXXXXX"
              value={formData.cacNumber}
              onChange={(e) => updateField("cacNumber", e.target.value)}
            />
          </div>
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
            <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">Email Address</label>
            <Input
              type="email"
              placeholder="you@organization.ng"
              value={formData.email}
              onChange={(e) => updateField("email", e.target.value)}
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
          <p className="text-sm text-[var(--muted)] mb-4">Select a plan to get started:</p>
          {planOptions.map((plan) => (
            <div
              key={plan.id}
              onClick={() => updateField("plan", plan.id)}
              className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                formData.plan === plan.id
                  ? "border-brand-green bg-green-50 dark:bg-green-900/10"
                  : "border-[var(--border)] hover:border-brand-green/50"
              }`}
            >
              <p className="text-sm font-bold text-[var(--text)]">{plan.name} — {plan.price}</p>
              <p className="text-xs text-[var(--muted)] mt-1">{plan.description}</p>
            </div>
          ))}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <p className="text-sm text-[var(--muted)] mb-4">Review your information:</p>
          <div className="bg-[var(--card-hover)] rounded-xl p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-xs text-[var(--muted)]">Organization</span>
              <span className="text-sm font-medium text-[var(--text)]">{formData.organizationName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-[var(--muted)]">Type</span>
              <span className="text-sm text-[var(--text)]">{formData.organizationType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-[var(--muted)]">Admin</span>
              <span className="text-sm text-[var(--text)]">{formData.firstName} {formData.lastName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-[var(--muted)]">Email</span>
              <span className="text-sm text-[var(--text)]">{formData.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-[var(--muted)]">Plan</span>
              <span className="text-sm font-medium text-brand-green">
                {planOptions.find((p) => p.id === formData.plan)?.name}
              </span>
            </div>
          </div>
        </div>
      )}

      {step === steps.length && (
        <div className="text-center py-6">
          <div className="w-16 h-16 mx-auto bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h3 className="text-base font-bold text-[var(--text)] mb-2">All Set!</h3>
          <p className="text-sm text-[var(--muted)]">
            Your account is ready. You can now access your lender dashboard.
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
          <Button onClick={handleNext} disabled={isLoading}>
            Continue
          </Button>
        ) : step === steps.length - 1 ? (
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        ) : (
          <Button onClick={handleGoToDashboard}>Go to Dashboard</Button>
        )}
      </div>

      {step < steps.length && (
        <div className="mt-4 text-center">
          <p className="text-xs text-[var(--muted)]">
            Already have an account?{" "}
            <Link href="/login" className="text-brand-green font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      )}
    </Card>
  );
}
