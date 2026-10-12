"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/badge";
import { adminApi, type SystemHealth } from "@/lib/api";
import { AxiosError } from "axios";

const formatUptime = (seconds: number) => {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

const overallColor = (overall: string) => {
  if (overall === "Operational") return "text-green-600";
  if (overall === "Degraded") return "text-yellow-600";
  return "text-red-600";
};

export default function SystemHealthPage() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [autoRefresh, setAutoRefresh] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const data = await adminApi.getSystemHealth();
      setHealth(data);
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || "Failed to load system health");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Optional 30s auto-refresh — silent (no full-page spinner) so the view
  // doesn't flicker while polling.
  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => void load(true), 30000);
    return () => clearInterval(id);
  }, [autoRefresh, load]);

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-extrabold text-[var(--text)] mb-1">System Health</h1>
          <p className="text-[13px] text-[var(--muted)]">Real-time status of all AgroTrack services</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-[13px] text-[var(--muted)] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="accent-brand-green"
            />
            Auto-refresh (30s)
          </label>
          <button
            onClick={() => load()}
            disabled={loading}
            className="flex items-center gap-2 bg-[var(--input-bg)] border border-[var(--border)] rounded-[10px] px-3 py-2 text-[13px] text-[var(--text)] hover:bg-[var(--border)] transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-brand-green" />
        </div>
      ) : health ? (
        <>
          <Card className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <div>
              <p className="text-xs text-[var(--muted)]">Overall Status</p>
              <p className={`text-lg font-extrabold ${overallColor(health.overall)}`}>{health.overall}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--muted)]">Uptime</p>
              <p className="text-lg font-extrabold text-[var(--text)]">{formatUptime(health.uptimeSeconds)}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--muted)]">Last Checked</p>
              <p className="text-sm font-semibold text-[var(--text)]">
                {new Date(health.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </p>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {health.services.map((s) => (
              <Card key={s.name}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-[var(--text)]">{s.name}</h3>
                  <StatusPill status={s.status} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[10px] text-[var(--muted)] uppercase">Latency</p>
                    <p className="text-xs font-bold text-[var(--text)]">{s.latency}</p>
                  </div>
                  {s.detail && (
                    <div>
                      <p className="text-[10px] text-[var(--muted)] uppercase">Detail</p>
                      <p className="text-xs font-bold text-[var(--text)]">{s.detail}</p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
