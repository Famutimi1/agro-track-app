"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { PublicNav } from "@/components/layout/public-nav";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";

const organizationTypes = [
  "Federal Government Agency",
  "State Government Ministry",
  "Commercial Bank",
  "Microfinance Bank",
  "NGO / Development Organisation",
  "International Donor",
  "Agribusiness / Cooperative",
  "Other",
];

const interests = [
  "Lender Dashboard & Portfolio Management",
  "Layered Disbursement System",
  "FarmScore Credit Engine",
  "Field Agent Network",
  "USSD / WhatsApp Integration",
  "White-label Enterprise Plan",
  "API Integration",
  "General Enquiry",
];

const steps = [
  {
    num: "01",
    title: "We review your enquiry",
    desc: "Our team reads your message and prepares a demo tailored to your program type and scale.",
  },
  {
    num: "02",
    title: "30-minute video call",
    desc: "We walk you through the platform live, using example data from programs similar to yours.",
  },
  {
    num: "03",
    title: "Free 30-day pilot",
    desc: "You get full access to the platform with up to 100 test borrowers — no credit card, no commitment.",
  },
  {
    num: "04",
    title: "Go live",
    desc: "We help you onboard your first loan program and train your team. Average go-live time: 48 hours.",
  },
];

const contactInfo = [
  { label: "Phone", value: "+234 909 000 0000" },
  { label: "WhatsApp", value: "+234 909 000 0001" },
  { label: "Email", value: "hello@agrotrack.ng" },
  { label: "Office", value: "Plot 234, Garki Area 11, Abuja, FCT" },
];

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    org: "",
    email: "",
    phone: "",
    type: "",
    interest: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (form.name && form.email) {
      setSubmitted(true);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 text-[var(--text)] min-h-screen">
      <PublicNav />

      {/* Hero */}
      <section className="pt-[68px] pb-24 px-6 text-center bg-[linear-gradient(160deg,#042007_0%,#1B5E20_100%)] dark:bg-[linear-gradient(160deg,#0a1a0a_0%,#111827_100%)]">
        <div className="max-w-[800px] mx-auto pt-20">
          <h1 className="text-[clamp(32px,5vw,56px)] font-black text-white leading-[1.1] tracking-tight mb-5">
            Let&apos;s talk about{" "}
            <span className="text-brand-gold">your programs.</span>
          </h1>
          <p className="text-lg text-white/65 max-w-xl mx-auto leading-relaxed">
            Whether you&apos;re a state ministry, development bank, or NGO —
            we&apos;ll walk you through a free pilot tailored to your programs.
          </p>
        </div>
      </section>

      {/* Contact Form */}
      <section className="px-6 -mt-12 pb-24">
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12 items-start">
          {/* Form */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-3xl p-10 shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-none">
            {submitted ? (
              <div className="text-center py-10">
                <div className="w-[72px] h-[72px] rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-5">
                  <CheckCircle size={36} className="text-green-600" />
                </div>
                <h2 className="text-xl font-extrabold text-[var(--text)] mb-2">
                  Message Received!
                </h2>
                <p className="text-sm text-[var(--muted)] leading-relaxed mb-6">
                  Our team will reach out within 24 hours to schedule your free
                  demo. Check your email at{" "}
                  <strong className="text-[var(--text)]">{form.email}</strong>
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-sm text-[var(--muted)] underline hover:text-[var(--text)]"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-extrabold text-[var(--text)] mb-1">
                  Book a Free Demo
                </h2>
                <p className="text-sm text-[var(--muted)] mb-7">
                  Fill in below and we&apos;ll set up a 30-minute walkthrough
                  within 24 hours.
                </p>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value })
                        }
                        placeholder="e.g. Dr. Emeka Okonkwo"
                        className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--muted)] outline-none focus:border-brand-green transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                        Organisation *
                      </label>
                      <input
                        type="text"
                        value={form.org}
                        onChange={(e) =>
                          setForm({ ...form, org: e.target.value })
                        }
                        placeholder="e.g. Federal Ministry of Agriculture"
                        className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--muted)] outline-none focus:border-brand-green transition-colors"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                        Work Email *
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                        placeholder="e.g. name@ministry.gov.ng"
                        className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--muted)] outline-none focus:border-brand-green transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) =>
                          setForm({ ...form, phone: e.target.value })
                        }
                        placeholder="e.g. +234 803 000 0000"
                        className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--muted)] outline-none focus:border-brand-green transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                      Organisation Type *
                    </label>
                    <select
                      value={form.type}
                      onChange={(e) =>
                        setForm({ ...form, type: e.target.value })
                      }
                      className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text)] outline-none focus:border-brand-green transition-colors"
                    >
                      <option value="">Select your type...</option>
                      {organizationTypes.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                      Primary Interest
                    </label>
                    <select
                      value={form.interest}
                      onChange={(e) =>
                        setForm({ ...form, interest: e.target.value })
                      }
                      className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text)] outline-none focus:border-brand-green transition-colors"
                    >
                      <option value="">What brings you here?</option>
                      {interests.map((i) => (
                        <option key={i} value={i}>
                          {i}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--muted)] uppercase tracking-wider mb-1.5">
                      Message
                    </label>
                    <textarea
                      value={form.message}
                      onChange={(e) =>
                        setForm({ ...form, message: e.target.value })
                      }
                      placeholder="Tell us about your program — fund size, number of farmers, states, timeline..."
                      rows={4}
                      className="w-full bg-[var(--input-bg)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--muted)] outline-none focus:border-brand-green transition-colors resize-none"
                    />
                  </div>
                  <Button
                    onClick={handleSubmit}
                    className="w-full py-4"
                    style={{
                      background: "linear-gradient(135deg,#1B5E20,#2E7D32)",
                      boxShadow: "0 6px 20px rgba(27,94,32,0.35)",
                    }}
                  >
                    Book My Free Demo
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Right Info */}
          <div className="pt-10">
            <h3 className="text-lg font-extrabold text-[var(--text)] mb-1">
              What happens next?
            </h3>
            <p className="text-sm text-[var(--muted)] mb-7 leading-relaxed">
              We respond to all enquiries within 24 business hours.
            </p>
            {steps.map((step) => (
              <div key={step.num} className="flex gap-4 mb-6">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-brand-gold font-extrabold text-xs flex-shrink-0 border-2 border-brand-gold"
                  style={{
                    background: "linear-gradient(135deg,#1B5E20,#2E7D32)",
                  }}
                >
                  {step.num}
                </div>
                <div>
                  <p className="text-sm font-bold text-[var(--text)] mb-0.5">
                    {step.title}
                  </p>
                  <p className="text-sm text-[var(--muted)] leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-5 mt-8">
              <p className="text-sm font-bold text-green-700 dark:text-green-400 mb-3">
                Prefer to call?
              </p>
              {contactInfo.map((info) => (
                <div key={info.label} className="flex gap-3 mb-2">
                  <span className="text-xs text-[var(--muted)] w-16 flex-shrink-0">
                    {info.label}
                  </span>
                  <span className="text-xs font-semibold text-[var(--text)]">
                    {info.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
