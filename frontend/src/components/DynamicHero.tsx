"use client";

import Link from "next/link";
import { HeroRoiCard } from "@/components/HeroPhotoCarousel";
import { IconBolt, IconCheckCircle, IconClock, IconShield } from "@/components/icons";
import { HERO_IMAGE, REFERENCE_HERO } from "@/lib/hero-images";
import { REF } from "@/lib/reference-theme";
import type { SiteConfig } from "@/lib/cms";

const ICONS = { bolt: IconBolt, shield: IconShield, clock: IconClock };

type Props = { config: SiteConfig };

export function DynamicHero({ config }: Props) {
  const h = config.hero;
  const copy = REFERENCE_HERO;

  return (
    <section className="relative min-h-[540px] overflow-hidden lg:min-h-[600px]">
      <div
        className="absolute inset-0 bg-cover bg-[70%_center] bg-no-repeat sm:bg-[center_right]"
        style={{ backgroundImage: `url('${HERO_IMAGE.src}')` }}
        role="img"
        aria-label={HERO_IMAGE.alt}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-white from-[38%] via-white/92 via-[52%] to-white/25 lg:from-[42%] lg:via-white/80 lg:to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-white/20 lg:hidden" />

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 lg:grid-cols-[1fr_0.85fr] lg:gap-10 lg:py-16">
        <div>
          <div
            className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-bold uppercase tracking-wide"
            style={{ borderColor: `${REF.teal}55`, backgroundColor: REF.tealLight, color: REF.tealDark }}
          >
            <IconCheckCircle size={14} style={{ color: REF.teal }} />
            {copy.badge}
          </div>

          <h1 className="mt-6 text-[2.4rem] font-extrabold leading-[1.1] tracking-tight md:text-[2.85rem] lg:text-[3.35rem]">
            <span style={{ color: REF.navy }}>{copy.headlineLine1}</span>{" "}
            <span style={{ color: REF.teal }}>{copy.headlineHighlight}</span>
          </h1>

          <p className="mt-5 max-w-lg text-[15px] leading-relaxed md:text-base" style={{ color: REF.textMuted }}>
            {copy.description}
          </p>

          <ul className="mt-7 space-y-3.5">
            {copy.features.map((feature) => {
              const Icon = ICONS[feature.icon];
              return (
                <li key={feature.text} className="flex items-center gap-3 text-sm font-semibold md:text-[15px]">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: REF.tealLight, color: REF.teal }}
                  >
                    <Icon size={18} />
                  </span>
                  <span style={{ color: REF.navy }}>{feature.text}</span>
                </li>
              );
            })}
          </ul>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href="/apply"
              className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-base font-bold text-white shadow-md transition hover:brightness-110"
              style={{ backgroundColor: REF.teal, boxShadow: `0 10px 24px -8px ${REF.teal}66` }}
            >
              {copy.ctaPrimary}
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/#how-it-works"
              className="inline-flex items-center gap-2.5 rounded-full border-2 bg-white/90 px-7 py-3.5 text-base font-semibold backdrop-blur-sm transition hover:border-[#0F766E]"
              style={{ borderColor: "#CBD5E1", color: REF.navy }}
            >
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full border-2 text-[9px]"
                style={{ borderColor: REF.navy }}
              >
                ▶
              </span>
              {copy.ctaSecondary}
            </Link>
          </div>
        </div>

        <div className="relative hidden min-h-[280px] lg:block">
          <div className="absolute bottom-8 right-0">
            <HeroRoiCard roiRate={h.roi_badge || copy.roiRate} roiLabel={copy.roiLabel} />
          </div>
        </div>
      </div>

      <div className="relative z-10 flex justify-end px-4 pb-8 lg:hidden">
        <HeroRoiCard roiRate={h.roi_badge || copy.roiRate} roiLabel={copy.roiLabel} />
      </div>
    </section>
  );
}
