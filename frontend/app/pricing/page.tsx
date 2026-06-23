"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { useTheme } from "next-themes";
import { PublicNav } from "@/components/layout/public-nav";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Starter",
    monthly: 250,
    desc: "For NGOs and state agencies piloting agricultural lending",
    color: "#6b7280",
    features: [
      { f: "Up to 500 borrowers", ok: true },
      { f: "3 active programs", ok: true },
      { f: "Lender dashboard", ok: true },
      { f: "Email + SMS alerts", ok: true },
      { f: "FarmScore basic view", ok: true },
      { f: "CSV export", ok: true },
      { f: "Geospatial map view", ok: false },
      { f: "Field agent app", ok: false },
      { f: "FarmScore API access", ok: false },
      { f: "WhatsApp integration", ok: false },
      { f: "White-label option", ok: false },
    ],
  },
  {
    name: "Growth",
    monthly: 750,
    desc: "For banks and ministries managing active portfolios",
    color: "#1B5E20",
    hot: true,
    features: [
      { f: "Up to 5,000 borrowers", ok: true },
      { f: "Unlimited programs", ok: true },
      { f: "Full lender dashboard", ok: true },
      { f: "Email, SMS & WhatsApp alerts", ok: true },
      { f: "FarmScore full access", ok: true },
      { f: "CSV + PDF export", ok: true },
      { f: "Geospatial map view", ok: true },
      { f: "Field agent app", ok: true },
      { f: "FarmScore API access", ok: true },
      { f: "WhatsApp integration", ok: true },
      { f: "White-label option", ok: false },
    ],
  },
  {
    name: "Enterprise",
    monthly: null,
    desc: "For CBN, NIRSAL and national-scale programs",
    color: "#7c3aed",
    features: [
      { f: "Unlimited borrowers", ok: true },
      { f: "Unlimited programs", ok: true },
      { f: "Full lender dashboard", ok: true },
      { f: "All alert channels", ok: true },
      { f: "FarmScore full access", ok: true },
      { f: "All export formats", ok: true },
      { f: "Geospatial map view", ok: true },
      { f: "Field agent app", ok: true },
      { f: "FarmScore API access", ok: true },
      { f: "WhatsApp integration", ok: true },
      { f: "White-label option", ok: true },
    ],
  },
];

const faq = [
  {
    q: "Can I switch plans mid-month?",
    a: "Yes — you can upgrade at any time and we'll prorate the difference. Downgrading takes effect at the next billing cycle.",
  },
  {
    q: "Is there a free trial?",
    a: "All plans include a free 30-day pilot with full feature access. No credit card required to start.",
  },
  {
    q: "How is the transaction fee calculated?",
    a: "We charge 0.5–1.5% on every loan disbursed through the platform. This scales with volume — larger programs get better rates.",
  },
  {
    q: "Can state governments get their own branded version?",
    a: "Yes — our white-label Enterprise plan lets state ministries deploy AgroTrack under their own brand with custom colors and domain.",
  },
  {
    q: "What currencies do you support?",
    a: "Currently Nigerian Naira (₦) natively. Ghana Cedi, Kenyan Shilling, and USD support are launching in 2026 for our global expansion.",
  },
  {
    q: "How do I pay?",
    a: "We accept bank transfers, Paystack, Flutterwave, and invoice billing for government agencies. Monthly or annual options available.",
  },
];

export default function PricingPage() {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="bg-white dark:bg-gray-900 text-[var(--text)] min-h-screen">
      <PublicNav />

      {/* Hero */}
      <section
        className="pt-[68px] pb-24 px-6 text-center"
        style={{
          background: dark
            ? "linear-gradient(160deg,#0a1a0a 0%,#111827 100%)"
            : "linear-gradient(160deg,#042007 0%,#1B5E20 100%)",
        }}
      >
        <div className="max-w-[800px] mx-auto pt-20">
          <h1 className="text-[clamp(32px,5vw,56px)] font-black text-white leading-[1.1] tracking-tight mb-5">
            Transparent pricing.{" "}
            <span className="text-brand-gold">No hidden fees.</span>
          </h1>
          <p className="text-lg text-white/65 max-w-md mx-auto leading-relaxed mb-8">
            Start with a free 30-day pilot. No credit card. No commitment.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 bg-white/10 rounded-full px-4 py-1.5">
            <span className="text-sm text-white/80 font-medium">Monthly</span>
            <button
              onClick={() => setAnnual(!annual)}
              className="w-12 h-7 rounded-full relative transition-colors"
              style={{ background: annual ? "#F9A825" : "rgba(255,255,255,0.3)" }}
            >
              <div
                className="w-5 h-5 rounded-full bg-white absolute top-1 transition-all"
                style={{ left: annual ? 26 : 4 }}
              />
            </button>
            <span className="text-sm text-white/80 font-medium">Annual</span>
            <span className="bg-brand-gold text-brand-green text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              Save 20%
            </span>
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="px-6 -mt-12 pb-24">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl p-7 ${
                plan.hot
                  ? "shadow-xl shadow-green-600/15 scale-[1.02] z-10"
                  : ""
              }`}
              style={{
                background: plan.hot
                  ? "linear-gradient(160deg,#1B5E20,#2E7D32)"
                  : dark
                  ? "#1f2937"
                  : "#fff",
                border: plan.hot ? "none" : "1px solid var(--border)",
              }}
            >
              {plan.hot && (
                <>
                  <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-brand-gold to-amber-500 rounded-t-3xl" />
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-gold text-brand-green text-[10px] font-extrabold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                </>
              )}
              <h3
                className={`text-xl font-extrabold mb-1 ${
                  plan.hot ? "text-white" : "text-[var(--text)]"
                }`}
              >
                {plan.name}
              </h3>
              <p
                className={`text-xs mb-5 leading-relaxed ${
                  plan.hot ? "text-white/60" : "text-[var(--muted)]"
                }`}
              >
                {plan.desc}
              </p>
              <div className="mb-6">
                {plan.monthly ? (
                  <>
                    <span
                      className="text-4xl font-black"
                      style={{ color: plan.hot ? "#F9A825" : plan.color }}
                    >
                      ₦{annual
                        ? Math.round(plan.monthly * 0.8).toLocaleString()
                        : plan.monthly.toLocaleString()}
                      K
                    </span>
                    <span
                      className={`text-sm ${
                        plan.hot ? "text-white/55" : "text-[var(--muted)]"
                      }`}
                    >
                      /mo
                    </span>
                    {annual && (
                      <span
                        className={`block text-xs mt-1 ${
                          plan.hot ? "text-brand-gold" : ""
                        }`}
                        style={{ color: plan.hot ? undefined : plan.color }}
                      >
                        Save ₦{Math.round(plan.monthly * 0.2).toLocaleString()}
                        K/month billed annually
                      </span>
                    )}
                  </>
                ) : (
                  <span
                    className="text-3xl font-black"
                    style={{ color: plan.hot ? "#F9A825" : plan.color }}
                  >
                    Custom
                  </span>
                )}
              </div>
              <div className="space-y-2.5 mb-7">
                {plan.features.map(({ f, ok }) => (
                  <div key={f} className="flex items-center gap-2">
                    <div
                      className="w-[18px] h-[18px] rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: ok
                          ? plan.hot
                            ? "rgba(255,255,255,0.2)"
                            : "#dcfce7"
                          : dark
                          ? "#374151"
                          : "#f3f4f6",
                      }}
                    >
                      {ok ? (
                        <Check
                          size={10}
                          color={plan.hot ? "#fff" : "#16a34a"}
                        />
                      ) : (
                        <span className="text-[10px] text-[var(--muted)]">
                          —
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-sm ${
                        ok
                          ? plan.hot
                            ? "text-white/90"
                            : "text-[var(--text)]"
                          : "text-[var(--muted)]"
                      }`}
                    >
                      {f}
                    </span>
                  </div>
                ))}
              </div>
              <Link href="/signup">
                <Button
                  className="w-full"
                  style={{
                    background: plan.hot ? "#F9A825" : "transparent",
                    color: plan.hot ? "#1B5E20" : plan.color,
                    border: plan.hot ? "none" : `2px solid ${plan.color}`,
                  }}
                >
                  {plan.monthly ? "Start Free Trial" : "Contact Sales"}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Transaction Fees */}
      <section className="py-24 px-6 bg-[var(--surface)]">
        <div className="max-w-[1000px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <span className="inline-block text-[11px] font-bold text-green-600 uppercase tracking-widest bg-green-50 dark:bg-green-900/30 px-3.5 py-1 rounded-full mb-3">
              Additional Revenue Stream
            </span>
            <h2 className="text-2xl font-extrabold text-[var(--text)] mb-4">
              Transaction-based fees
            </h2>
            <p className="text-sm text-[var(--muted)] leading-relaxed mb-6">
              In addition to the monthly subscription, AgroTrack charges a small
              transaction fee on each loan disbursed through the platform —
              covering payment processing, verification, and infrastructure
              costs.
            </p>
            {[
              { tier: "Up to ₦50M/month disbursed", fee: "1.5% per disbursement" },
              { tier: "₦50M–₦500M/month", fee: "1.0% per disbursement" },
              { tier: "₦500M+/month", fee: "0.5% per disbursement" },
            ].map(({ tier, fee }) => (
              <div
                key={tier}
                className="flex justify-between p-4 bg-[var(--background)] border border-[var(--border)] rounded-xl mb-2"
              >
                <span className="text-sm text-[var(--muted)]">{tier}</span>
                <span className="text-sm font-bold text-[var(--text)]">
                  {fee}
                </span>
              </div>
            ))}
          </div>
          <div>
            <span className="inline-block text-[11px] font-bold text-green-600 uppercase tracking-widest bg-green-50 dark:bg-green-900/30 px-3.5 py-1 rounded-full mb-3">
              Earn With AgroTrack
            </span>
            <h2 className="text-2xl font-extrabold text-[var(--text)] mb-4">
              FarmScore API revenue
            </h2>
            <p className="text-sm text-[var(--muted)] leading-relaxed mb-6">
              Banks, MFIs and other lenders can query FarmScore data for
              borrowers registered on AgroTrack. You earn a share of every API
              call sold to third parties.
            </p>
            {[
              { who: "Commercial banks", fee: "₦1,500 per query" },
              { who: "Microfinance banks", fee: "₦800 per query" },
              { who: "Agri-fintechs", fee: "₦500 per query" },
            ].map(({ who, fee }) => (
              <div
                key={who}
                className="flex justify-between p-4 bg-[var(--background)] border border-[var(--border)] rounded-xl mb-2"
              >
                <span className="text-sm text-[var(--muted)]">{who}</span>
                <span className="text-sm font-bold text-brand-green">{fee}</span>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-[760px] mx-auto mt-20">
          <h3 className="text-2xl font-extrabold text-[var(--text)] text-center mb-8">
            Frequently Asked Questions
          </h3>
          {faq.map(({ q, a }, i) => (
            <div
              key={i}
              className="border border-[var(--border)] rounded-2xl mb-2 overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex justify-between items-center p-5 text-left bg-[var(--background)] hover:bg-[var(--surface)] transition-colors"
              >
                <span className="text-sm font-semibold text-[var(--text)]">
                  {q}
                </span>
                <span
                  className="text-lg text-[var(--muted)] transition-transform"
                  style={{
                    transform: openFaq === i ? "rotate(45deg)" : "none",
                  }}
                >
                  +
                </span>
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5 bg-[var(--surface)]">
                  <p className="text-sm text-[var(--muted)] leading-relaxed">
                    {a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-20 px-6 text-center"
        style={{ background: "linear-gradient(135deg,#1B5E20,#2E7D32)" }}
      >
        <div className="max-w-[600px] mx-auto">
          <h2 className="text-3xl font-black text-white mb-4">
            Start your free 30-day pilot
          </h2>
          <p className="text-white/70 mb-8">
            No credit card. No setup fee. Full platform access.
          </p>
          <Link href="/signup">
            <Button variant="gold" size="lg">
              Get Started Free <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
