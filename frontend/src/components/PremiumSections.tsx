import Link from "next/link";
import { ScrollReveal } from "@/components/ScrollReveal";
import {
  IconCpu,
  IconShield,
  IconTarget,
  IconChart,
  IconBolt,
  IconCheck,
  IconArrowRight,
} from "@/components/icons";

const flowSteps = [
  { step: "01", title: "Customer Visits", desc: "Discovers Neer Loan Solutions" },
  { step: "02", title: "Basic Details", desc: "OTP-verified profile capture" },
  { step: "03", title: "Partner APIs", desc: "Parallel lender offer engine" },
  { step: "04", title: "Best Offers", desc: "AI-ranked comparison UI" },
  { step: "05", title: "Select & KYC", desc: "Digital verification & eSign" },
  { step: "06", title: "Disbursal", desc: "Direct to customer account" },
];

const capabilities = [
  {
    phase: "Phase 1",
    title: "Lead Capture",
    items: ["OTP login", "PAN validation", "Consent & disclosure", "Lead database"],
    icon: IconTarget,
  },
  {
    phase: "Phase 2",
    title: "Offer Engine",
    items: ["Partner API integration", "Parallel offer fetch", "Best-deal ranking", "Offer selection"],
    icon: IconChart,
  },
  {
    phase: "Phase 3",
    title: "KYC Flow",
    items: ["Aadhaar eKYC", "Bank penny drop", "Document upload", "Digital eSign"],
    icon: IconShield,
  },
  {
    phase: "Phase 4",
    title: "Processing",
    items: ["Status tracking", "Partner webhooks", "SMS notifications", "Disbursal alerts"],
    icon: IconBolt,
  },
  {
    phase: "Phase 5",
    title: "Dashboard",
    items: ["User portal", "EMI schedule", "Neer AI assistant", "Agreement download"],
    icon: IconCpu,
  },
  {
    phase: "Phase 6",
    title: "Admin & Scale",
    items: ["Lead funnel analytics", "Commission reports", "Fraud rules", "Role-based access"],
    icon: IconChart,
  },
];

const premiumFeatures = [
  { title: "AI Offer Recommendations", desc: "Neer AI ranks offers by your profile and repayment capacity." },
  { title: "Pre-Approved Offers", desc: "Soft-pull eligibility signals for faster decisions." },
  { title: "Instant Approval Score", desc: "Real-time probability engine before you apply." },
  { title: "Smart Lead Scoring", desc: "ML-powered lead quality for partner lenders." },
  { title: "Fraud Detection", desc: "Multi-layer verification and anomaly monitoring." },
  { title: "WhatsApp Tracking", desc: "Status updates and support on WhatsApp." },
];

export function BusinessModelFlow() {
  return (
    <section className="border-y border-slate-200 bg-white py-20">
      <div className="mx-auto max-w-7xl px-4">
        <ScrollReveal variant="up" className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600">Business Model</p>
          <h2 className="mt-3 text-3xl font-black text-slate-900 md:text-4xl">
            Personal Loan Marketplace
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-500">
            Connect customers with multiple lenders. Earn commission on every disbursal.
          </p>
        </ScrollReveal>
        <div className="mt-14 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          {flowSteps.map((s, i) => (
            <ScrollReveal key={s.step} variant="up" delay={i * 60}>
              <div className="relative rounded-2xl border border-slate-100 bg-slate-50 p-5 transition hover:border-teal-200 hover:shadow-lg">
                <span className="text-xs font-bold text-teal-600">{s.step}</span>
                <h3 className="mt-2 font-bold text-slate-900">{s.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">{s.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PlatformCapabilities() {
  return (
    <section className="bg-slate-950 py-24 text-white">
      <div className="mx-auto max-w-7xl px-4">
        <ScrollReveal variant="up" className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">Platform</p>
            <h2 className="mt-3 text-3xl font-black md:text-4xl">Enterprise-Grade Architecture</h2>
            <p className="mt-3 max-w-xl text-slate-400">
              Six-phase product roadmap — from lead capture to admin analytics. Built for scale.
            </p>
          </div>
          <Link
            href="/platform"
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold transition hover:bg-white/10"
          >
            View Platform Details <IconArrowRight size={16} />
          </Link>
        </ScrollReveal>
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {capabilities.map((c, i) => (
            <ScrollReveal key={c.phase} variant="up" delay={i * 80}>
              <div className="h-full rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/20 text-teal-300">
                    <c.icon size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-amber-400">{c.phase}</p>
                    <h3 className="font-bold">{c.title}</h3>
                  </div>
                </div>
                <ul className="mt-4 space-y-2">
                  {c.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-slate-400">
                      <IconCheck size={14} className="shrink-0 text-teal-400" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PremiumFeaturesGrid() {
  return (
    <section className="bg-gradient-to-b from-white to-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-4">
        <ScrollReveal variant="up" className="text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600">Differentiators</p>
          <h2 className="mt-3 text-3xl font-black text-slate-900 md:text-4xl">
            Built Beyond Standard Marketplaces
          </h2>
        </ScrollReveal>
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {premiumFeatures.map((f, i) => (
            <ScrollReveal key={f.title} variant="up" delay={i * 70}>
              <div className="h-full rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                <div className="h-1 w-12 rounded-full bg-gradient-to-r from-teal-500 to-amber-400" />
                <h3 className="mt-5 text-lg font-bold text-slate-900">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{f.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function MetricsTicker() {
  const metrics = [
    { label: "Partner Lenders", value: "15+" },
    { label: "Loans Facilitated", value: "₹250Cr+" },
    { label: "Avg. Approval Time", value: "5 min" },
    { label: "Customer Rating", value: "4.8/5" },
    { label: "Digital KYC", value: "100%" },
  ];

  return (
    <section className="border-b border-slate-200 bg-slate-900 py-6">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-12 gap-y-4 px-4">
        {metrics.map((m) => (
          <div key={m.label} className="text-center">
            <p className="text-xl font-black text-white">{m.value}</p>
            <p className="text-xs uppercase tracking-wider text-slate-400">{m.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
