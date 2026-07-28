"use client";

import type { SiteConfig } from "@/lib/cms";

/** Subtle trust line under header — no urgency, no emojis. */
export function PremiumTrustStrip() {
  return (
    <div className="border-b border-neercred-gold/15 bg-gradient-to-r from-[#0a1628] via-neercred-navy to-[#0d3d38] px-4 py-2.5 text-center text-[11px] font-medium tracking-[0.12em] text-slate-400 uppercase sm:text-xs">
      RBI-regulated partners · Transparent rates · Fully digital lending
    </div>
  );
}

/** @deprecated Urgency bar removed for premium positioning */
export function UrgencyBar({ config }: { config: SiteConfig }) {
  void config;
  return null;
}

/** @deprecated Replaced by PremiumTrustStrip */
export function PromoStrip({ config }: { config: SiteConfig }) {
  void config;
  return null;
}

/** @deprecated Live viewer counts removed for premium positioning */
export function LiveSocialProof({ config }: { config: SiteConfig }) {
  void config;
  return null;
}
