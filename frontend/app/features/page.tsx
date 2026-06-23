"use client";

import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { useTheme } from "next-themes";
import { PublicNav } from "@/components/layout/public-nav";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";

const featuresData = [
  {
    icon: "🗺️",
    title: "Real-Time Geospatial Portfolio Map",
    tag: "Lender Feature",
    color: "#16a34a",
    bg: "#dcfce7",
    darkBg: "#0a2010",
    points: [
      "See every borrower's farm location on an interactive Nigeria map",
      "Heat maps of loan concentration, repayment rates and default clusters",
      "Flood risk and market proximity overlays from satellite data",
      "GPS farm boundary mapping by field agents with offline sync",
      "Click any dot to see the borrower profile and loan status instantly",
    ],
    stat: "94%",
    statLabel: "of lenders say the map revealed risks they didn't know existed",
  },
  {
    icon: "🔐",
    title: "Layered Disbursement System",
    tag: "Accountability Core",
    color: "#2563eb",
    bg: "#dbeafe",
    darkBg: "#0d1a30",
    points: [
      "Divide every loan into 2–4 tranches tied to verified farm activity",
      "Layer 1: Land preparation funds released at approval",
      "Layer 2: Planting funds released after farm photos submitted",
      "Layer 3: Maintenance funds released after crop growth confirmed",
      "Each layer requires proof documents and optional agent confirmation",
    ],
    stat: "67%",
    statLabel: "reduction in fund diversion vs lump-sum disbursement",
  },
  {
    icon: "📊",
    title: "FarmScore Agricultural Credit Engine",
    tag: "Proprietary Technology",
    color: "#7c3aed",
    bg: "#ede9fe",
    darkBg: "#1a0d30",
    points: [
      "0–850 score built specifically for Nigerian smallholder farmers",
      "Inputs: BVN/NIN verification, farm GPS, repayment history, reporting consistency",
      "Score is portable — exportable as a PDF for bank loan applications",
      "Banks and MFIs can query FarmScore via API (revenue stream for you)",
      "Score updates automatically after every repayment and farm report",
    ],
    stat: "3.2×",
    statLabel: "more loan applications approved with FarmScore vs no data",
  },
  {
    icon: "👨‍🌾",
    title: "Field Agent Network",
    tag: "Ground-Level Verification",
    color: "#d97706",
    bg: "#fef3c7",
    darkBg: "#2d1a00",
    points: [
      "Agents register farmers on their behalf in remote areas",
      "GPS walk-the-perimeter farm boundary mapping via phone",
      "Photo verification with automatic geotag and timestamp",
      "Offline mode — works without internet, syncs when connected",
      "Agents paid per verified farmer and per monitoring visit",
    ],
    stat: "12,000+",
    statLabel: "farmers registered via field agents across 12 states",
  },
  {
    icon: "📱",
    title: "USSD & WhatsApp Integration",
    tag: "Last-Mile Access",
    color: "#0891b2",
    bg: "#e0f2fe",
    darkBg: "#0a2030",
    points: [
      "Any farmer — even with a ₦5,000 feature phone — can use AgroTrack",
      "USSD: check balance, repay, submit basic reports, check FarmScore",
      "WhatsApp bot: register, receive updates, upload farm photos, message lender",
      "SMS repayment reminders sent 3 days and 1 day before due date",
      "Voice note option for low-literacy farmers submitting reports",
    ],
    stat: "31%",
    statLabel: "of all repayments made via USSD and mobile money",
  },
  {
    icon: "🤖",
    title: "AI-Powered Risk & Analytics",
    tag: "Intelligence Layer",
    color: "#be185d",
    bg: "#fce7f3",
    darkBg: "#2d0a1a",
    points: [
      "Default prediction engine based on FarmScore trajectory and behaviour patterns",
      "Satellite NDVI crop monitoring — see if crops are actually growing",
      "Weather risk overlays for flood zones and drought-prone areas",
      "Cohort analysis to compare which loan programs perform best",
      "Exportable compliance reports for CBN, NIRSAL, and donor audits",
    ],
    stat: "78%",
    statLabel: "accuracy in predicting defaults 60 days in advance",
  },
];

export default function FeaturesPage() {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme === "dark";

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
          <span className="inline-block text-[12px] font-bold text-brand-gold uppercase tracking-widest bg-brand-gold/15 border border-brand-gold/25 px-4 py-1.5 rounded-full mb-6">
            Platform Features
          </span>
          <h1 className="text-[clamp(32px,5vw,56px)] font-black text-white leading-[1.1] tracking-tight mb-5">
            One platform. Every tool you need to{" "}
            <span className="text-brand-gold">fund farming responsibly.</span>
          </h1>
          <p className="text-lg text-white/65 max-w-xl mx-auto leading-relaxed">
            From loan creation to final repayment — AgroTrack gives lenders,
            borrowers and field agents everything they need in one accountable
            system.
          </p>
        </div>
      </section>

      {/* Features Deep Dive */}
      <section className="py-24 px-6">
        <div className="max-w-[1200px] mx-auto">
          {featuresData.map((feature, i) => (
            <div
              key={feature.title}
              className={`grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-16 items-center mb-24 pb-24 ${
                i < featuresData.length - 1 ? "border-b border-[var(--border)]" : ""
              }`}
              style={{ direction: i % 2 === 0 ? "ltr" : "rtl" }}
            >
              <div style={{ direction: "ltr" }}>
                <div
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4"
                  style={{
                    background: dark ? feature.darkBg + "80" : feature.bg,
                    border: `1px solid ${feature.color}30`,
                  }}
                >
                  <span className="text-base">{feature.icon}</span>
                  <span
                    className="text-[11px] font-bold uppercase tracking-wider"
                    style={{ color: feature.color }}
                  >
                    {feature.tag}
                  </span>
                </div>
                <h2 className="text-[clamp(24px,3vw,36px)] font-extrabold text-[var(--text)] mb-5 leading-tight">
                  {feature.title}
                </h2>
                <div className="space-y-3 mb-8">
                  {feature.points.map((point, pi) => (
                    <div key={pi} className="flex gap-3 items-start">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{
                          background: dark ? feature.darkBg : feature.bg,
                        }}
                      >
                        <Check size={12} style={{ color: feature.color }} />
                      </div>
                      <span className="text-[15px] text-[var(--muted)] leading-relaxed">
                        {point}
                      </span>
                    </div>
                  ))}
                </div>
                <Link href="/contact">
                  <Button
                    style={{ background: feature.color }}
                    className="text-white hover:opacity-90"
                  >
                    Learn More <ArrowRight size={16} />
                  </Button>
                </Link>
              </div>
              <div
                className="rounded-3xl p-10 text-center"
                style={{
                  background: dark ? feature.darkBg + "60" : feature.bg,
                  border: `1px solid ${feature.color}25`,
                  direction: "ltr",
                }}
              >
                <p className="text-6xl mb-4">{feature.icon}</p>
                <p
                  className="text-[clamp(48px,8vw,80px)] font-black leading-none mb-2"
                  style={{ color: feature.color }}
                >
                  {feature.stat}
                </p>
                <p className="text-sm text-[var(--muted)] max-w-[240px] mx-auto leading-relaxed">
                  {feature.statLabel}
                </p>
              </div>
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
            See all features in action
          </h2>
          <p className="text-white/70 mb-8">
            Book a free 30-minute demo with our team.
          </p>
          <Link href="/signup">
            <Button variant="gold" size="lg">
              Book a Free Demo <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
