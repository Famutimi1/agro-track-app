"use client";

import Link from "next/link";
import { Leaf, Check, ArrowRight, Star } from "lucide-react";
import { PublicNav } from "@/components/layout/public-nav";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { stats, features, steps, testimonials, pricing, markets } from "@/lib/data/landing-data";

export default function LandingPage() {
  return (
    <div className="bg-white dark:bg-gray-900 text-[var(--text)] transition-colors duration-300">
      <PublicNav />

      {/* Hero */}
      <section className="min-h-screen flex items-center relative overflow-hidden pt-[68px] bg-[linear-gradient(160deg,#042007_0%,#0a3010_50%,#1B5E20_100%)] dark:bg-[linear-gradient(160deg,#0a1a0a_0%,#0f1923_40%,#111827_100%)]">
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="max-w-[1200px] mx-auto w-full px-6 py-20 relative grid grid-cols-1 lg:grid-cols-[1fr_480px] gap-14 items-center">
          <div>
            <div className="inline-block text-[11px] font-bold text-green-500 uppercase tracking-widest bg-green-900/30 px-3.5 py-1 rounded-full mb-4">
              Trusted by CBN, NIRSAL & 200+ lenders
            </div>
            <h1 className="text-[clamp(36px,5vw,56px)] font-black text-white leading-[1.08] tracking-tight mb-5">
              Agricultural Loans,<br />
              <span className="text-brand-gold">Finally Trackable.</span>
            </h1>
            <p className="text-base text-white/70 leading-relaxed mb-8 max-w-lg">
              AgroTrack gives lenders full visibility into every naira disbursed — from bank to farm to harvest. GPS-verified borrowers, layered disbursements, and Nigeria&apos;s first agricultural credit score.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link href="/signup">
                <Button variant="gold" size="lg">
                  Start Free Trial <ArrowRight size={16} />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="secondary" size="lg" className="border-white/20 text-white hover:bg-white/10">
                  Lender Login →
                </Button>
              </Link>
            </div>
            <div className="flex gap-6 mt-10">
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-xl font-extrabold text-white">{s.value}</p>
                  <p className="text-[11px] text-white/50">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden lg:block relative">
            <div className="w-full aspect-square rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-brand-green to-brand-green-light rounded-2xl flex items-center justify-center mb-4">
                  <Leaf size={36} className="text-brand-gold" />
                </div>
                <p className="text-white/50 text-sm">Dashboard Preview</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block text-[11px] font-bold text-green-600 uppercase tracking-widest bg-green-50 dark:bg-green-900/30 px-3.5 py-1 rounded-full mb-3">
              Platform Features
            </span>
            <h2 className="text-[clamp(28px,4vw,42px)] font-black tracking-tight mb-4">
              Everything You Need to Manage Agricultural Lending
            </h2>
            <p className="text-[var(--muted)] text-base max-w-2xl mx-auto">
              From disbursement to repayment, AgroTrack covers the full lifecycle of agricultural lending with tools built specifically for Nigerian agriculture.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl p-6 border border-[var(--border)] transition-transform hover:-translate-y-1 bg-[var(--card-bg)] dark:bg-[var(--card-bg-dark)]"
                style={{ ["--card-bg" as string]: f.bg, ["--card-bg-dark" as string]: f.darkBg }}
              >
                <span className="text-3xl mb-4 block">{f.icon}</span>
                <h3 className="text-base font-bold mb-2" style={{ color: f.color }}>
                  {f.title}
                </h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-[var(--surface)]">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block text-[11px] font-bold text-green-600 uppercase tracking-widest bg-green-50 dark:bg-green-900/30 px-3.5 py-1 rounded-full mb-3">
              How It Works
            </span>
            <h2 className="text-[clamp(28px,4vw,42px)] font-black tracking-tight">
              From Program Creation to Repayment — In 5 Steps
            </h2>
          </div>
          <div className="space-y-6">
            {steps.map((s) => (
              <div
                key={s.num}
                className="flex items-start gap-5 bg-[var(--background)] border border-[var(--border)] rounded-2xl p-6"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-green flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                  {s.num}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-brand-green uppercase tracking-wider bg-green-50 dark:bg-green-900/30 px-2 py-0.5 rounded">
                      {s.who}
                    </span>
                    <span className="text-lg">{s.icon}</span>
                  </div>
                  <h3 className="text-base font-bold text-[var(--text)] mb-1">{s.title}</h3>
                  <p className="text-sm text-[var(--muted)] leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block text-[11px] font-bold text-green-600 uppercase tracking-widest bg-green-50 dark:bg-green-900/30 px-3.5 py-1 rounded-full mb-3">
              Testimonials
            </span>
            <h2 className="text-[clamp(28px,4vw,42px)] font-black tracking-tight">
              Trusted by Nigeria&apos;s Top Agricultural Lenders
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6"
              >
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }, (_, i) => (
                    <Star key={i} size={14} fill="#F9A825" color="#F9A825" />
                  ))}
                </div>
                <p className="text-sm text-[var(--muted)] leading-relaxed mb-5 italic">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div>
                  <p className="text-sm font-bold text-[var(--text)]">{t.name}</p>
                  <p className="text-xs text-[var(--muted)]">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-6 bg-[var(--surface)]">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-14">
            <span className="inline-block text-[11px] font-bold text-green-600 uppercase tracking-widest bg-green-50 dark:bg-green-900/30 px-3.5 py-1 rounded-full mb-3">
              Pricing
            </span>
            <h2 className="text-[clamp(28px,4vw,42px)] font-black tracking-tight mb-4">
              Plans That Scale With You
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {pricing.map((p) => (
              <div
                key={p.plan}
                className={`relative rounded-2xl p-6 border ${p.hot ? "border-brand-green shadow-lg shadow-green-600/10 scale-[1.02]" : "border-[var(--border)]"} bg-[var(--background)]`}
              >
                {p.hot && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-green text-white text-[10px] font-bold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                )}
                <h3 className="text-lg font-bold text-[var(--text)] mb-1">{p.plan}</h3>
                <p className="text-xs text-[var(--muted)] mb-4">{p.desc}</p>
                <div className="flex items-baseline gap-1 mb-5">
                  <span className="text-3xl font-black text-[var(--text)]">{p.price}</span>
                  <span className="text-sm text-[var(--muted)]">{p.period}</span>
                </div>
                <ul className="space-y-2 mb-6">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-[var(--muted)]">
                      <Check size={14} className="text-green-600 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={p.hot ? "primary" : "secondary"}
                  className="w-full"
                >
                  {p.plan === "Enterprise" ? "Contact Sales" : "Start Free Trial"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Markets */}
      <section className="py-24 px-6">
        <div className="max-w-[1200px] mx-auto text-center">
          <span className="inline-block text-[11px] font-bold text-green-600 uppercase tracking-widest bg-green-50 dark:bg-green-900/30 px-3.5 py-1 rounded-full mb-3">
            Expansion Roadmap
          </span>
          <h2 className="text-[clamp(28px,4vw,42px)] font-black tracking-tight mb-10">
            Growing Across Africa & Beyond
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {markets.map((m) => (
              <div
                key={m.country}
                className="flex items-center gap-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl px-5 py-3"
              >
                <span className="text-2xl">{m.flag}</span>
                <div className="text-left">
                  <p className="text-sm font-bold text-[var(--text)]">{m.country}</p>
                  <p className="text-[11px] font-semibold" style={{ color: m.color }}>
                    {m.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6" style={{ background: "linear-gradient(135deg,#1B5E20,#2E7D32)" }}>
        <div className="max-w-[700px] mx-auto text-center">
          <h2 className="text-[clamp(28px,4vw,38px)] font-black text-white tracking-tight mb-4">
            Ready to Transform Agricultural Lending?
          </h2>
          <p className="text-white/70 text-base mb-8">
            Join 200+ lenders already using AgroTrack to disburse, track, and recover agricultural loans with full visibility.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/signup">
              <Button variant="gold" size="lg">
                Start Free Trial <ArrowRight size={16} />
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="secondary" size="lg" className="border-white/20 text-white hover:bg-white/10">
                Book a Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
