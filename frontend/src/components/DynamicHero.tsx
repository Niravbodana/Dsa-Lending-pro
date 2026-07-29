"use client";

import Link from "next/link";
import { ScrollReveal } from "@/components/ScrollReveal";
import { HeroPhotoCarousel } from "@/components/HeroPhotoCarousel";
import { HeroReviewScroller } from "@/components/HeroReviewScroller";
import { IconBolt, IconCheckCircle, IconShield } from "@/components/icons";
import type { SiteConfig } from "@/lib/cms";

const HERO_FEATURES = [
  { text: "Instant Offers from Top Lenders", Icon: IconBolt },
  { text: "100% Secure & Digital Process", Icon: IconShield },
  { text: "Quick Approval in 5 Minutes*", Icon: IconCheckCircle },
];

type Props = { config: SiteConfig };

export function DynamicHero({ config }: Props) {
  const h = config.hero;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50/50 to-white">
      <div className="pointer-events-none absolute -right-24 top-0 h-96 w-96 rounded-full bg-teal-100/40 blur-3xl" />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-cyan-100/30 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 lg:grid-cols-2 lg:gap-14 lg:py-16">
        <ScrollReveal variant="left">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-neercred-teal">
            <IconCheckCircle size={14} className="text-green-600" />
            {h.badge}
          </div>

          <h1 className="mt-6 text-4xl font-black leading-[1.08] tracking-tight text-slate-900 md:text-5xl lg:text-[3.25rem]">
            {h.headline_line1}{" "}
            <span className="text-neercred-teal">{h.headline_highlight}</span>
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
            {h.description}
          </p>

          <ul className="mt-6 space-y-3">
            {(h.bullet_points.length ? h.bullet_points : HERO_FEATURES.map((f) => f.text)).map((text, i) => {
              const Icon = HERO_FEATURES[i]?.Icon ?? IconCheckCircle;
              return (
              <li key={text} className="flex items-center gap-3 text-sm font-semibold text-slate-700 md:text-base">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-50 text-neercred-teal">
                  <Icon size={18} />
                </span>
                {text}
              </li>
            );
            })}
          </ul>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/apply"
              className="inline-flex items-center gap-2 rounded-full bg-neercred-teal px-8 py-3.5 text-base font-bold text-white shadow-lg shadow-teal-900/15 transition hover:bg-teal-700"
            >
              {h.cta_primary}
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/#how-it-works"
              className="inline-flex items-center gap-2 rounded-full border-2 border-slate-300 bg-white px-8 py-3.5 text-base font-semibold text-slate-800 transition hover:border-neercred-teal hover:text-neercred-teal"
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-current text-[10px]">
                ▶
              </span>
              {h.cta_secondary}
            </Link>
          </div>

          <div className="hidden lg:block">
            <HeroReviewScroller variant="light" />
          </div>
        </ScrollReveal>

        <ScrollReveal variant="right" delay={120} className="flex justify-center lg:justify-end">
          <HeroPhotoCarousel roiRate={h.roi_badge} roiLabel={h.roi_badge_label} />
        </ScrollReveal>
      </div>

      {/* Mobile reviews — below photo */}
      <div className="mx-auto max-w-7xl px-4 pb-8 lg:hidden">
        <HeroReviewScroller variant="light" />
      </div>
    </section>
  );
}
