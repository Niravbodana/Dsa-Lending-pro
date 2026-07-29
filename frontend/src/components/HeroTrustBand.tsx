"use client";

import Link from "next/link";
import { LenderLogo } from "@/components/LenderLogo";
import {
  IconBuilding,
  IconCheckCircle,
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
  { name: "Kotak Mahindra Bank", logo: "KOTAK" },
  { name: "Axis Bank", logo: "AXIS" },
];

const STATS = [
  { value: "₹100+ Cr", label: "Loans Disbursed", Icon: IconRupee },
  { value: "50,000+", label: "Happy Customers", Icon: IconUsers },
  { value: "25+", label: "RBI-Registered Partners", Icon: IconBuilding },
  { value: "4.8 ★", label: "Customer Rating", Icon: IconStar },
  { value: "100%", label: "Digital Process", Icon: IconShield },
];

const FEATURES = [
  "No Hidden Charges",
  "Flexible Tenure Options",
  "Minimal Documentation",
  "End-to-End Digital Journey",
];

/** Reference trust strip — partners, stats, bottom features */
export function HeroTrustBand() {
  return (
    <section className="border-t border-slate-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <p className="text-center text-sm font-medium text-slate-500">Trusted by 50,000+ customers</p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 md:gap-x-10">
          {PARTNERS.map((p) => (
            <div key={p.name} className="flex items-center gap-2 opacity-90">
              <LenderLogo name={p.name} logo={p.logo} size={32} />
              <span className="text-xs font-bold uppercase tracking-wide text-slate-600">{p.name}</span>
            </div>
          ))}
          <Link href="/partners" className="text-sm font-semibold text-[#2DB2A2] hover:underline">
            &amp; more
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-6 border-t border-slate-100 pt-8 md:grid-cols-5">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <s.Icon size={24} className="mx-auto text-[#2DB2A2]" />
              <p className="mt-2 text-lg font-bold text-[#004B4D] md:text-xl">{s.value}</p>
              <p className="mt-0.5 text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-100 bg-slate-50/60">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 py-4 text-xs font-semibold text-slate-600 md:text-sm">
          {FEATURES.map((label) => (
            <span key={label} className="flex items-center gap-2">
              <IconCheckCircle size={16} className="text-[#2DB2A2]" />
              {label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
