"use client";

import type { SiteConfig } from "@/lib/cms";

export function UrgencyBar({ config }: { config: SiteConfig }) {
  if (!config.sections.urgency_bar || !config.urgency_bar.enabled) return null;
  const u = config.urgency_bar;
  return (
    <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 px-4 py-2.5 text-center text-sm font-bold text-white shadow-lg">
      <span className="mr-2">{u.emoji}</span>
      {u.text}
      <span className="ml-3 hidden animate-pulse rounded-full bg-white/25 px-2 py-0.5 text-xs sm:inline">
        LIVE
      </span>
    </div>
  );
}

export function PromoStrip({ config }: { config: SiteConfig }) {
  if (!config.sections.promo_strip || !config.promo_strip.enabled) return null;
  const p = config.promo_strip;
  const parts = p.text.split(p.highlight);
  return (
    <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-950">
      {parts.length > 1 ? (
        <>
          {parts[0]}
          <strong className="font-black text-amber-700">{p.highlight}</strong>
          {parts[1]}
        </>
      ) : (
        p.text
      )}
    </div>
  );
}

export function LiveSocialProof({ config }: { config: SiteConfig }) {
  if (!config.sections.social_proof || !config.social_proof.enabled) return null;
  const base = config.social_proof.viewers_base;
  const count = base + Math.floor((Date.now() / 60000) % 40);
  return (
    <div className="fixed bottom-24 left-4 z-40 hidden rounded-2xl border border-teal-200 bg-white/95 px-4 py-3 text-sm shadow-xl backdrop-blur md:block">
      <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
      <strong className="text-teal-700">{count}</strong>{" "}
      <span className="text-slate-600">{config.social_proof.label}</span>
    </div>
  );
}
