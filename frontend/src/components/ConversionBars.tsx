"use client";

import type { SiteConfig } from "@/lib/cms";

export function UrgencyBar({ config }: { config: SiteConfig }) {
  const bar = config.urgency_bar;
  if (!config.sections?.urgency_bar || !bar?.enabled || !bar.text) return null;
  return (
    <div className="border-b border-amber-200/60 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2.5 text-center text-sm font-semibold text-amber-900">
      {bar.emoji && <span className="mr-2">{bar.emoji}</span>}
      {bar.text}
    </div>
  );
}

export function PromoStrip({ config }: { config: SiteConfig }) {
  const promo = config.promo_strip;
  if (!config.sections?.promo_strip || !promo?.enabled || !promo.text) return null;
  return (
    <div className="border-b border-teal-200/50 bg-gradient-to-r from-teal-600 to-cyan-600 px-4 py-2.5 text-center text-sm font-bold text-white">
      {promo.text}
      {promo.highlight && <span className="ml-2 rounded bg-white/20 px-2 py-0.5">{promo.highlight}</span>}
    </div>
  );
}

export function LiveSocialProof({ config }: { config: SiteConfig }) {
  const sp = config.social_proof;
  if (!config.sections?.social_proof || !sp?.enabled) return null;
  const count = sp.viewers_base || 127;
  const label = sp.label || "people viewing loan offers right now";
  return (
    <div className="border-b border-slate-200/60 bg-white/70 px-4 py-2 text-center text-xs font-medium text-slate-600 backdrop-blur">
      <span className="mr-1.5 inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
      <strong className="text-slate-900">{count}+</strong> {label}
    </div>
  );
}

/** Subtle trust line under header */
export function PremiumTrustStrip() {
  return (
    <div className="border-b border-neercred-gold/20 bg-gradient-to-r from-[#0a1628] via-neercred-navy to-[#0d3d38] px-4 py-2.5 text-center text-xs font-medium tracking-[0.14em] text-slate-200 sm:text-[13px]">
      RBI-regulated partners · Transparent rates · Fully digital lending
    </div>
  );
}
