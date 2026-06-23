"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";

const tabs = ["Organization", "Notifications", "Users", "Security", "Billing"];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("Organization");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-[var(--text)] mb-1">Settings</h1>
        <p className="text-[13px] text-[var(--muted)]">
          Manage your organization settings
        </p>
      </div>

      {/* Tabs */}
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

      {activeTab === "Organization" && (
        <Card className="max-w-2xl">
          <div className="space-y-5">
            <div>
              <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">Organization Name</label>
              <Input defaultValue="Federal Ministry of Agriculture" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">Email</label>
              <Input defaultValue="admin@fmard.gov.ng" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">Phone</label>
              <Input defaultValue="+234 900 000 0000" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">Address</label>
              <Input defaultValue="Area 11, Garki, Abuja FCT" />
            </div>
            <Button>Save Changes</Button>
          </div>
        </Card>
      )}

      {activeTab === "Notifications" && (
        <Card className="max-w-2xl">
          <div className="space-y-4">
            {[
              { label: "Email notifications for new applications", on: true },
              { label: "SMS alerts for overdue repayments", on: true },
              { label: "Weekly portfolio summary", on: true },
              { label: "Real-time disbursement alerts", on: false },
              { label: "Field agent activity reports", on: true },
            ].map((n) => (
              <div key={n.label} className="flex items-center justify-between py-2">
                <span className="text-sm text-[var(--text)]">{n.label}</span>
                <Toggle on={n.on} onToggle={() => {}} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === "Users" && (
        <Card className="max-w-2xl">
          <p className="text-sm text-[var(--muted)]">Manage team members and their access levels.</p>
          <div className="mt-4 space-y-3">
            {[
              { name: "Admin User", email: "admin@fmard.gov.ng", role: "Super Admin" },
              { name: "Finance Officer", email: "finance@fmard.gov.ng", role: "Manager" },
              { name: "Field Coordinator", email: "field@fmard.gov.ng", role: "Viewer" },
            ].map((u) => (
              <div key={u.email} className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-0">
                <div>
                  <p className="text-sm font-medium text-[var(--text)]">{u.name}</p>
                  <p className="text-xs text-[var(--muted)]">{u.email}</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--input-bg)] text-[var(--muted)]">
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === "Security" && (
        <Card className="max-w-2xl">
          <div className="space-y-5">
            <div>
              <h3 className="text-sm font-bold text-[var(--text)] mb-1">Two-Factor Authentication</h3>
              <p className="text-xs text-[var(--muted)] mb-3">Add an extra layer of security to your account</p>
              <Button variant="secondary" size="sm">Enable 2FA</Button>
            </div>
            <div className="border-t border-[var(--border)] pt-5">
              <h3 className="text-sm font-bold text-[var(--text)] mb-1">Change Password</h3>
              <div className="space-y-3 mt-3">
                <Input type="password" placeholder="Current password" />
                <Input type="password" placeholder="New password" />
                <Input type="password" placeholder="Confirm new password" />
                <Button size="sm">Update Password</Button>
              </div>
            </div>
          </div>
        </Card>
      )}

      {activeTab === "Billing" && (
        <Card className="max-w-2xl">
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-brand-green to-brand-green-light text-white">
              <p className="text-xs font-semibold text-white/70 uppercase">Current Plan</p>
              <p className="text-2xl font-extrabold mt-1">Enterprise</p>
              <p className="text-xs text-white/70 mt-1">Next billing date: Jul 1, 2025</p>
            </div>
            <div>
              <p className="text-sm text-[var(--muted)]">
                Contact your account manager for billing changes or plan upgrades.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
