"use client";

import { LenderLogo } from "@/components/LenderLogo";
import {
  IconBolt,
  IconChart,
  IconCheckCircle,
  IconLock,
  IconRupee,
  IconShield,
  IconStar,
  IconUsers,
} from "@/components/icons";

const PARTNERS = [
  { name: "HDFC Bank", logo: "HDFC" },
  { name: "ICICI Bank", logo: "ICICI" },
  { name: "Bajaj Finserv", logo: "BAJAJ" },
  { name: "Tata Capital", logo: "TATA" },
  { name: "Kotak Mahindra", logo: "KOTAK" },
  { name: "Axis Bank", logo: "AXIS" },
  { name: "State Bank of India", logo: "SBI" },
];

const STATS = [
  { value: "₹100+ Cr", label: "Loans Disbursed", Icon: IconRupee },
  { value: "50,000+", label: "Happy Customers", Icon: IconUsers },
  { value: "25+", label: "RBI-Registered Partners", Icon: IconShield },
  { value: "4.8 ★", label: "Customer Rating", Icon: IconStar },
  { value: "100%", label: "Digital Process", Icon: IconBolt },
];

const FEATURES = [
  { label: "No Hidden Charges", Icon: IconCheckCircle },
  { label: "Flexible Tenure Options", Icon: IconChart },
  { label: "Minimal Documentation", Icon: IconLock },
  { label: "End-to-End Digital Journey", Icon: IconBolt },
];

/** Partner logos + trust stats + bottom feature bar (reference homepage layout) */
export function HeroTrustBand() {
  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10 lg:justify-between">
          {PARTNERS.map((p) => (
            <div key={p.name} className="flex items-center gap-2 opacity-80 grayscale transition hover:opacity-100 hover:grayscale-0">
              <LenderLogo name={p.name} logo={p.logo} size={36} />
              <span className="hidden text-xs font-bold uppercase tracking-wide text-slate-600 sm:inline">
                {p.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-y border-slate-100 bg-slate-50/80">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 md:grid-cols-5">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <s.Icon size={22} className="mx-auto text-neercred-teal" />
              <p className="mt-2 text-xl font-black text-slate-900 md:text-2xl">{s.value}</p>
              <p className="mt-1 text-xs font-medium text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-4 py-4 text-xs font-semibold text-slate-600 md:text-sm">
        {FEATURES.map((f, i) => (
          <span key={f.label} className="flex items-center gap-2">
            {i > 0 && <span className="hidden h-4 w-px bg-slate-200 md:inline" aria-hidden />}
            <f.Icon size={16} className="text-neercred-teal" />
            {f.label}
          </span>
        ))}
      </div>
    </section>
  );
}
