"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, FileText, RefreshCw, Plus, Ban } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Pagination } from "@/components/ui/pagination";
import { StatusPill } from "@/components/ui/badge";
import { PieChartComponent } from "@/components/charts/pie-chart";
import {
  adminApi,
  INVOICE_STATUSES,
  SUBSCRIPTION_STATUSES,
  PAYMENT_METHODS,
  type RevenueStats,
  type AdminInvoice,
  type AdminInvoiceDetail,
  type AdminSubscription,
} from "@/lib/api";
import { formatCompactCurrency } from "@/lib/utils";
import { AxiosError } from "axios";

const SLICE_COLORS = ["#1B5E20", "#F9A825", "#2563eb", "#7c3aed", "#16a34a", "#dc2626"];
const LIMIT = 20;

const titleCase = (s: string) =>
  s
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

type Tab = "overview" | "invoices" | "subscriptions";

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // ── Overview (revenue stats) ──
  const [stats, setStats] = useState<RevenueStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      setStats(await adminApi.getRevenueStats());
    } catch (err) {
      const e = err as AxiosError<{ message?: string }>;
      setStatsError(e.response?.data?.message || "Failed to load revenue stats");
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // ── Invoices ──
  const [invoices, setInvoices] = useState<AdminInvoice[]>([]);
  const [invTotalPages, setInvTotalPages] = useState(1);
  const [invPage, setInvPage] = useState(1);
  const [invStatus, setInvStatus] = useState("");
  const [invLoading, setInvLoading] = useState(true);
  const [invError, setInvError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const loadInvoices = useCallback(async () => {
    setInvLoading(true);
    setInvError(null);
    try {
      const res = await adminApi.getInvoices({
        page: invPage,
        limit: LIMIT,
        status: invStatus || undefined,
      });
      setInvoices(res.data);
      setInvTotalPages(res.pagination.totalPages);
    } catch (err) {
      const e = err as AxiosError<{ message?: string }>;
      setInvError(e.response?.data?.message || "Failed to load invoices");
    } finally {
      setInvLoading(false);
    }
  }, [invPage, invStatus]);

  // ── Subscriptions ──
  const [subs, setSubs] = useState<AdminSubscription[]>([]);
  const [subTotalPages, setSubTotalPages] = useState(1);
  const [subPage, setSubPage] = useState(1);
  const [subStatus, setSubStatus] = useState("");
  const [subLoading, setSubLoading] = useState(true);
  const [subError, setSubError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  const loadSubs = useCallback(async () => {
    setSubLoading(true);
    setSubError(null);
    try {
      const res = await adminApi.getSubscriptions({
        page: subPage,
        limit: LIMIT,
        status: subStatus || undefined,
      });
      setSubs(res.data);
      setSubTotalPages(res.pagination.totalPages);
    } catch (err) {
      const e = err as AxiosError<{ message?: string }>;
      setSubError(e.response?.data?.message || "Failed to load subscriptions");
    } finally {
      setSubLoading(false);
    }
  }, [subPage, subStatus]);

  useEffect(() => {
    if (activeTab === "overview") void loadStats();
    else if (activeTab === "invoices") void loadInvoices();
    else void loadSubs();
  }, [activeTab, loadStats, loadInvoices, loadSubs]);

  // ── Invoice detail / actions ──
  const [detail, setDetail] = useState<AdminInvoiceDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  const openDetail = async (id: string) => {
    setDetailId(id);
    setDetailLoading(true);
    setDetail(null);
    try {
      setDetail(await adminApi.getInvoice(id));
    } catch {
      setDetailId(null);
    } finally {
      setDetailLoading(false);
    }
  };

  // Record-payment form
  const [payOpen, setPayOpen] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState(PAYMENT_METHODS[0].value);
  const [payReference, setPayReference] = useState("");
  const [paySaving, setPaySaving] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);

  const closeDetail = () => {
    setDetailId(null);
    setDetail(null);
    setPayOpen(false);
    setPayError(null);
  };

  const submitPayment = async () => {
    if (!detail) return;
    const amount = Number(payAmount);
    if (!amount || amount <= 0) {
      setPayError("Enter a valid amount");
      return;
    }
    setPaySaving(true);
    setPayError(null);
    try {
      const updated = await adminApi.recordPayment(detail.id, {
        amount,
        method: payMethod,
        reference: payReference.trim() || undefined,
      });
      setDetail(updated);
      setPayOpen(false);
      setPayAmount("");
      setPayReference("");
      void loadInvoices();
    } catch (err) {
      const e = err as AxiosError<{ message?: string }>;
      setPayError(e.response?.data?.message || "Failed to record payment");
    } finally {
      setPaySaving(false);
    }
  };

  const voidInvoice = async () => {
    if (!detail) return;
    try {
      const updated = await adminApi.voidInvoice(detail.id);
      setDetail(updated);
      void loadInvoices();
    } catch {
      void openDetail(detail.id);
    }
  };

  const generateInvoices = async () => {
    setGenerating(true);
    try {
      await adminApi.generateInvoices();
      setInvPage(1);
      void loadInvoices();
    } finally {
      setGenerating(false);
    }
  };

  const seedSubscriptions = async () => {
    setSeeding(true);
    try {
      await adminApi.seedSubscriptions();
      setSubPage(1);
      void loadSubs();
    } finally {
      setSeeding(false);
    }
  };

  const breakdown = (stats?.breakdown ?? []).map((b, i) => ({
    ...b,
    color: SLICE_COLORS[i % SLICE_COLORS.length],
  }));
  const planTotal = (stats?.planDistribution ?? []).reduce((s, p) => s + p.value, 0) || 1;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[22px] font-extrabold text-[var(--text)] mb-1">Billing &amp; Revenue</h1>
          <p className="text-[13px] text-[var(--muted)]">Subscriptions, invoices, and platform revenue</p>
        </div>
        {activeTab === "invoices" && (
          <Button onClick={generateInvoices} disabled={generating}>
            {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            Generate invoices
          </Button>
        )}
        {activeTab === "subscriptions" && (
          <Button onClick={seedSubscriptions} disabled={seeding}>
            {seeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Backfill subscriptions
          </Button>
        )}
      </div>

      <div className="flex items-center gap-1 mb-5 bg-[var(--input-bg)] p-1 rounded-xl w-fit">
        {(["overview", "invoices", "subscriptions"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-1.5 rounded-[10px] text-[13px] font-semibold transition-colors capitalize ${
              activeTab === t
                ? "bg-white dark:bg-slate-800 text-[var(--text)] shadow-sm"
                : "text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {activeTab === "overview" && <OverviewTab />}
      {activeTab === "invoices" && <InvoicesTab />}
      {activeTab === "subscriptions" && <SubscriptionsTab />}

      {/* Invoice detail */}
      <Modal open={!!detailId} onClose={closeDetail} title="Invoice detail" wide>
        {detailLoading || !detail ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-brand-green" />
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-lg font-mono font-bold text-[var(--text)]">{detail.number}</p>
                <p className="text-xs text-[var(--muted)] mt-0.5">{detail.lenderName}</p>
              </div>
              <StatusPill status={titleCase(detail.status)} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Amount", value: formatCompactCurrency(detail.amount) },
                { label: "Issued", value: fmtDate(detail.issuedAt) },
                { label: "Due", value: fmtDate(detail.dueAt) },
                { label: "Paid", value: detail.paidAt ? fmtDate(detail.paidAt) : "—" },
              ].map((f) => (
                <div key={f.label} className="bg-[var(--input-bg)] rounded-lg p-3">
                  <p className="text-[10px] uppercase font-semibold text-[var(--muted)] mb-1">{f.label}</p>
                  <p className="text-sm font-bold text-[var(--text)]">{f.value}</p>
                </div>
              ))}
            </div>

            <div>
              <h4 className="text-xs font-bold text-[var(--text)] uppercase tracking-wide mb-2">Line items</h4>
              <div className="space-y-1.5">
                {detail.lineItems.map((li, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text)]">
                      {li.description}
                      {li.quantity > 1 && <span className="text-[var(--muted)]"> × {li.quantity}</span>}
                    </span>
                    <span className="font-semibold text-[var(--text)]">{formatCompactCurrency(li.amount * li.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-[var(--text)] uppercase tracking-wide mb-2">Payments</h4>
              {detail.payments.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">No payments recorded</p>
              ) : (
                <div className="space-y-1.5">
                  {detail.payments.map((p) => (
                    <div key={p.id} className="flex items-center justify-between text-sm border-b border-[var(--border)] last:border-0 pb-1.5">
                      <div>
                        <span className="text-[var(--text)] capitalize">{p.method.replace(/_/g, " ")}</span>
                        {p.reference && <span className="text-[var(--muted)] text-xs ml-2">Ref: {p.reference}</span>}
                        <span className="text-[var(--muted)] text-xs ml-2">{fmtDate(p.paidAt)}</span>
                      </div>
                      <span className="font-semibold text-[var(--text)]">{formatCompactCurrency(p.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {payOpen && (
              <div className="border border-[var(--border)] rounded-xl p-4 space-y-3">
                <h4 className="text-sm font-bold text-[var(--text)]">Record payment</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">Amount</label>
                    <input
                      type="number"
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      placeholder={String(detail.amount)}
                      className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-[10px] px-3 py-2.5 text-sm text-[var(--text)] outline-none placeholder:text-[var(--muted)]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">Method</label>
                    <select
                      value={payMethod}
                      onChange={(e) => setPayMethod(e.target.value)}
                      className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-[10px] px-3 py-2.5 text-sm text-[var(--text)] outline-none"
                    >
                      {PAYMENT_METHODS.map((m) => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">Reference (optional)</label>
                  <input
                    value={payReference}
                    onChange={(e) => setPayReference(e.target.value)}
                    placeholder="Transfer reference / receipt no."
                    className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-[10px] px-3 py-2.5 text-sm text-[var(--text)] outline-none placeholder:text-[var(--muted)]"
                  />
                </div>
                {payError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{payError}</div>
                )}
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" onClick={() => setPayOpen(false)} disabled={paySaving}>Cancel</Button>
                  <Button onClick={submitPayment} disabled={paySaving}>
                    {paySaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Record payment"}
                  </Button>
                </div>
              </div>
            )}

            {detail.status !== "PAID" && detail.status !== "VOID" && !payOpen && (
              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" onClick={voidInvoice}>
                  <Ban size={14} className="mr-1.5" /> Void invoice
                </Button>
                <Button onClick={() => { setPayError(null); setPayOpen(true); }}>
                  <Plus size={14} className="mr-1.5" /> Record payment
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );

  // ── Tab renderers (closures over state above) ──

  function OverviewTab() {
    if (statsLoading) {
      return (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-brand-green" />
        </div>
      );
    }
    return (
      <>
        {statsError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{statsError}</div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          {[
            { label: "MRR", value: stats ? formatCompactCurrency(stats.mrr) : "—" },
            { label: "ARR", value: stats ? formatCompactCurrency(stats.arr) : "—" },
            { label: "Total Collected", value: stats ? formatCompactCurrency(stats.totalCollected) : "—" },
            { label: "Total Disbursed", value: stats ? formatCompactCurrency(stats.totalDisbursed) : "—" },
          ].map((m) => (
            <Card key={m.label}>
              <p className="text-[11px] text-[var(--muted)] uppercase font-semibold mb-1">{m.label}</p>
              <p className="text-2xl font-extrabold text-[var(--text)]">{m.value}</p>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card>
            <h3 className="text-sm font-bold text-[var(--text)] mb-4">MRR by Plan</h3>
            {breakdown.length === 0 ? (
              <div className="py-12 text-center text-sm text-[var(--muted)]">No subscription revenue yet</div>
            ) : (
              <>
                <PieChartComponent data={breakdown} size={220} />
                <div className="space-y-2 mt-4">
                  {breakdown.map((r) => (
                    <div key={r.name} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: r.color }} />
                      <span className="text-xs text-[var(--muted)] flex-1">{titleCase(r.name)}</span>
                      <span className="text-xs font-bold text-[var(--text)]">{formatCompactCurrency(r.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>
          <Card>
            <h3 className="text-sm font-bold text-[var(--text)] mb-4">Plan Distribution</h3>
            {(stats?.planDistribution ?? []).length === 0 ? (
              <div className="py-12 text-center text-sm text-[var(--muted)]">No plan data</div>
            ) : (
              <div className="space-y-4">
                {stats!.planDistribution.map((p) => {
                  const pct = Math.round((p.value / planTotal) * 100);
                  return (
                    <div key={p.name}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-[var(--text)]">{titleCase(p.name)}</span>
                        <span className="text-xs text-[var(--muted)]">{p.value.toLocaleString()} subs · {pct}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-[var(--input-bg)] overflow-hidden">
                        <div className="h-full rounded-full bg-brand-green" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </>
    );
  }

  function InvoicesTab() {
    return (
      <>
        <div className="mb-4 flex items-center gap-2">
          <select
            value={invStatus}
            onChange={(e) => {
              setInvStatus(e.target.value);
              setInvPage(1);
            }}
            className="bg-[var(--input-bg)] border border-[var(--border)] rounded-[10px] px-3 py-2 text-sm text-[var(--text)] outline-none"
          >
            <option value="">All statuses</option>
            {INVOICE_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        {invError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{invError}</div>
        )}
        <Card className="overflow-x-auto">
          {invLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-brand-green" />
            </div>
          ) : invoices.length === 0 ? (
            <div className="py-16 text-center text-sm text-[var(--muted)]">No invoices yet</div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  {["Invoice", "Lender", "Amount", "Status", "Issued", "Due", ""].map((h) => (
                    <th key={h} className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--input-bg)] transition-colors">
                    <td className="py-3 text-xs font-mono font-medium text-[var(--text)]">{inv.number}</td>
                    <td className="py-3 text-xs text-[var(--text)]">{inv.lenderName}</td>
                    <td className="py-3 text-xs font-semibold text-[var(--text)]">{formatCompactCurrency(inv.amount)}</td>
                    <td className="py-3"><StatusPill status={titleCase(inv.status)} /></td>
                    <td className="py-3 text-xs text-[var(--muted)]">{fmtDate(inv.issuedAt)}</td>
                    <td className="py-3 text-xs text-[var(--muted)]">{fmtDate(inv.dueAt)}</td>
                    <td className="py-3 text-right">
                      <Button size="sm" variant="secondary" onClick={() => openDetail(inv.id)}>
                        <FileText size={13} className="mr-1" /> View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <Pagination page={invPage} totalPages={invTotalPages} onChange={setInvPage} />
        </Card>
      </>
    );
  }

  function SubscriptionsTab() {
    return (
      <>
        <div className="mb-4 flex items-center gap-2">
          <select
            value={subStatus}
            onChange={(e) => {
              setSubStatus(e.target.value);
              setSubPage(1);
            }}
            className="bg-[var(--input-bg)] border border-[var(--border)] rounded-[10px] px-3 py-2 text-sm text-[var(--text)] outline-none"
          >
            <option value="">All statuses</option>
            {SUBSCRIPTION_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        {subError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{subError}</div>
        )}
        <Card className="overflow-x-auto">
          {subLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-brand-green" />
            </div>
          ) : subs.length === 0 ? (
            <div className="py-16 text-center text-sm text-[var(--muted)]">No subscriptions yet</div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  {["Lender", "Plan", "Amount / mo", "Status", "Period ends"].map((h) => (
                    <th key={h} className="text-[11px] font-semibold text-[var(--muted)] pb-3 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {subs.map((s) => (
                  <tr key={s.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--input-bg)] transition-colors">
                    <td className="py-3 text-xs font-medium text-[var(--text)]">{s.lenderName}</td>
                    <td className="py-3 text-xs text-[var(--text)]">{titleCase(s.plan)}</td>
                    <td className="py-3 text-xs font-semibold text-[var(--text)]">{formatCompactCurrency(s.amount)}</td>
                    <td className="py-3"><StatusPill status={titleCase(s.status)} /></td>
                    <td className="py-3 text-xs text-[var(--muted)]">{fmtDate(s.currentPeriodEnd)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <Pagination page={subPage} totalPages={subTotalPages} onChange={setSubPage} />
        </Card>
      </>
    );
  }
}
