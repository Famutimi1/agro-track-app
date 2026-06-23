"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";

const tabs = ["Profile", "Notifications", "Language", "Bank Details"];

export default function BorrowerSettingsPage() {
  const [activeTab, setActiveTab] = useState("Profile");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-[var(--text)] mb-1">Settings</h1>
        <p className="text-[13px] text-[var(--muted)]">Manage your account preferences</p>
      </div>

      <div className="flex gap-1 mb-6 border-b border-[var(--border)]">
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

      {activeTab === "Profile" && (
        <Card className="max-w-lg">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">Full Name</label>
              <Input defaultValue="Bello Musa" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">Phone</label>
              <Input defaultValue="0706 xxx xxxx" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">State</label>
              <Input defaultValue="Kebbi" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">Farm Size</label>
              <Input defaultValue="5.1 ha" />
            </div>
            <Button>Save Changes</Button>
          </div>
        </Card>
      )}

      {activeTab === "Notifications" && (
        <Card className="max-w-lg">
          <div className="space-y-4">
            {[
              { label: "SMS repayment reminders", on: true },
              { label: "WhatsApp disbursement alerts", on: true },
              { label: "FarmScore change notifications", on: true },
              { label: "New program recommendations", on: false },
            ].map((n) => (
              <div key={n.label} className="flex items-center justify-between py-2">
                <span className="text-sm text-[var(--text)]">{n.label}</span>
                <Toggle on={n.on} onToggle={() => {}} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === "Language" && (
        <Card className="max-w-lg">
          <div className="space-y-3">
            {["English", "Hausa", "Yoruba", "Igbo"].map((lang) => (
              <div
                key={lang}
                className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                  lang === "English"
                    ? "border-brand-green bg-green-50 dark:bg-green-900/10"
                    : "border-[var(--border)] hover:border-brand-green/50"
                }`}
              >
                <p className="text-sm font-medium text-[var(--text)]">{lang}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === "Bank Details" && (
        <Card className="max-w-lg">
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">Bank</label>
              <Input defaultValue="First Bank Nigeria" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">Account Number</label>
              <Input defaultValue="3012345678" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">Account Name</label>
              <Input defaultValue="Bello Musa" disabled />
            </div>
            <Button>Update Bank Details</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
