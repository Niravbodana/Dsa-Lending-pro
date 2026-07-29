"use client";

import Link from "next/link";
import { HeroPhotoCarousel } from "@/components/HeroPhotoCarousel";
import { IconBolt, IconCheckCircle, IconClock, IconShield } from "@/components/icons";
import { REFERENCE_HERO } from "@/lib/hero-images";
import type { SiteConfig } from "@/lib/cms";

const ICONS = {
  bolt: IconBolt,
  shield: IconShield,
  clock: IconClock,
};

type Props = { config: SiteConfig };

export function DynamicHero({ config }: Props) {
  const h = config.hero;
  const copy = REFERENCE_HERO;

  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-8 lg:grid-cols-2 lg:gap-10 lg:py-12">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#2DB2A2]/40 bg-[#E8F8F5] px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-[#004B4D]">
            <IconCheckCircle size={14} className="text-[#2DB2A2]" />
            {copy.badge}
          </div>

          <h1 className="mt-5 text-[2.5rem] font-bold leading-[1.08] tracking-tight md:text-5xl lg:text-[3.25rem]">
            <span className="text-[#004B4D]">{copy.headlineLine1}</span>{" "}
            <span className="text-[#2DB2A2]">{copy.headlineHighlight}</span>
          </h1>

          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-slate-600 md:text-base">
            {copy.description}
          </p>

          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {copy.features.map((feature) => {
              const Icon = ICONS[feature.icon];
              return (
                <div key={feature.bold} className="flex flex-col gap-2">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E8F8F5] text-[#2DB2A2]">
                    <Icon size={20} />
                  </span>
                  <p className="text-sm leading-snug text-slate-700">
                    <span className="font-bold text-[#004B4D]">{feature.bold}</span>
                    {feature.rest}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              href="/apply"
              className="inline-flex items-center gap-2 rounded-full bg-[#2DB2A2] px-8 py-3.5 text-base font-semibold text-white shadow-md shadow-[#2DB2A2]/25 transition hover:bg-[#259a8c]"
            >
              {copy.ctaPrimary}
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/#how-it-works"
              className="inline-flex items-center gap-2 rounded-full border-2 border-slate-300 bg-white px-7 py-3.5 text-base font-semibold text-[#004B4D] transition hover:border-[#2DB2A2]"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#004B4D] text-[9px]">
                ▶
              </span>
              {copy.ctaSecondary}
            </Link>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <HeroPhotoCarousel roiRate={h.roi_badge || copy.roiRate} roiLabel={copy.roiLabel} />
        </div>
      </div>
    </section>
  );
}
