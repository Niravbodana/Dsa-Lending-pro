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
import type { SiteConfig } from "@/lib/cms";
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

const STAT_ICONS = [IconRupee, IconUsers, IconBuilding, IconStar, IconShield];
const FEATURE_ICONS = [IconX, IconChart, IconFile, IconBolt];

export function HeroTrustBand({ config }: { config: SiteConfig }) {
  const tagline = config.trust_band?.tagline || "Trusted by 50,000+ customers";
  const features = config.trust_band?.features?.length
    ? config.trust_band.features
    : ["No Hidden Charges", "Flexible Tenure Options", "Minimal Documentation", "End-to-End Digital Journey"];
  const stats = config.stats?.length ? config.stats : [];

  return (
    <section className="glass-strip">
      <div className="mx-auto max-w-7xl px-4 pb-6 pt-4">
        <p className="text-center text-sm font-medium text-slate-500">{tagline}</p>

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

        {stats.length > 0 && (
          <div className="glass-panel mx-auto mt-8 max-w-6xl px-4 py-8 md:px-8">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-5">
              {stats.map((s, i) => {
                const Icon = STAT_ICONS[i % STAT_ICONS.length];
                return (
                  <div key={`${s.label}-${i}`} className="text-center">
                    <span
                      className="mx-auto flex h-12 w-12 items-center justify-center rounded-full"
                      style={{ backgroundColor: REF.tealLight, color: REF.teal }}
                    >
                      <Icon size={22} />
                    </span>
                    <p className="mt-2.5 text-lg font-extrabold md:text-xl" style={{ color: REF.navy }}>
                      {s.value}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">{s.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="glass-strip border-t-0">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-6 gap-y-2 px-4 py-4 text-xs font-semibold text-slate-600 md:gap-x-0 md:text-sm">
          {features.map((label, i) => {
            const Icon = FEATURE_ICONS[i % FEATURE_ICONS.length];
            return (
              <span key={label} className="flex items-center gap-2 md:px-8">
                {i > 0 && <span className="hidden h-4 w-px bg-slate-300 md:mr-8 md:inline" aria-hidden />}
                <Icon size={15} style={{ color: REF.teal }} />
                {label}
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
