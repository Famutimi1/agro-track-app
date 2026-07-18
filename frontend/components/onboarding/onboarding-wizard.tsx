"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  X, ChevronRight, ChevronLeft, Check, Rocket,
  Building, Users, FileText, CreditCard, Settings,
  Leaf, Map, TrendingUp, Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  content: React.ReactNode;
  action?: { label: string; href: string };
}

interface OnboardingWizardProps {
  role: "lender" | "borrower" | "agent";
  onComplete: () => void;
  onSkip: () => void;
}

export function OnboardingWizard({ role, onComplete, onSkip }: OnboardingWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const lenderSteps: OnboardingStep[] = [
    {
      id: "welcome",
      title: "Welcome to AgroTrack",
      description: "Your complete agricultural lending platform",
      icon: Rocket,
      content: (
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-brand-green/20 flex items-center justify-center">
            <Leaf size={40} className="text-brand-green" />
          </div>
          <h3 className="text-xl font-bold text-[var(--text)] mb-3">Welcome to AgroTrack!</h3>
          <p className="text-[var(--muted)] max-w-md mx-auto">
            Let&apos;s get you set up to start managing agricultural loans efficiently.
            This quick tour will show you the key features of your dashboard.
          </p>
        </div>
      ),
    },
    {
      id: "organization",
      title: "Organization Setup",
      description: "Configure your organization profile",
      icon: Building,
      content: (
        <div>
          <h3 className="text-lg font-semibold text-[var(--text)] mb-3">Set Up Your Organization</h3>
          <p className="text-[var(--muted)] mb-4">
            Complete your organization profile to build trust with borrowers and enable all features.
          </p>
          <ul className="space-y-3">
            {[
              "Add your organization logo and details",
              "Configure lending parameters",
              "Set up team member access",
              "Connect your payment systems",
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-[var(--text)]">
                <Check size={16} className="text-brand-green" /> {item}
              </li>
            ))}
          </ul>
        </div>
      ),
      action: { label: "Go to Settings", href: "/lender/settings" },
    },
    {
      id: "programs",
      title: "Create Loan Programs",
      description: "Set up your lending products",
      icon: FileText,
      content: (
        <div>
          <h3 className="text-lg font-semibold text-[var(--text)] mb-3">Create Your First Loan Program</h3>
          <p className="text-[var(--muted)] mb-4">
            Loan programs define the terms, eligibility criteria, and disbursement rules for your lending products.
          </p>
          <div className="p-4 bg-[var(--background)] rounded-lg">
            <p className="text-sm font-medium text-[var(--text)] mb-2">Program includes:</p>
            <ul className="text-sm text-[var(--muted)] space-y-1">
              <li>• Interest rates and repayment terms</li>
              <li>• Minimum FarmScore requirements</li>
              <li>• Geographic targeting</li>
              <li>• Tranche-based disbursement rules</li>
            </ul>
          </div>
        </div>
      ),
      action: { label: "Create Program", href: "/lender/loan-programs" },
    },
    {
      id: "team",
      title: "Invite Your Team",
      description: "Add team members with role-based access",
      icon: Users,
      content: (
        <div>
          <h3 className="text-lg font-semibold text-[var(--text)] mb-3">Build Your Team</h3>
          <p className="text-[var(--muted)] mb-4">
            Invite colleagues and assign roles based on their responsibilities.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { role: "Admin", desc: "Full access to all features" },
              { role: "Manager", desc: "Manage loans and applications" },
              { role: "Analyst", desc: "View reports and analytics" },
              { role: "Viewer", desc: "Read-only access" },
            ].map(r => (
              <div key={r.role} className="p-3 bg-[var(--background)] rounded-lg">
                <p className="text-sm font-medium text-[var(--text)]">{r.role}</p>
                <p className="text-xs text-[var(--muted)]">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ),
      action: { label: "Invite Members", href: "/lender/settings/team" },
    },
    {
      id: "complete",
      title: "You're All Set!",
      description: "Start managing your portfolio",
      icon: TrendingUp,
      content: (
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <Check size={40} className="text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-[var(--text)] mb-3">You&apos;re Ready to Go!</h3>
          <p className="text-[var(--muted)] max-w-md mx-auto mb-6">
            Your dashboard is set up and ready. Start by reviewing applications or
            exploring your portfolio analytics.
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="secondary" onClick={() => router.push("/applications")}>
              Review Applications
            </Button>
            <Button variant="primary" onClick={() => router.push("/dashboard")}>
              Go to Dashboard
            </Button>
          </div>
        </div>
      ),
    },
  ];

  const borrowerSteps: OnboardingStep[] = [
    {
      id: "welcome",
      title: "Welcome to AgroTrack",
      description: "Access agricultural financing easily",
      icon: Rocket,
      content: (
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-brand-green/20 flex items-center justify-center">
            <Leaf size={40} className="text-brand-green" />
          </div>
          <h3 className="text-xl font-bold text-[var(--text)] mb-3">Welcome, Farmer!</h3>
          <p className="text-[var(--muted)] max-w-md mx-auto">
            AgroTrack connects you with agricultural lenders. Let&apos;s get your profile ready
            to access financing for your farm.
          </p>
        </div>
      ),
    },
    {
      id: "profile",
      title: "Complete Your Profile",
      description: "Add your farm details",
      icon: Users,
      content: (
        <div>
          <h3 className="text-lg font-semibold text-[var(--text)] mb-3">Tell Us About Your Farm</h3>
          <p className="text-[var(--muted)] mb-4">
            A complete profile helps lenders understand your farming operation and improves your FarmScore.
          </p>
          <ul className="space-y-3">
            {[
              "Personal identification details",
              "Farm location and size",
              "Crops you cultivate",
              "Farming experience",
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-[var(--text)]">
                <Check size={16} className="text-brand-green" /> {item}
              </li>
            ))}
          </ul>
        </div>
      ),
      action: { label: "Complete Profile", href: "/borrower/profile" },
    },
    {
      id: "farmscore",
      title: "Your FarmScore",
      description: "Understand your credit score",
      icon: TrendingUp,
      content: (
        <div>
          <h3 className="text-lg font-semibold text-[var(--text)] mb-3">Understanding FarmScore</h3>
          <p className="text-[var(--muted)] mb-4">
            FarmScore (0-850) is your agricultural credit score. Higher scores unlock better loan terms.
          </p>
          <div className="p-4 bg-[var(--background)] rounded-lg mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[var(--muted)]">Your Current Score</span>
              <span className="text-2xl font-bold text-brand-green">720</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
              <div className="h-full bg-brand-green rounded-full" style={{ width: "85%" }} />
            </div>
          </div>
          <p className="text-sm text-[var(--muted)]">
            Improve your score by completing your profile, repaying loans on time, and getting verified by field agents.
          </p>
        </div>
      ),
    },
    {
      id: "discover",
      title: "Discover Programs",
      description: "Find loans you qualify for",
      icon: FileText,
      content: (
        <div>
          <h3 className="text-lg font-semibold text-[var(--text)] mb-3">Find the Right Loan</h3>
          <p className="text-[var(--muted)] mb-4">
            Browse available loan programs and see which ones match your profile and needs.
          </p>
          <div className="space-y-3">
            {[
              { name: "CBN Rice Fund 2025", match: "96%", amount: "Up to ₦2M" },
              { name: "Kebbi State Irrigation", match: "88%", amount: "Up to ₦750K" },
            ].map(prog => (
              <div key={prog.name} className="p-3 bg-[var(--background)] rounded-lg flex items-center justify-between">
                <div>
                  <p className="font-medium text-[var(--text)]">{prog.name}</p>
                  <p className="text-xs text-[var(--muted)]">{prog.amount}</p>
                </div>
                <span className="text-sm font-bold text-brand-green">{prog.match} match</span>
              </div>
            ))}
          </div>
        </div>
      ),
      action: { label: "Browse Programs", href: "/borrower/discover" },
    },
    {
      id: "complete",
      title: "Ready to Apply!",
      description: "Start your loan application",
      icon: Check,
      content: (
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <Check size={40} className="text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-[var(--text)] mb-3">You&apos;re Ready!</h3>
          <p className="text-[var(--muted)] max-w-md mx-auto mb-6">
            Your profile is set up. You can now browse loan programs and submit applications.
          </p>
        </div>
      ),
    },
  ];

  const agentSteps: OnboardingStep[] = [
    {
      id: "welcome",
      title: "Welcome, Field Agent",
      description: "Your mobile toolkit for farmer support",
      icon: Rocket,
      content: (
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <Map size={40} className="text-orange-600" />
          </div>
          <h3 className="text-xl font-bold text-[var(--text)] mb-3">Welcome, Agent!</h3>
          <p className="text-[var(--muted)] max-w-md mx-auto">
            You&apos;re the bridge between farmers and financial services. Let&apos;s get you ready
            to register farmers and conduct field visits.
          </p>
        </div>
      ),
    },
    {
      id: "territory",
      title: "Your Territory",
      description: "Understand your assigned area",
      icon: Map,
      content: (
        <div>
          <h3 className="text-lg font-semibold text-[var(--text)] mb-3">Your Assigned Area</h3>
          <p className="text-[var(--muted)] mb-4">
            You&apos;ve been assigned to cover the following Local Government Areas:
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {["Argungu", "Birnin Kebbi", "Kalgo", "Gwandu"].map(lga => (
              <span
                key={lga}
                className="px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full text-sm"
              >
                {lga}
              </span>
            ))}
          </div>
          <p className="text-sm text-[var(--muted)]">
            Contact your supervisor if you need to adjust your coverage area.
          </p>
        </div>
      ),
    },
    {
      id: "offline",
      title: "Offline Mode",
      description: "Work without internet",
      icon: Bell,
      content: (
        <div>
          <h3 className="text-lg font-semibold text-[var(--text)] mb-3">Work Offline</h3>
          <p className="text-[var(--muted)] mb-4">
            The app works even without internet. Your data syncs automatically when you&apos;re back online.
          </p>
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <ul className="space-y-2 text-sm text-green-700 dark:text-green-400">
              <li>• Register farmers offline</li>
              <li>• Complete visit reports</li>
              <li>• Take photos and GPS coordinates</li>
              <li>• Auto-sync when connected</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "earnings",
      title: "Track Earnings",
      description: "Get paid for your work",
      icon: CreditCard,
      content: (
        <div>
          <h3 className="text-lg font-semibold text-[var(--text)] mb-3">Your Earnings</h3>
          <p className="text-[var(--muted)] mb-4">
            You earn for each activity completed. Payments are processed monthly.
          </p>
          <div className="space-y-2">
            {[
              { activity: "Farmer Registration", rate: "₦2,500" },
              { activity: "Verification Visit", rate: "₦3,000" },
              { activity: "Farm Mapping", rate: "₦3,500" },
              { activity: "Monitoring Visit", rate: "₦2,000" },
            ].map(item => (
              <div key={item.activity} className="flex items-center justify-between p-3 bg-[var(--background)] rounded-lg">
                <span className="text-sm text-[var(--text)]">{item.activity}</span>
                <span className="text-sm font-bold text-orange-600">{item.rate}</span>
              </div>
            ))}
          </div>
        </div>
      ),
      action: { label: "View Earnings", href: "/agent/earnings" },
    },
    {
      id: "complete",
      title: "Start Your First Visit",
      description: "You're ready to go!",
      icon: Check,
      content: (
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <Check size={40} className="text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-[var(--text)] mb-3">You&apos;re All Set!</h3>
          <p className="text-[var(--muted)] max-w-md mx-auto mb-6">
            Check your scheduled visits and start registering farmers in your area.
          </p>
        </div>
      ),
    },
  ];

  const steps = role === "lender" ? lenderSteps : role === "borrower" ? borrowerSteps : agentSteps;
  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps([...completedSteps, currentStepData.id]);
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--surface)] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            {steps.map((step, i) => (
              <div
                key={step.id}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === currentStep
                    ? "bg-brand-green w-6"
                    : completedSteps.includes(step.id)
                    ? "bg-brand-green"
                    : "bg-[var(--border)]"
                }`}
              />
            ))}
          </div>
          <button
            onClick={onSkip}
            className="p-2 hover:bg-[var(--background)] rounded-lg text-[var(--muted)]"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          {currentStepData.content}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-[var(--border)] bg-[var(--background)]">
          <Button
            variant="secondary"
            onClick={handleBack}
            disabled={currentStep === 0}
            className={currentStep === 0 ? "opacity-0" : ""}
          >
            <ChevronLeft size={16} className="mr-1" /> Back
          </Button>

          <div className="flex items-center gap-3">
            {currentStepData.action && (
              <Button
                variant="secondary"
                onClick={() => router.push(currentStepData.action!.href)}
              >
                {currentStepData.action.label}
              </Button>
            )}
            <Button variant="primary" onClick={handleNext}>
              {currentStep === steps.length - 1 ? (
                <>Finish</>
              ) : (
                <>Next <ChevronRight size={16} className="ml-1" /></>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OnboardingWizard;
