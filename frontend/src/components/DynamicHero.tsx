"use client";

import Link from "next/link";
import { HeroPhotoCarousel } from "@/components/HeroPhotoCarousel";
import { IconBolt, IconCheckCircle, IconClock, IconShield } from "@/components/icons";
import type { SiteConfig } from "@/lib/cms";

const HERO_FEATURES = [
  { text: "Instant Offers from Top Lenders", Icon: IconBolt },
  { text: "100% Secure & Digital Process", Icon: IconShield },
  { text: "Quick Approval in 5 Minutes*", Icon: IconClock },
];

type Props = { config: SiteConfig };

export function DynamicHero({ config }: Props) {
  const h = config.hero;

  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-10 lg:grid-cols-2 lg:gap-12 lg:py-14">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wide text-emerald-800">
            <IconCheckCircle size={14} className="text-emerald-600" />
            {h.badge}
          </div>

          <h1 className="mt-6 text-[2.35rem] font-extrabold leading-[1.1] tracking-tight text-slate-900 md:text-5xl lg:text-[3.4rem]">
            {h.headline_line1}{" "}
            <span className="text-[#00796B]">{h.headline_highlight}</span>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 md:text-lg">
            {h.description}
          </p>

          <ul className="mt-7 space-y-4">
            {(h.bullet_points.length ? h.bullet_points : HERO_FEATURES.map((f) => f.text)).map(
              (text, i) => {
                const Icon = HERO_FEATURES[i]?.Icon ?? IconCheckCircle;
                return (
                  <li
                    key={text}
                    className="flex items-center gap-3 text-sm font-semibold text-slate-800 md:text-[15px]"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50 text-[#00796B]">
                      <Icon size={18} />
                    </span>
                    {text}
                  </li>
                );
              },
            )}
          </ul>

          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              href="/apply"
              className="inline-flex items-center gap-2 rounded-full bg-[#00796B] px-8 py-3.5 text-base font-bold text-white shadow-md shadow-teal-900/10 transition hover:bg-[#00695C]"
            >
              {h.cta_primary}
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/#how-it-works"
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-7 py-3.5 text-base font-semibold text-slate-800 transition hover:border-[#00796B] hover:text-[#00796B]"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-current text-[9px]">
                ▶
              </span>
              {h.cta_secondary}
            </Link>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end">
          <HeroPhotoCarousel roiRate={h.roi_badge} roiLabel={h.roi_badge_label} />
        </div>
      </div>
    </section>
  );
}
