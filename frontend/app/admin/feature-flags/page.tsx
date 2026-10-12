"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";
import { adminApi, type AdminFeatureFlag } from "@/lib/api";
import { AxiosError } from "axios";

const humanizeKey = (key: string) =>
  key
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<AdminFeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getFeatureFlags();
      setFlags(data);
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || "Failed to load feature flags");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleFlag = async (flag: AdminFeatureFlag) => {
    setTogglingId(flag.id);
    // optimistic update
    setFlags((prev) => prev.map((f) => (f.id === flag.id ? { ...f, enabled: !f.enabled } : f)));
    try {
      const updated = await adminApi.toggleFeatureFlag(flag.id);
      setFlags((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
    } catch (err) {
      // revert on failure
      setFlags((prev) => prev.map((f) => (f.id === flag.id ? { ...f, enabled: flag.enabled } : f)));
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || "Failed to toggle feature flag");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-extrabold text-[var(--text)] mb-1">Feature Flags</h1>
        <p className="text-[13px] text-[var(--muted)]">Control feature rollouts across the platform</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-brand-green" />
        </div>
      ) : flags.length === 0 ? (
        <Card>
          <div className="py-12 text-center text-sm text-[var(--muted)]">No feature flags configured</div>
        </Card>
      ) : (
        <div className="space-y-3">
          {flags.map((f) => (
            <Card key={f.id} className="flex items-center gap-4">
              <div className="flex-shrink-0">
                {togglingId === f.id ? (
                  <Loader2 className="h-5 w-5 animate-spin text-brand-green" />
                ) : (
                  <Toggle on={f.enabled} onToggle={() => toggleFlag(f)} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-[var(--text)] mb-0.5">{humanizeKey(f.key)}</h3>
                <p className="text-xs text-[var(--muted)]">{f.description || f.key}</p>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded flex-shrink-0 ${
                  f.enabled
                    ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                    : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                }`}
              >
                {f.enabled ? "Enabled" : "Disabled"}
              </span>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
