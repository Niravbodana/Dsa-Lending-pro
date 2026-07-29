"use client";

import Link from "next/link";
import { HeroPhotoCarousel } from "@/components/HeroPhotoCarousel";
import { IconBolt, IconCheckCircle, IconClock, IconShield } from "@/components/icons";
import { REFERENCE_HERO } from "@/lib/hero-images";
import { REF } from "@/lib/reference-theme";
import type { SiteConfig } from "@/lib/cms";

const ICONS = { bolt: IconBolt, shield: IconShield, clock: IconClock };

type Props = { config: SiteConfig };

export function DynamicHero({ config }: Props) {
  const h = config.hero;
  const copy = REFERENCE_HERO;

  return (
    <section className="overflow-hidden bg-white">
      <div className="mx-auto grid max-w-7xl items-center gap-6 px-4 py-10 lg:grid-cols-[1fr_1.05fr] lg:gap-8 lg:py-14">
        <div className="z-10">
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
              className="inline-flex items-center gap-2.5 rounded-full border-2 bg-white px-7 py-3.5 text-base font-semibold transition hover:border-[#0F766E]"
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

        <div className="relative flex justify-center lg:justify-end">
          <div
            className="pointer-events-none absolute -left-8 top-0 z-10 hidden h-full w-32 bg-gradient-to-r from-white to-transparent lg:block"
            aria-hidden
          />
          <HeroPhotoCarousel roiRate={h.roi_badge || copy.roiRate} roiLabel={copy.roiLabel} />
        </div>
      </div>
    </section>
  );
}
