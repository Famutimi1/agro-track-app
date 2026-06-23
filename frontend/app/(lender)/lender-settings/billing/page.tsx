"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, CreditCard, Download, Calendar, Check,
  AlertCircle, ChevronRight, Zap, Building
} from "lucide-react";
import { Button } from "@/components/ui/button";

const mockBilling = {
  plan: "Enterprise",
  price: 250000,
  billingCycle: "monthly",
  nextBillingDate: "2025-07-01",
  paymentMethod: { type: "card", last4: "4521", brand: "Visa", expiry: "12/26" },
  usage: {
    activeLoans: 1247,
    loanLimit: 5000,
    apiCalls: 45890,
    apiLimit: 100000,
    storage: 2.4,
    storageLimit: 10,
  },
};

const mockInvoices = [
  { id: "INV-2025-006", date: "2025-06-01", amount: 250000, status: "PAID" },
  { id: "INV-2025-005", date: "2025-05-01", amount: 250000, status: "PAID" },
  { id: "INV-2025-004", date: "2025-04-01", amount: 250000, status: "PAID" },
  { id: "INV-2025-003", date: "2025-03-01", amount: 200000, status: "PAID" },
  { id: "INV-2025-002", date: "2025-02-01", amount: 200000, status: "PAID" },
];

const plans = [
  { name: "Starter", price: 50000, loans: 500, features: ["Basic analytics", "Email support", "5 team members"] },
  { name: "Professional", price: 150000, loans: 2000, features: ["Advanced analytics", "Priority support", "25 team members", "API access"] },
  { name: "Enterprise", price: 250000, loans: 5000, features: ["Custom analytics", "Dedicated support", "Unlimited team", "Full API access", "White-label options"] },
];

export default function BillingSettingsPage() {
  const [showPlans, setShowPlans] = useState(false);

  const usagePercent = (used: number, limit: number) => Math.round((used / limit) * 100);

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/lender-settings" className="p-2 hover:bg-[var(--surface)] rounded-lg">
          <ArrowLeft size={20} className="text-[var(--muted)]" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[var(--text)]">Billing & Subscription</h1>
          <p className="text-sm text-[var(--muted)]">Manage your subscription and payment methods</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Current Plan */}
        <div className="col-span-2 space-y-6">
          <div className="bg-gradient-to-br from-brand-green to-brand-green-light rounded-xl p-6 text-white">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-white/70">Current Plan</p>
                <h2 className="text-3xl font-bold mt-1">{mockBilling.plan}</h2>
                <p className="text-lg mt-2">
                  ₦{mockBilling.price.toLocaleString()}<span className="text-sm text-white/70">/month</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-white/70">Next billing</p>
                <p className="font-semibold">{new Date(mockBilling.nextBillingDate).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <Button
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-0"
                onClick={() => setShowPlans(true)}
              >
                <Zap size={16} className="mr-2" /> Change Plan
              </Button>
              <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-0">
                Cancel Subscription
              </Button>
            </div>
          </div>

          {/* Usage */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
            <h3 className="font-semibold text-[var(--text)] mb-4">Usage This Month</h3>
            <div className="space-y-4">
              {[
                { label: "Active Loans", used: mockBilling.usage.activeLoans, limit: mockBilling.usage.loanLimit, unit: "" },
                { label: "API Calls", used: mockBilling.usage.apiCalls, limit: mockBilling.usage.apiLimit, unit: "" },
                { label: "Storage", used: mockBilling.usage.storage, limit: mockBilling.usage.storageLimit, unit: "GB" },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[var(--text)]">{item.label}</span>
                    <span className="text-[var(--muted)]">
                      {item.used.toLocaleString()}{item.unit} / {item.limit.toLocaleString()}{item.unit}
                    </span>
                  </div>
                  <div className="h-2 bg-[var(--background)] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        usagePercent(item.used, item.limit) > 80
                          ? "bg-yellow-500"
                          : "bg-brand-green"
                      }`}
                      style={{ width: `${usagePercent(item.used, item.limit)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Invoice History */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl">
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
              <h3 className="font-semibold text-[var(--text)]">Invoice History</h3>
              <Button variant="secondary" size="sm">
                <Download size={14} className="mr-2" /> Download All
              </Button>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {mockInvoices.map(invoice => (
                <div key={invoice.id} className="p-4 flex items-center justify-between hover:bg-[var(--background)] transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-[var(--background)] flex items-center justify-center">
                      <Calendar size={18} className="text-[var(--muted)]" />
                    </div>
                    <div>
                      <p className="font-medium text-[var(--text)]">{invoice.id}</p>
                      <p className="text-sm text-[var(--muted)]">{new Date(invoice.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-[var(--text)]">₦{invoice.amount.toLocaleString()}</span>
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      <Check size={12} className="inline mr-1" /> Paid
                    </span>
                    <button className="p-2 hover:bg-[var(--surface)] rounded-lg">
                      <Download size={16} className="text-[var(--muted)]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="space-y-6">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
            <h3 className="font-semibold text-[var(--text)] mb-4">Payment Method</h3>
            <div className="p-4 bg-[var(--background)] rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-6 bg-blue-600 rounded flex items-center justify-center">
                  <CreditCard size={14} className="text-white" />
                </div>
                <div>
                  <p className="font-medium text-[var(--text)]">{mockBilling.paymentMethod.brand} •••• {mockBilling.paymentMethod.last4}</p>
                  <p className="text-xs text-[var(--muted)]">Expires {mockBilling.paymentMethod.expiry}</p>
                </div>
              </div>
              <Button variant="secondary" size="sm" className="w-full">
                Update Card
              </Button>
            </div>
          </div>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
            <h3 className="font-semibold text-[var(--text)] mb-4">Billing Address</h3>
            <div className="text-sm text-[var(--muted)] space-y-1">
              <p>Federal Ministry of Agriculture</p>
              <p>Area 11, Garki</p>
              <p>Abuja FCT, Nigeria</p>
            </div>
            <Button variant="secondary" size="sm" className="w-full mt-4">
              Edit Address
            </Button>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertCircle size={18} className="text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-700 dark:text-blue-400">Need help?</p>
                <p className="text-blue-600 dark:text-blue-400">
                  Contact our billing team at billing@agrotrack.ng
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Plans Modal */}
      {showPlans && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-[var(--surface)] rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-auto">
            <h3 className="text-xl font-semibold text-[var(--text)] mb-6">Choose a Plan</h3>

            <div className="grid grid-cols-3 gap-4">
              {plans.map(plan => (
                <div
                  key={plan.name}
                  className={`p-5 rounded-xl border-2 ${
                    plan.name === mockBilling.plan
                      ? "border-brand-green bg-green-50 dark:bg-green-900/20"
                      : "border-[var(--border)]"
                  }`}
                >
                  <h4 className="text-lg font-semibold text-[var(--text)]">{plan.name}</h4>
                  <p className="text-2xl font-bold text-[var(--text)] mt-2">
                    ₦{plan.price.toLocaleString()}<span className="text-sm font-normal text-[var(--muted)]">/mo</span>
                  </p>
                  <p className="text-sm text-[var(--muted)] mt-1">Up to {plan.loans.toLocaleString()} active loans</p>

                  <ul className="mt-4 space-y-2">
                    {plan.features.map(feature => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-[var(--muted)]">
                        <Check size={14} className="text-brand-green" /> {feature}
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant={plan.name === mockBilling.plan ? "secondary" : "primary"}
                    className="w-full mt-4"
                    disabled={plan.name === mockBilling.plan}
                  >
                    {plan.name === mockBilling.plan ? "Current Plan" : "Select Plan"}
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-6">
              <Button variant="secondary" onClick={() => setShowPlans(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
