"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useTheme } from "next-themes";
import { PublicNav } from "@/components/layout/public-nav";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";

const actors = [
  {
    icon: "🏛️",
    label: "Lenders",
    who: "Government agencies, banks, NGOs and agribusinesses",
    color: "#1B5E20",
    bg: "#dcfce7",
    darkBg: "#0a2010",
    actions: [
      "Create loan programs",
      "Review and approve applications",
      "Monitor portfolio in real-time",
      "Disburse funds in layers",
      "Generate compliance reports",
    ],
  },
  {
    icon: "👨‍🌾",
    label: "Borrowers",
    who: "Individual smallholder farmers and cooperatives",
    color: "#2563eb",
    bg: "#dbeafe",
    darkBg: "#0d1a30",
    actions: [
      "Register with BVN/NIN",
      "Discover eligible programs",
      "Apply in minutes",
      "Submit farm reports",
      "Track FarmScore and repay",
    ],
  },
  {
    icon: "🤝",
    label: "Field Agents",
    who: "Extension workers and community officers on the ground",
    color: "#7c3aed",
    bg: "#ede9fe",
    darkBg: "#1a0d30",
    actions: [
      "Register farmers on their behalf",
      "GPS-map farm boundaries",
      "Conduct verification visits",
      "Submit photo reports offline",
      "Earn per farmer verified",
    ],
  },
];

const timeline = [
  {
    num: "01",
    icon: "🏛️",
    who: "Lender",
    title: "Create a Loan Program",
    desc: "The lender logs into the dashboard, sets the total fund pool, eligibility criteria (crop type, location, gender, cooperative membership), loan amount range, interest rate, repayment period, and disbursement layer structure. The program is published and immediately visible to eligible farmers.",
  },
  {
    num: "02",
    icon: "📱",
    who: "Borrower",
    title: "Farmer Discovers & Applies",
    desc: "Farmers discover matching programs on the mobile app, via USSD, or through a field agent. The eligibility checker shows their match percentage. Applications take under 5 minutes — BVN/NIN auto-verified, farm GPS captured, photos uploaded.",
  },
  {
    num: "03",
    icon: "✅",
    who: "Field Agent",
    title: "On-Ground Verification",
    desc: "A field agent visits the farm, confirms the farmer's identity, GPS-maps the farm boundaries by walking the perimeter, and takes geotagged photos. Verification reports are submitted even offline and sync when internet is available.",
  },
  {
    num: "04",
    icon: "🔍",
    who: "Lender",
    title: "Application Review & Approval",
    desc: "The lender sees the full KYC profile, farm photos, GPS location, and agent verification report. FarmScore is calculated automatically. Low-risk borrowers can be auto-approved. Approval triggers the first disbursement layer immediately.",
  },
  {
    num: "05",
    icon: "💰",
    who: "Platform",
    title: "Layer 1 Disbursed",
    desc: "The first tranche (e.g. 30% of loan) is released directly to the farmer's bank account or mobile money. This covers land preparation costs. The farmer receives an SMS and WhatsApp confirmation immediately.",
  },
  {
    num: "06",
    icon: "📸",
    who: "Borrower",
    title: "Farmer Submits Activity Report",
    desc: "After using Layer 1 funds, the farmer submits a farm activity report with timestamped, geotagged photos of their farm. They select their crop growth stage, report any challenges, and optionally leave a voice note. This triggers Layer 2 review.",
  },
  {
    num: "07",
    icon: "💰",
    who: "Platform",
    title: "Layers 2 & 3 Released on Verified Activity",
    desc: "Each subsequent layer is released only after the previous one is verified. This creates a verified trail of fund usage. Diversion becomes nearly impossible — funds only flow when farm activity is proven.",
  },
  {
    num: "08",
    icon: "🔥",
    who: "Borrower",
    title: "Repayment & Score Building",
    desc: "Farmers repay via bank transfer, USSD, mobile money, or in-kind produce. Every on-time repayment builds their FarmScore and repayment streak. After full repayment, their portable credit history is locked in — usable for future loans from any lender.",
  },
];

export default function HowItWorksPage() {
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
          <h1 className="text-[clamp(32px,5vw,56px)] font-black text-white leading-[1.1] tracking-tight mb-5">
            From program launch to{" "}
            <span className="text-brand-gold">final repayment.</span>
          </h1>
          <p className="text-lg text-white/65 max-w-xl mx-auto leading-relaxed">
            AgroTrack connects lenders, farmers, and field agents in one
            transparent workflow — with accountability at every step.
          </p>
        </div>
      </section>

      {/* Actors */}
      <section className="py-24 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block text-[11px] font-bold text-green-600 uppercase tracking-widest bg-green-50 dark:bg-green-900/30 px-3.5 py-1 rounded-full mb-3">
              The Three Actors
            </span>
            <h2 className="text-[clamp(28px,4vw,42px)] font-black tracking-tight">
              Who uses AgroTrack?
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-24">
            {actors.map((actor) => (
              <div
                key={actor.label}
                className="rounded-2xl p-7"
                style={{
                  background: dark ? actor.darkBg + "50" : actor.bg,
                  border: `1px solid ${actor.color}25`,
                }}
              >
                <p className="text-5xl mb-4">{actor.icon}</p>
                <h3
                  className="text-xl font-extrabold mb-1"
                  style={{ color: actor.color }}
                >
                  {actor.label}
                </h3>
                <p className="text-sm text-[var(--muted)] mb-5 leading-relaxed">
                  {actor.who}
                </p>
                {actor.actions.map((action) => (
                  <div key={action} className="flex items-center gap-2 mb-2">
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: actor.color }}
                    />
                    <span className="text-sm text-[var(--muted)]">{action}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div className="text-center mb-14">
            <span className="inline-block text-[11px] font-bold text-green-600 uppercase tracking-widest bg-green-50 dark:bg-green-900/30 px-3.5 py-1 rounded-full mb-3">
              Step by Step
            </span>
            <h2 className="text-[clamp(28px,4vw,42px)] font-black tracking-tight mb-4">
              The full loan lifecycle
            </h2>
            <p className="text-[var(--muted)] max-w-lg mx-auto">
              Every loan on AgroTrack follows a structured, verified, and
              transparent journey from creation to final repayment.
            </p>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div
              className="absolute left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 opacity-25"
              style={{
                background:
                  "linear-gradient(to bottom, #1B5E20, #F9A825, #1B5E20)",
              }}
            />

            {timeline.map((step, i) => (
              <div
                key={step.num}
                className="grid grid-cols-[1fr_64px_1fr] gap-0 mb-10 items-center"
              >
                {i % 2 === 0 ? (
                  <>
                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 mr-6">
                      <div className="flex gap-2 items-center mb-3">
                        <span className="text-2xl">{step.icon}</span>
                        <span className="text-[10px] font-bold text-brand-green uppercase tracking-wider bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded">
                          {step.who}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-[var(--text)] mb-2">
                        {step.title}
                      </h3>
                      <p className="text-sm text-[var(--muted)] leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                    <div className="flex flex-col items-center z-10">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-brand-gold font-extrabold text-sm border-[3px] border-brand-gold"
                        style={{
                          background:
                            "linear-gradient(135deg,#1B5E20,#2E7D32)",
                          boxShadow: `0 0 0 4px ${dark ? "#111827" : "#fff"}`,
                        }}
                      >
                        {step.num}
                      </div>
                    </div>
                    <div />
                  </>
                ) : (
                  <>
                    <div />
                    <div className="flex flex-col items-center z-10">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-brand-gold font-extrabold text-sm border-[3px] border-brand-gold"
                        style={{
                          background:
                            "linear-gradient(135deg,#1B5E20,#2E7D32)",
                          boxShadow: `0 0 0 4px ${dark ? "#111827" : "#fff"}`,
                        }}
                      >
                        {step.num}
                      </div>
                    </div>
                    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 ml-6">
                      <div className="flex gap-2 items-center mb-3">
                        <span className="text-2xl">{step.icon}</span>
                        <span className="text-[10px] font-bold text-brand-green uppercase tracking-wider bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded">
                          {step.who}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-[var(--text)] mb-2">
                        {step.title}
                      </h3>
                      <p className="text-sm text-[var(--muted)] leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-20 px-6 text-center"
        style={{ background: "linear-gradient(135deg,#1B5E20,#2E7D32)" }}
      >
        <div className="max-w-[600px] mx-auto">
          <h2 className="text-3xl font-black text-white mb-4">
            Ready to see it live?
          </h2>
          <p className="text-white/70 mb-8">
            Watch a full walkthrough of the AgroTrack lifecycle with real
            Nigerian loan data.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/signup">
              <Button variant="gold" size="lg">
                Book a Demo <ArrowRight size={16} />
              </Button>
            </Link>
            <Link href="/register">
              <Button
                variant="secondary"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10"
              >
                Try Borrower Portal
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
