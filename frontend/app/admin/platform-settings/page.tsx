"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { adminApi, type PlatformSettings } from "@/lib/api";
import { AxiosError } from "axios";

type ToggleKey = "maintenanceMode" | "allowNewRegistrations" | "emailNotifications" | "apiRateLimiting" | "debugMode";

const TOGGLES: { key: ToggleKey; label: string; desc: string }[] = [
  { key: "maintenanceMode", label: "Maintenance Mode", desc: "Show maintenance page to all users" },
  { key: "allowNewRegistrations", label: "Allow New Registrations", desc: "Enable new lender signups" },
  { key: "emailNotifications", label: "Email Notifications", desc: "Send system-wide email alerts" },
  { key: "apiRateLimiting", label: "API Rate Limiting", desc: "Enforce 1000 req/min per lender" },
  { key: "debugMode", label: "Debug Mode", desc: "Enable verbose logging (performance impact)" },
];

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [togglingKey, setTogglingKey] = useState<ToggleKey | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getSettings();
      setSettings(data);
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saveConfig = async () => {
    if (!settings) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await adminApi.updateSettings({
        platformName: settings.platformName,
        supportEmail: settings.supportEmail,
      });
      setSettings(updated);
      setSuccess("Configuration saved");
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || "Failed to save configuration");
    } finally {
      setSaving(false);
    }
  };

  const toggleSetting = async (key: ToggleKey) => {
    if (!settings) return;
    const next = !settings[key];
    setTogglingKey(key);
    setError(null);
    setSuccess(null);
    // optimistic update
    setSettings((prev) => (prev ? { ...prev, [key]: next } : prev));
    try {
      const updated = await adminApi.updateSettings({ [key]: next });
      setSettings(updated);
    } catch (err) {
      // revert
      setSettings((prev) => (prev ? { ...prev, [key]: !next } : prev));
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || "Failed to update setting");
    } finally {
      setTogglingKey(null);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-extrabold text-[var(--text)] mb-1">Admin Settings</h1>
        <p className="text-[13px] text-[var(--muted)]">Platform-wide configuration</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 max-w-2xl">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 max-w-2xl">
          {success}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-brand-green" />
        </div>
      ) : settings ? (
        <div className="space-y-5 max-w-2xl">
          <Card>
            <h3 className="text-sm font-bold text-[var(--text)] mb-4">Platform Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">Platform Name</label>
                <Input
                  value={settings.platformName}
                  onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">Support Email</label>
                <Input
                  value={settings.supportEmail}
                  onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">Default Currency</label>
                <Input value={settings.defaultCurrency} disabled />
              </div>
              <Button onClick={saveConfig} disabled={saving}>
                {saving ? "Saving..." : "Save Configuration"}
              </Button>
            </div>
          </Card>

          <Card>
            <h3 className="text-sm font-bold text-[var(--text)] mb-4">System Toggles</h3>
            <div className="space-y-4">
              {TOGGLES.map((t) => (
                <div key={t.key} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm text-[var(--text)]">{t.label}</p>
                    <p className="text-[11px] text-[var(--muted)]">{t.desc}</p>
                  </div>
                  {togglingKey === t.key ? (
                    <Loader2 className="h-5 w-5 animate-spin text-brand-green" />
                  ) : (
                    <Toggle on={settings[t.key]} onToggle={() => toggleSetting(t.key)} />
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
