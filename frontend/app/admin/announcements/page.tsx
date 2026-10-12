"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Plus, Send, Trash2, Megaphone, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { StatusPill } from "@/components/ui/badge";
import {
  adminApi,
  BROADCAST_AUDIENCE_ROLES,
  BROADCAST_CHANNELS,
  type AdminBroadcast,
  type AdminMessageTemplate,
  type CreateBroadcastRequest,
} from "@/lib/api";
import { AxiosError } from "axios";

const titleCase = (v: string) =>
  v
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });

const LIMIT = 20;

const BROADCAST_STATUSES = [
  { value: "", label: "All" },
  { value: "DRAFT", label: "Drafts" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "SENDING", label: "Sending" },
  { value: "SENT", label: "Sent" },
  { value: "FAILED", label: "Failed" },
];

// Tab set
type Tab = "broadcasts" | "templates";

export default function AnnouncementsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("broadcasts");

  // Broadcasts
  const [broadcasts, setBroadcasts] = useState<AdminBroadcast[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("");

  const loadBroadcasts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminApi.getBroadcasts({
        status: statusFilter || undefined,
        page,
        limit: LIMIT,
      });
      setBroadcasts(res.data);
      setTotal(res.pagination.total);
      setTotalPages(res.pagination.totalPages);
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message || "Failed to load announcements");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    void loadBroadcasts();
  }, [loadBroadcasts]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  // Composer
  const [composing, setComposing] = useState(false);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [audienceType, setAudienceType] = useState<"ALL" | "ROLE">("ALL");
  const [audienceRoles, setAudienceRoles] = useState<string[]>([]);
  const [channels, setChannels] = useState<string[]>(["IN_APP"]);
  const [saving, setSaving] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [composerError, setComposerError] = useState<string | null>(null);

  const toggleRole = (role: string) =>
    setAudienceRoles((prev) => prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]);

  const toggleChannel = (ch: string) =>
    setChannels((prev) => prev.includes(ch) ? prev.filter((c) => c !== ch) : [...prev, ch]);

  const create = async () => {
    if (!content.trim()) return;
    setSaving(true);
    setComposerError(null);
    try {
      const payload: CreateBroadcastRequest = {
        subject: subject.trim() || undefined,
        content: content.trim(),
        audience: audienceType === "ALL" ? { type: "ALL" } : { type: "ROLE", roles: audienceRoles },
        channels,
      };
      await adminApi.createBroadcast(payload);
      setComposing(false);
      setSubject("");
      setContent("");
      setAudienceType("ALL");
      setAudienceRoles([]);
      setChannels(["IN_APP"]);
      void loadBroadcasts();
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setComposerError(axiosError.response?.data?.message || "Failed to create announcement");
    } finally {
      setSaving(false);
    }
  };

  const send = async (id: string) => {
    setSendingId(id);
    try {
      await adminApi.sendBroadcast(id);
      void loadBroadcasts();
    } catch {
      // State reload will show error
    } finally {
      setSendingId(null);
    }
  };

  const del = async (id: string) => {
    try {
      await adminApi.deleteBroadcast(id);
      void loadBroadcasts();
    } catch {
      // ignore
    }
  };

  // Templates
  const [templates, setTemplates] = useState<AdminMessageTemplate[]>([]);
  const [templateLoading, setTemplateLoading] = useState(false);
  const [templateError, setTemplateError] = useState<string | null>(null);

  const [creatingTemplate, setCreatingTemplate] = useState(false);
  const [tplName, setTplName] = useState("");
  const [tplCategory, setTplCategory] = useState("General");
  const [tplContent, setTplContent] = useState("");
  const [tplSaving, setTplSaving] = useState(false);
  const [tplError, setTplError] = useState<string | null>(null);

  const loadTemplates = useCallback(async () => {
    setTemplateLoading(true);
    setTemplateError(null);
    try {
      const data = await adminApi.getTemplates();
      setTemplates(data);
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setTemplateError(axiosError.response?.data?.message || "Failed to load templates");
    } finally {
      setTemplateLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "templates") void loadTemplates();
  }, [activeTab, loadTemplates]);

  const createTemplate = async () => {
    if (!tplName.trim() || !tplContent.trim()) return;
    setTplSaving(true);
    setTplError(null);
    try {
      await adminApi.createTemplate({
        name: tplName.trim(),
        category: tplCategory.trim() || "General",
        content: tplContent.trim(),
        channels: ["IN_APP"],
      });
      setCreatingTemplate(false);
      setTplName("");
      setTplCategory("General");
      setTplContent("");
      void loadTemplates();
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setTplError(axiosError.response?.data?.message || "Failed to create template");
    } finally {
      setTplSaving(false);
    }
  };

  const delTemplate = async (id: string) => {
    try {
      await adminApi.deleteTemplate(id);
      void loadTemplates();
    } catch {
      // ignore
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[22px] font-extrabold text-[var(--text)] mb-1">Announcements</h1>
          <p className="text-[13px] text-[var(--muted)]">Create and send platform-wide broadcasts</p>
        </div>
        {activeTab === "broadcasts" && (
          <Button onClick={() => setComposing(true)}>
            <Plus className="mr-2 h-4 w-4" /> Compose
          </Button>
        )}
        {activeTab === "templates" && (
          <Button onClick={() => setCreatingTemplate(true)}>
            <Plus className="mr-2 h-4 w-4" /> New template
          </Button>
        )}
      </div>

      <div className="flex items-center gap-1 mb-5 bg-[var(--input-bg)] p-1 rounded-xl w-fit">
        {(["broadcasts", "templates"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-1.5 rounded-[10px] text-[13px] font-semibold transition-colors ${
              activeTab === t
                ? "bg-white dark:bg-slate-800 text-[var(--text)] shadow-sm"
                : "text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            {t === "broadcasts" ? (
              <><Megaphone className="inline mr-1.5" size={13} /> Broadcasts</>
            ) : (
              <><FileText className="inline mr-1.5" size={13} /> Templates</>
            )}
          </button>
        ))}
      </div>

      {activeTab === "broadcasts" && (
        <>
          <div className="flex items-center gap-3 mb-5">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[var(--input-bg)] border border-[var(--border)] rounded-[10px] px-3 py-2 text-[13px] text-[var(--text)] outline-none"
            >
              {BROADCAST_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
          )}

          <Card className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-brand-green" />
              </div>
            ) : broadcasts.length === 0 ? (
              <div className="py-16 text-center text-sm text-[var(--muted)]">No announcements yet</div>
            ) : (
              <>
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Subject</th>
                      <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Audience</th>
                      <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Channels</th>
                      <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Status</th>
                      <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Sent</th>
                      <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {broadcasts.map((b) => {
                      const audience = b.audience as any;
                      const audienceLabel =
                        !audience || audience.type === "ALL" || typeof audience === "string"
                          ? "All users"
                          : Array.isArray(audience.roles)
                          ? audience.roles.map((r: string) => titleCase(r)).join(", ")
                          : "All users";
                      return (
                        <tr key={b.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--input-bg)] transition-colors">
                          <td className="py-3 text-xs font-medium text-[var(--text)] max-w-[220px] truncate">
                            {b.subject || "(No subject)"}
                          </td>
                          <td className="py-3 text-xs text-[var(--muted)] max-w-[180px] truncate">{audienceLabel}</td>
                          <td className="py-3 text-xs text-[var(--text)]">
                            {b.channels?.map((c: string) => titleCase(c)).join(", ") || "In-App"}
                          </td>
                          <td className="py-3"><StatusPill status={titleCase(b.status)} /></td>
                          <td className="py-3 text-xs text-[var(--muted)]">
                            {b.sentAt ? fmtDateTime(b.sentAt) : "—"}
                            {b.status === "SENT" && (
                              <span className="block text-[10px]">{b.sentCount?.toLocaleString() ?? 0} sent</span>
                            )}
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              {(b.status === "DRAFT" || b.status === "SCHEDULED") && (
                                <>
                                  <Button size="sm" variant="secondary" onClick={() => send(b.id)} disabled={sendingId === b.id}>
                                    {sendingId === b.id ? (
                                      <>
                                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Sending...
                                      </>
                                    ) : (
                                      <><Send className="mr-1.5 h-3.5 w-3.5" /> Send</>
                                    )}
                                  </Button>
                                  <Button size="sm" variant="ghost" onClick={() => del(b.id)} className="text-red-500 hover:text-red-600 px-2">
                                    <Trash2 size={15} />
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <Pagination page={page} totalPages={totalPages} onChange={setPage} />
              </>
            )}
          </Card>

          {/* Compose modal */}
          <Modal open={composing} onClose={() => setComposing(false)} title="Compose announcement">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">Subject</label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Optional subject line..."
                  className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-[10px] px-3 py-2.5 text-sm text-[var(--text)] outline-none placeholder:text-[var(--muted)]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  placeholder="Write your message... Use {{firstName}} for personalization."
                  className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-[10px] px-3 py-2.5 text-sm text-[var(--text)] outline-none resize-none placeholder:text-[var(--muted)]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">Audience</label>
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setAudienceType("ALL")}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                      audienceType === "ALL"
                        ? "bg-brand-green text-white border-brand-green"
                        : "bg-[var(--input-bg)] text-[var(--text)] border-[var(--border)]"
                    }`}
                  >
                    All users
                  </button>
                  <button
                    type="button"
                    onClick={() => setAudienceType("ROLE")}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                      audienceType === "ROLE"
                        ? "bg-brand-green text-white border-brand-green"
                        : "bg-[var(--input-bg)] text-[var(--text)] border-[var(--border)]"
                    }`}
                  >
                    By role
                  </button>
                </div>
                {audienceType === "ROLE" && (
                  <div className="flex flex-wrap gap-1.5">
                    {BROADCAST_AUDIENCE_ROLES.map((r) => (
                      <button
                        key={r.value}
                        onClick={() => toggleRole(r.value)}
                        className={`px-2 py-1 text-[10px] font-semibold rounded-md border transition-colors ${
                          audienceRoles.includes(r.value)
                            ? "bg-brand-green/10 text-brand-green border-brand-green/30"
                            : "bg-[var(--input-bg)] text-[var(--muted)] border-[var(--border)]"
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">Channels</label>
                <div className="flex flex-wrap gap-1.5">
                  {BROADCAST_CHANNELS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => toggleChannel(c.value)}
                      className={`px-2 py-1 text-[10px] font-semibold rounded-md border transition-colors ${
                        channels.includes(c.value)
                          ? "bg-brand-green/10 text-brand-green border-brand-green/30"
                          : "bg-[var(--input-bg)] text-[var(--muted)] border-[var(--border)]"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
              {composerError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{composerError}</div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={() => setComposing(false)} disabled={saving}>Cancel</Button>
                <Button onClick={create} disabled={saving || !content.trim()}>
                  {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Create draft"}
                </Button>
              </div>
            </div>
          </Modal>
        </>
      )}

      {activeTab === "templates" && (
        <>
          {templateError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{templateError}</div>
          )}

          <Card className="overflow-x-auto">
            {templateLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-brand-green" />
              </div>
            ) : templates.length === 0 ? (
              <div className="py-16 text-center text-sm text-[var(--muted)]">No templates yet</div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Name</th>
                    <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Category</th>
                    <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Variables</th>
                    <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">Created</th>
                    <th className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {templates.map((t) => (
                    <tr key={t.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--input-bg)] transition-colors">
                      <td className="py-3 text-xs font-medium text-[var(--text)]">{t.name}</td>
                      <td className="py-3 text-xs text-[var(--muted)]">{t.category}</td>
                      <td className="py-3 text-xs text-[var(--muted)]">
                        {t.variables?.length ? t.variables.join(", ") : "—"}
                      </td>
                      <td className="py-3 text-xs text-[var(--muted)]">{fmtDateTime(t.createdAt)}</td>
                      <td className="py-3 text-right">
                        <Button size="sm" variant="ghost" onClick={() => delTemplate(t.id)} className="text-red-500 hover:text-red-600 px-2">
                          <Trash2 size={15} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>

          {/* Create template modal */}
          <Modal open={creatingTemplate} onClose={() => setCreatingTemplate(false)} title="Create template">
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">Name</label>
                <input
                  value={tplName}
                  onChange={(e) => setTplName(e.target.value)}
                  placeholder="e.g. Payment reminder"
                  className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-[10px] px-3 py-2.5 text-sm text-[var(--text)] outline-none placeholder:text-[var(--muted)]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">Category</label>
                <input
                  value={tplCategory}
                  onChange={(e) => setTplCategory(e.target.value)}
                  placeholder="General"
                  className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-[10px] px-3 py-2.5 text-sm text-[var(--text)] outline-none placeholder:text-[var(--muted)]"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">Content</label>
                <textarea
                  value={tplContent}
                  onChange={(e) => setTplContent(e.target.value)}
                  rows={5}
                  placeholder="Use {{variable}} syntax for personalization fields."
                  className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-[10px] px-3 py-2.5 text-sm text-[var(--text)] outline-none resize-none placeholder:text-[var(--muted)]"
                />
              </div>
              {tplError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{tplError}</div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" onClick={() => setCreatingTemplate(false)} disabled={tplSaving}>Cancel</Button>
                <Button onClick={createTemplate} disabled={tplSaving || !tplName.trim() || !tplContent.trim()}>
                  {tplSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Create template"}
                </Button>
              </div>
            </div>
          </Modal>
        </>
      )}
    </div>
  );
}
