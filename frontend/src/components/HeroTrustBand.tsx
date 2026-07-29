"use client";

import Link from "next/link";
import { LenderLogo } from "@/components/LenderLogo";
import {
  IconBolt,
  IconBuilding,
  IconChart,
  IconFile,
  IconRupee,
  IconShield,
  IconStar,
  IconUsers,
  IconX,
} from "@/components/icons";
import { REF } from "@/lib/reference-theme";

const PARTNERS = [
  { name: "HDFC Bank", logo: "HDFC" },
  { name: "ICICI Bank", logo: "ICICI" },
  { name: "Bajaj Finserv", logo: "BAJAJ" },
  { name: "Tata Capital", logo: "TATA" },
  { name: "Kotak Mahindra Bank", logo: "KOTAK" },
  { name: "Axis Bank", logo: "AXIS" },
  { name: "State Bank of India", logo: "SBI" },
];

const STATS = [
  { value: "₹100+ Cr", label: "Loans Disbursed", Icon: IconRupee },
  { value: "50,000+", label: "Happy Customers", Icon: IconUsers },
  { value: "25+", label: "RBI-Registered Partners", Icon: IconBuilding },
  { value: "4.8 ★", label: "Customer Rating", Icon: IconStar },
  { value: "100%", label: "Digital Process", Icon: IconShield },
];

const FEATURES = [
  { label: "No Hidden Charges", Icon: IconX },
  { label: "Flexible Tenure Options", Icon: IconChart },
  { label: "Minimal Documentation", Icon: IconFile },
  { label: "End-to-End Digital Journey", Icon: IconBolt },
];

/** Reference: partners → stats card → bottom feature strip */
export function HeroTrustBand() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-7xl px-4 pb-6 pt-4">
        <p className="text-center text-sm font-medium text-slate-500">Trusted by 50,000+ customers</p>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 md:gap-x-8">
          {PARTNERS.map((p) => (
            <div key={p.name} className="flex items-center gap-2 grayscale transition hover:grayscale-0">
              <LenderLogo name={p.name} logo={p.logo} size={34} />
              <span className="hidden text-[11px] font-bold uppercase tracking-wide text-slate-600 sm:inline">
                {p.name}
              </span>
            </div>
          ))}
          <Link href="/partners" className="text-sm font-semibold hover:underline" style={{ color: REF.teal }}>
            &amp; more
          </Link>
        </div>

        <div className="mx-auto mt-8 max-w-6xl rounded-2xl border border-slate-100 bg-white px-4 py-8 shadow-[0_18px_48px_-24px_rgba(11,18,32,0.15)] md:px-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-5">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <span
                  className="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
                  style={{ backgroundColor: REF.tealLight, color: REF.teal }}
                >
                  <s.Icon size={22} />
                </span>
                <p className="mt-2.5 text-lg font-extrabold md:text-xl" style={{ color: REF.navy }}>
                  {s.value}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 bg-slate-50">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 py-4 text-xs font-semibold text-slate-600 md:gap-x-0 md:text-sm">
          {FEATURES.map((f, i) => (
            <span key={f.label} className="flex items-center gap-2 md:px-8">
              {i > 0 && <span className="hidden h-4 w-px bg-slate-300 md:mr-8 md:inline" aria-hidden />}
              <f.Icon size={15} style={{ color: REF.teal }} />
              {f.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
