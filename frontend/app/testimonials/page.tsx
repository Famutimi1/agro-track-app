"use client";

import Link from "next/link";
import { Star, ArrowRight } from "lucide-react";
import { PublicNav } from "@/components/layout/public-nav";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";

const allTestimonials = [
  {
    name: "Dr. Emeka Okonkwo",
    role: "Director, CBN Anchor Borrowers Programme",
    org: "Central Bank of Nigeria",
    text: "AgroTrack gave us visibility we never had before. We could see exactly where our disbursements were going — down to the GPS coordinate of each farm. Default rates in our pilot dropped by 31% in the first 6 months.",
    stars: 5,
    tag: "Government",
  },
  {
    name: "Hajiya Aisha Musa",
    role: "Program Officer",
    org: "NIRSAL",
    text: "The layered disbursement feature alone has reduced fund diversion by over 60% in our pilot. It's now a non-negotiable requirement for all our grant programs. The field agent network is particularly impressive for reaching rural farmers.",
    stars: 5,
    tag: "Development Finance",
  },
  {
    name: "Tunde Adeyemi",
    role: "Head of Agri-Finance",
    org: "Union Bank of Nigeria",
    text: "FarmScore has transformed how we assess agricultural borrowers. We can now lend confidently to farmers who previously had no credit history. Our agri-loan book has grown 4× in one year with AgroTrack as our underwriting layer.",
    stars: 5,
    tag: "Commercial Bank",
  },
  {
    name: "Engr. Bola Olatunde",
    role: "Commissioner for Agriculture",
    org: "Ekiti State Government",
    text: "We launched a ₦500M farmer support fund through AgroTrack and had full visibility into every disbursement. The platform's local language support (Yoruba interface) meant even our elderly farmers could register without help.",
    stars: 5,
    tag: "State Government",
  },
  {
    name: "Dr. Ngozi Eze",
    role: "Country Director",
    org: "USAID Feed the Future Nigeria",
    text: "The impact reporting module alone saved us weeks of manual data collection. We generated a full donor report — hectares farmed, jobs created, yield — in 15 minutes. This is the gold standard for agricultural grant management.",
    stars: 5,
    tag: "International NGO",
  },
  {
    name: "Alhaji Musa Dankwabo",
    role: "President",
    org: "Kebbi State Rice Farmers Association",
    text: "Before AgroTrack, our members had to travel to the state capital to even find out if they qualified for a loan. Now they check on their USSD phone from the farm. 847 of our members got funded in the first planting season.",
    stars: 5,
    tag: "Cooperative",
  },
];

const caseStudies = [
  {
    title: "CBN Anchor Borrowers: From 63% to 91% Repayment",
    org: "Central Bank of Nigeria",
    metric: "28%",
    metricLabel: "improvement",
    desc: "By switching from lump-sum to layered disbursement and introducing FarmScore minimum thresholds, the CBN pilot achieved a 28 percentage-point jump in repayment rates within two planting seasons.",
    tag: "Government",
    color: "#1B5E20",
    bg: "#dcfce7",
    darkBg: "#0a2010",
  },
  {
    title: "NIRSAL Cassava Grant — Zero Diversion",
    org: "NIRSAL",
    metric: "₦312M",
    metricLabel: "tracked",
    desc: "312 million naira in cassava processing grants tracked through AgroTrack with full audit trail. Not a single diversion case reported. Every tranche tied to verified farm photos and agent confirmation.",
    tag: "Development Finance",
    color: "#2563eb",
    bg: "#dbeafe",
    darkBg: "#0d1a30",
  },
  {
    title: "Union Bank Agri-Loan Book 4× Growth",
    org: "Union Bank of Nigeria",
    metric: "4×",
    metricLabel: "portfolio growth",
    desc: "Union Bank integrated AgroTrack's FarmScore API into their credit decisioning. Approval rates increased from 22% to 67% for smallholder applicants while non-performing loans decreased from 18% to 6%.",
    tag: "Commercial Bank",
    color: "#7c3aed",
    bg: "#ede9fe",
    darkBg: "#1a0d30",
  },
];

export default function TestimonialsPage() {

  return (
    <div className="bg-white dark:bg-gray-900 text-[var(--text)] min-h-screen">
      <PublicNav />

      {/* Hero */}
      <section className="pt-[68px] pb-24 px-6 text-center bg-[linear-gradient(160deg,#042007_0%,#1B5E20_100%)] dark:bg-[linear-gradient(160deg,#0a1a0a_0%,#111827_100%)]">
        <div className="max-w-[800px] mx-auto pt-20">
          <h1 className="text-[clamp(32px,5vw,56px)] font-black text-white leading-[1.1] tracking-tight mb-5">
            Trusted by Nigeria&apos;s{" "}
            <span className="text-brand-gold">most respected lenders.</span>
          </h1>
          <p className="text-lg text-white/65 max-w-xl mx-auto leading-relaxed">
            From CBN to state governments, NGOs and commercial banks — here&apos;s
            what they say after deploying AgroTrack.
          </p>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="py-24 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-24">
            {allTestimonials.map((t, i) => (
              <div
                key={i}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-brand-green to-brand-gold" />
                <span className="inline-block text-[10px] font-bold text-brand-green uppercase tracking-wider bg-green-50 dark:bg-green-900/30 px-2.5 py-0.5 rounded-full mb-4">
                  {t.tag}
                </span>
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }, (_, j) => (
                    <Star key={j} size={14} fill="#F9A825" color="#F9A825" />
                  ))}
                </div>
                <p className="text-sm text-[var(--muted)] leading-relaxed mb-5 italic">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-green to-brand-green-light flex items-center justify-center text-brand-gold font-bold text-xs flex-shrink-0">
                    {t.name
                      .split(" ")
                      .map((x) => x[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[var(--text)]">
                      {t.name}
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      {t.role} · {t.org}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Case Studies */}
          <div className="mb-14">
            <span className="inline-block text-[11px] font-bold text-green-600 uppercase tracking-widest bg-green-50 dark:bg-green-900/30 px-3.5 py-1 rounded-full mb-3">
              Case Studies
            </span>
            <h2 className="text-[clamp(28px,4vw,42px)] font-black tracking-tight">
              Real results, real numbers
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {caseStudies.map((cs) => (
              <div
                key={cs.title}
                className="rounded-2xl p-7 bg-[var(--cs-bg)] dark:bg-[var(--cs-bg-dark)]"
                style={{
                  ["--cs-bg" as string]: cs.bg,
                  ["--cs-bg-dark" as string]: cs.darkBg + "50",
                  border: `1px solid ${cs.color}25`,
                }}
              >
                <span
                  className="inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-4 bg-[var(--tag-bg)] dark:bg-[var(--tag-bg-dark)]"
                  style={{
                    color: cs.color,
                    ["--tag-bg" as string]: cs.bg + "80",
                    ["--tag-bg-dark" as string]: cs.darkBg,
                  }}
                >
                  {cs.tag}
                </span>
                <div className="mb-3">
                  <span
                    className="text-5xl font-black"
                    style={{ color: cs.color }}
                  >
                    {cs.metric}
                  </span>
                  <span className="text-sm text-[var(--muted)] ml-2">
                    {cs.metricLabel}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[var(--text)] mb-3 leading-snug">
                  {cs.title}
                </h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed mb-4">
                  {cs.desc}
                </p>
                <p className="text-xs font-semibold text-[var(--muted)]">
                  — {cs.org}
                </p>
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
            Become a success story
          </h2>
          <p className="text-white/70 mb-8">
            Join the organizations already transforming agricultural finance in
            Nigeria.
          </p>
          <Link href="/signup">
            <Button variant="gold" size="lg">
              Start Your Free Pilot <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
