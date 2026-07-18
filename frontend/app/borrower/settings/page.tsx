"use client";

import { useState } from "react";
import { CheckCircle, Clock, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { useAuthStore } from "@/lib/stores";
import {
  useMyBorrowerProfile,
  useNotificationPreferences,
  useUpdateNotificationPreferences,
} from "@/lib/hooks";
import type { NotificationEventType, NotificationChannelType, NotificationPreferences } from "@/lib/api";

const tabs = ["Profile", "Verification", "Notifications", "Language", "Bank Details"];

const NOTIFICATION_EVENTS: { key: NotificationEventType; label: string }[] = [
  { key: "LOAN_UPDATE", label: "Loan updates" },
  { key: "PAYMENT_DUE", label: "Payment reminders" },
  { key: "PAYMENT_RECEIVED", label: "Payment confirmations" },
  { key: "APPLICATION_STATUS", label: "Application status" },
  { key: "FARM_ALERT", label: "FarmScore & weather alerts" },
  { key: "DISBURSEMENT", label: "Disbursement alerts" },
  { key: "SYSTEM", label: "System notifications" },
];

const NOTIFICATION_CHANNELS: { key: NotificationChannelType; label: string }[] = [
  { key: "IN_APP", label: "In-App" },
  { key: "SMS", label: "SMS" },
  { key: "EMAIL", label: "Email" },
  { key: "WHATSAPP", label: "WhatsApp" },
];

export default function BorrowerSettingsPage() {
  const [activeTab, setActiveTab] = useState("Profile");
  const { user, updateProfile, isLoading } = useAuthStore();
  const { data: borrowerProfile, isLoading: profileLoading } = useMyBorrowerProfile();
  const { data: preferences, isLoading: preferencesLoading } = useNotificationPreferences();
  const updatePreferences = useUpdateNotificationPreferences();

  const [profile, setProfile] = useState({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    phone: user?.phone ?? "",
    state: user?.borrowerProfile?.state ?? "",
    farmSizeHa: user?.borrowerProfile?.farmSizeHa?.toString() ?? "",
  });
  const [bank, setBank] = useState({
    bankName: user?.borrowerProfile?.bankName ?? "",
    bankAccount: user?.borrowerProfile?.bankAccount ?? "",
  });
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const saveProfile = async () => {
    setSavedMsg(null);
    await updateProfile({
      firstName: profile.firstName,
      lastName: profile.lastName,
      phone: profile.phone || undefined,
      state: profile.state || undefined,
      farmSizeHa: profile.farmSizeHa ? Number(profile.farmSizeHa) : undefined,
    });
    setSavedMsg("Profile updated successfully");
  };

  const saveBank = async () => {
    setSavedMsg(null);
    await updateProfile({
      bankName: bank.bankName || undefined,
      bankAccount: bank.bankAccount || undefined,
    });
    setSavedMsg("Bank details updated successfully");
  };

  const togglePreference = (event: NotificationEventType, channel: NotificationChannelType) => {
    if (!preferences) return;
    const next: NotificationPreferences = {
      ...preferences,
      [event]: { ...preferences[event], [channel]: !preferences[event][channel] },
    };
    updatePreferences.mutate(next);
  };

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
            onClick={() => {
              setActiveTab(t);
              setSavedMsg(null);
            }}
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

      {savedMsg && (
        <div className="mb-4 max-w-lg rounded-lg bg-green-50 dark:bg-green-900/15 border border-green-200 dark:border-green-800 px-4 py-2.5 text-[13px] text-green-700 dark:text-green-300">
          {savedMsg}
        </div>
      )}

      {activeTab === "Profile" && (
        <Card className="max-w-lg">
          {/* Farmer ID + KYC status */}
          <div className="mb-5 pb-5 border-b border-[var(--border)] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] text-[var(--muted)] uppercase font-semibold">Farmer ID</p>
                <p className="text-sm font-bold text-[var(--text)]">{borrowerProfile?.farmerId || "—"}</p>
              </div>
              {borrowerProfile?.farmerId && (
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(borrowerProfile.farmerId);
                    setSavedMsg("Farmer ID copied to clipboard");
                  }}
                  className="text-xs text-brand-green hover:underline"
                >
                  Copy
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "BVN", verified: !!borrowerProfile?.bvnVerified },
                { label: "NIN", verified: !!borrowerProfile?.ninVerified },
                { label: "Farm GPS", verified: borrowerProfile?.farmLatitude != null && borrowerProfile?.farmLongitude != null },
                { label: "Bank Account", verified: !!borrowerProfile?.bankAccount },
              ].map((k) => (
                <div key={k.label} className="flex items-center gap-2 text-xs">
                  {k.verified ? (
                    <CheckCircle size={14} className="text-green-600" />
                  ) : (
                    <Clock size={14} className="text-yellow-600" />
                  )}
                  <span className="text-[var(--text)]">{k.label}</span>
                  <span className={k.verified ? "text-green-600" : "text-yellow-600"}>
                    {k.verified ? "Verified" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">First Name</label>
              <Input
                value={profile.firstName}
                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">Last Name</label>
              <Input
                value={profile.lastName}
                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">Phone</label>
              <Input
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">State</label>
              <Input
                value={profile.state}
                onChange={(e) => setProfile({ ...profile, state: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">Farm Size (ha)</label>
              <Input
                type="number"
                value={profile.farmSizeHa}
                onChange={(e) => setProfile({ ...profile, farmSizeHa: e.target.value })}
              />
            </div>
            <Button onClick={saveProfile} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </Card>
      )}

      {activeTab === "Verification" && (
        <Card className="max-w-lg">
          {profileLoading ? (
            <p className="text-xs text-[var(--muted)] text-center py-8">Loading…</p>
          ) : (
            <div className="space-y-4">
              {[
                { label: "BVN Verification", verified: !!borrowerProfile?.bvnVerified, desc: "Bank Verification Number" },
                { label: "NIN Verification", verified: !!borrowerProfile?.ninVerified, desc: "National Identification Number" },
              ].map((v) => (
                <div key={v.label} className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                      v.verified ? "bg-green-100 dark:bg-green-900/30" : "bg-yellow-100 dark:bg-yellow-900/30"
                    }`}>
                      {v.verified ? (
                        <CheckCircle size={16} className="text-green-600" />
                      ) : (
                        <Clock size={16} className="text-yellow-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--text)]">{v.label}</p>
                      <p className="text-xs text-[var(--muted)]">{v.desc}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    v.verified
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                  }`}>
                    {v.verified ? "Verified" : "Pending"}
                  </span>
                </div>
              ))}

              <div className="flex items-start gap-3 pt-2">
                <ShieldCheck size={18} className="text-brand-green mt-0.5" />
                <p className="text-xs text-[var(--muted)]">
                  Verification is completed by a field agent or through document upload during onboarding. Contact support if your details need updating.
                </p>
              </div>
            </div>
          )}
        </Card>
      )}

      {activeTab === "Notifications" && (
        <Card className="max-w-2xl overflow-x-auto">
          {preferencesLoading || !preferences ? (
            <p className="text-xs text-[var(--muted)] text-center py-8">Loading…</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left text-xs font-semibold text-[var(--text)] pb-3">Notification</th>
                  {NOTIFICATION_CHANNELS.map((c) => (
                    <th key={c.key} className="text-center text-xs font-semibold text-[var(--text)] pb-3 px-2">
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {NOTIFICATION_EVENTS.map((event) => (
                  <tr key={event.key} className="border-t border-[var(--border)]">
                    <td className="py-3 text-sm text-[var(--text)]">{event.label}</td>
                    {NOTIFICATION_CHANNELS.map((channel) => (
                      <td key={channel.key} className="py-3 text-center px-2">
                        <Toggle
                          on={!!preferences[event.key]?.[channel.key]}
                          onToggle={() => togglePreference(event.key, channel.key)}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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
          {borrowerProfile?.bankAccount && (
            <div className="mb-5 pb-5 border-b border-[var(--border)]">
              <p className="text-[11px] text-[var(--muted)] uppercase font-semibold mb-1">Current Account</p>
              <p className="text-sm font-bold text-[var(--text)]">
                {borrowerProfile.bankName || "Bank"} ····{" "}
                {borrowerProfile.bankAccount.slice(-4)}
              </p>
              <span className="inline-flex items-center gap-1 mt-1 text-xs text-green-600">
                <CheckCircle size={12} /> On file
              </span>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">Bank</label>
              <Input
                value={bank.bankName}
                onChange={(e) => setBank({ ...bank, bankName: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">Account Number</label>
              <Input
                value={bank.bankAccount}
                onChange={(e) => setBank({ ...bank, bankAccount: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">Account Name</label>
              <Input value={`${profile.firstName} ${profile.lastName}`.trim()} disabled />
            </div>
            <Button onClick={saveBank} disabled={isLoading}>
              {isLoading ? "Saving..." : "Update Bank Details"}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
