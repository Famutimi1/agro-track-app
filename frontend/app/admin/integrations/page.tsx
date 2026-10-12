"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, Trash2, Plug, KeyRound, Copy, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
  adminApi,
  WEBHOOK_EVENTS,
  API_KEY_PERMISSIONS,
  type AdminWebhook,
  type AdminApiKey,
} from "@/lib/api";
import { AxiosError } from "axios";

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });

type Tab = "webhooks" | "apikeys";

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("webhooks");

  // Webhooks
  const [webhooks, setWebhooks] = useState<AdminWebhook[]>([]);
  const [whLoading, setWhLoading] = useState(true);
  const [whError, setWhError] = useState<string | null>(null);

  const loadWebhooks = useCallback(async () => {
    setWhLoading(true);
    setWhError(null);
    try {
      setWebhooks(await adminApi.getWebhooks());
    } catch (err) {
      const e = err as AxiosError<{ message?: string }>;
      setWhError(e.response?.data?.message || "Failed to load webhooks");
    } finally {
      setWhLoading(false);
    }
  }, []);

  // API keys
  const [apiKeys, setApiKeys] = useState<AdminApiKey[]>([]);
  const [akLoading, setAkLoading] = useState(true);
  const [akError, setAkError] = useState<string | null>(null);

  const loadApiKeys = useCallback(async () => {
    setAkLoading(true);
    setAkError(null);
    try {
      setApiKeys(await adminApi.getApiKeys());
    } catch (err) {
      const e = err as AxiosError<{ message?: string }>;
      setAkError(e.response?.data?.message || "Failed to load API keys");
    } finally {
      setAkLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "webhooks") void loadWebhooks();
    else void loadApiKeys();
  }, [activeTab, loadWebhooks, loadApiKeys]);

  // ── Webhook composer ──
  const [creatingWh, setCreatingWh] = useState(false);
  const [whUrl, setWhUrl] = useState("");
  const [whEvents, setWhEvents] = useState<string[]>([]);
  const [whSaving, setWhSaving] = useState(false);
  const [whFormError, setWhFormError] = useState<string | null>(null);

  const toggleEvent = (ev: string) =>
    setWhEvents((prev) => (prev.includes(ev) ? prev.filter((e) => e !== ev) : [...prev, ev]));

  const createWebhook = async () => {
    if (!whUrl.trim() || whEvents.length === 0) return;
    setWhSaving(true);
    setWhFormError(null);
    try {
      await adminApi.createWebhook({ url: whUrl.trim(), events: whEvents });
      setCreatingWh(false);
      setWhUrl("");
      setWhEvents([]);
      void loadWebhooks();
    } catch (err) {
      const e = err as AxiosError<{ message?: string }>;
      setWhFormError(e.response?.data?.message || "Failed to create webhook");
    } finally {
      setWhSaving(false);
    }
  };

  const toggleWebhook = async (id: string) => {
    try {
      const updated = await adminApi.toggleWebhook(id);
      setWebhooks((prev) => prev.map((w) => (w.id === id ? { ...w, active: updated.active } : w)));
    } catch {
      void loadWebhooks();
    }
  };

  const deleteWebhook = async (id: string) => {
    try {
      await adminApi.deleteWebhook(id);
      setWebhooks((prev) => prev.filter((w) => w.id !== id));
    } catch {
      void loadWebhooks();
    }
  };

  // ── API key composer ──
  const [creatingKey, setCreatingKey] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [keyPerms, setKeyPerms] = useState<string[]>(["read"]);
  const [keySaving, setKeySaving] = useState(false);
  const [keyFormError, setKeyFormError] = useState<string | null>(null);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const togglePerm = (p: string) =>
    setKeyPerms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));

  const createApiKey = async () => {
    if (!keyName.trim() || keyPerms.length === 0) return;
    setKeySaving(true);
    setKeyFormError(null);
    try {
      const created = await adminApi.createApiKey({ name: keyName.trim(), permissions: keyPerms });
      setNewKey(created.key ?? null);
      setKeyName("");
      setKeyPerms(["read"]);
      void loadApiKeys();
    } catch (err) {
      const e = err as AxiosError<{ message?: string }>;
      setKeyFormError(e.response?.data?.message || "Failed to create API key");
    } finally {
      setKeySaving(false);
    }
  };

  const closeKeyModal = () => {
    setCreatingKey(false);
    setNewKey(null);
    setCopied(false);
    setKeyFormError(null);
  };

  const copyKey = async () => {
    if (!newKey) return;
    try {
      await navigator.clipboard.writeText(newKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable
    }
  };

  const revokeApiKey = async (id: string) => {
    try {
      await adminApi.revokeApiKey(id);
      setApiKeys((prev) => prev.map((k) => (k.id === id ? { ...k, active: false } : k)));
    } catch {
      void loadApiKeys();
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[22px] font-extrabold text-[var(--text)] mb-1">Integrations</h1>
          <p className="text-[13px] text-[var(--muted)]">Platform webhooks and API keys</p>
        </div>
        {activeTab === "webhooks" ? (
          <Button onClick={() => setCreatingWh(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add webhook
          </Button>
        ) : (
          <Button onClick={() => setCreatingKey(true)}>
            <Plus className="mr-2 h-4 w-4" /> New API key
          </Button>
        )}
      </div>

      <div className="flex items-center gap-1 mb-5 bg-[var(--input-bg)] p-1 rounded-xl w-fit">
        {(["webhooks", "apikeys"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-1.5 rounded-[10px] text-[13px] font-semibold transition-colors ${
              activeTab === t
                ? "bg-white dark:bg-slate-800 text-[var(--text)] shadow-sm"
                : "text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            {t === "webhooks" ? (
              <><Plug className="inline mr-1.5" size={13} /> Webhooks</>
            ) : (
              <><KeyRound className="inline mr-1.5" size={13} /> API Keys</>
            )}
          </button>
        ))}
      </div>
      {activeTab === "webhooks" ? (
        <>
          {whError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{whError}</div>
          )}
          <Card className="overflow-x-auto">
            {whLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-brand-green" />
              </div>
            ) : webhooks.length === 0 ? (
              <div className="py-16 text-center text-sm text-[var(--muted)]">No webhooks configured</div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Endpoint</th>
                    <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Events</th>
                    <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Last triggered</th>
                    <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Active</th>
                    <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {webhooks.map((w) => (
                    <tr key={w.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--input-bg)] transition-colors">
                      <td className="py-3 text-xs font-medium text-[var(--text)] max-w-[280px] truncate">{w.url}</td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-1 max-w-[240px]">
                          {w.events.map((ev) => (
                            <span key={ev} className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[var(--input-bg)] text-[var(--muted)]">{ev}</span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 text-xs text-[var(--muted)]">{w.lastTriggered ? fmtDateTime(w.lastTriggered) : "Never"}</td>
                      <td className="py-3">
                        <button
                          onClick={() => toggleWebhook(w.id)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${w.active ? "bg-brand-green" : "bg-gray-300 dark:bg-gray-600"}`}
                        >
                          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${w.active ? "translate-x-[18px]" : "translate-x-[3px]"}`} />
                        </button>
                      </td>
                      <td className="py-3 text-right">
                        <button onClick={() => deleteWebhook(w.id)} className="text-red-500 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </>
      ) : (
        <>
          {akError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{akError}</div>
          )}
          <Card className="overflow-x-auto">
            {akLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-brand-green" />
              </div>
            ) : apiKeys.length === 0 ? (
              <div className="py-16 text-center text-sm text-[var(--muted)]">No API keys yet</div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Name</th>
                    <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Key</th>
                    <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Permissions</th>
                    <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Last used</th>
                    <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Status</th>
                    <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {apiKeys.map((k) => (
                    <tr key={k.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--input-bg)] transition-colors">
                      <td className="py-3 text-xs font-medium text-[var(--text)]">{k.name}</td>
                      <td className="py-3 text-xs font-mono text-[var(--muted)]">{k.prefix}••••••••</td>
                      <td className="py-3">
                        <div className="flex flex-wrap gap-1">
                          {k.permissions.map((p) => (
                            <span key={p} className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[var(--input-bg)] text-[var(--muted)]">{p}</span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 text-xs text-[var(--muted)]">{k.lastUsedAt ? fmtDateTime(k.lastUsedAt) : "Never"}</td>
                      <td className="py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${k.active ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}>
                          {k.active ? "Active" : "Revoked"}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        {k.active && (
                          <Button size="sm" variant="secondary" onClick={() => revokeApiKey(k.id)}>Revoke</Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </>
      )}

      {/* Webhook composer */}
      <Modal open={creatingWh} onClose={() => !whSaving && setCreatingWh(false)} title="Add webhook">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">Endpoint URL</label>
            <input
              value={whUrl}
              onChange={(e) => setWhUrl(e.target.value)}
              placeholder="https://example.com/webhooks/agrotrack"
              className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-[10px] px-3 py-2.5 text-sm text-[var(--text)] outline-none placeholder:text-[var(--muted)]"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">Events</label>
            <div className="grid grid-cols-2 gap-2">
              {WEBHOOK_EVENTS.map((ev) => (
                <label key={ev.value} className="flex items-center gap-2 text-xs text-[var(--text)] cursor-pointer">
                  <input type="checkbox" checked={whEvents.includes(ev.value)} onChange={() => toggleEvent(ev.value)} className="accent-brand-green" />
                  {ev.label}
                </label>
              ))}
            </div>
          </div>
          {whFormError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{whFormError}</div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setCreatingWh(false)} disabled={whSaving}>Cancel</Button>
            <Button onClick={createWebhook} disabled={whSaving || !whUrl.trim() || whEvents.length === 0}>
              {whSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Create webhook"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* API key composer */}
      <Modal open={creatingKey} onClose={closeKeyModal} title={newKey ? "API key created" : "New API key"}>
        {newKey ? (
          <div className="space-y-4">
            <p className="text-sm text-[var(--text)]">Copy this key now. For security, it won&apos;t be shown again.</p>
            <div className="flex items-center gap-2 p-3 bg-[var(--input-bg)] rounded-lg">
              <code className="text-xs font-mono text-[var(--text)] break-all flex-1">{newKey}</code>
              <button onClick={copyKey} className="flex-shrink-0 p-1.5 rounded-lg hover:bg-[var(--surface)] text-[var(--muted)] transition-colors">
                {copied ? <Check size={15} className="text-brand-green" /> : <Copy size={15} />}
              </button>
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={closeKeyModal}>Done</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">Name</label>
              <input
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                placeholder="e.g. Reporting integration"
                className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-[10px] px-3 py-2.5 text-sm text-[var(--text)] outline-none placeholder:text-[var(--muted)]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">Permissions</label>
              <div className="flex flex-wrap gap-3">
                {API_KEY_PERMISSIONS.map((p) => (
                  <label key={p.value} className="flex items-center gap-2 text-xs text-[var(--text)] cursor-pointer">
                    <input type="checkbox" checked={keyPerms.includes(p.value)} onChange={() => togglePerm(p.value)} className="accent-brand-green" />
                    {p.label}
                  </label>
                ))}
              </div>
            </div>
            {keyFormError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{keyFormError}</div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={closeKeyModal} disabled={keySaving}>Cancel</Button>
              <Button onClick={createApiKey} disabled={keySaving || !keyName.trim() || keyPerms.length === 0}>
                {keySaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</> : "Create key"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
