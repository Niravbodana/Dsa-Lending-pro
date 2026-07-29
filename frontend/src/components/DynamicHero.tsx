"use client";

import Image from "next/image";
import { HeroRoiCard } from "@/components/HeroPhotoCarousel";
import { IconBolt, IconCheckCircle, IconClock, IconShield } from "@/components/icons";
import { HERO_IMAGE, REFERENCE_HERO } from "@/lib/hero-images";
import { REF } from "@/lib/reference-theme";
import type { SiteConfig } from "@/lib/cms";
import { CmsField } from "@/components/cms/CmsField";
import { useVisualEditor } from "@/lib/visual-editor/VisualEditorContext";

const ICONS = { bolt: IconBolt, shield: IconShield, clock: IconClock };

type Props = {
  config: SiteConfig;
  heroOverlay?: string;
};

function heroSrc(url: string | undefined): string {
  if (url && url.trim()) return url;
  return HERO_IMAGE.src;
}

function isRemote(src: string): boolean {
  return src.startsWith("http://") || src.startsWith("https://");
}

export function DynamicHero({ config, heroOverlay }: Props) {
  const h = config.hero;
  const ctx = useVisualEditor();
  const src = heroSrc(h.image_url || config.theme?.hero_background);
  const remote = isRemote(src);

  const headline1 = h.headline_line1 || REFERENCE_HERO.headlineLine1;
  const headlineHi = h.headline_highlight || REFERENCE_HERO.headlineHighlight;
  const headlineSub = h.headline_sub;
  const description = h.description || REFERENCE_HERO.description;
  const badge = h.badge || REFERENCE_HERO.badge;
  const ctaPrimary = h.cta_primary || REFERENCE_HERO.ctaPrimary;
  const ctaSecondary = h.cta_secondary || REFERENCE_HERO.ctaSecondary;

  const features = h.bullet_points?.length
    ? h.bullet_points.slice(0, 3).map((text, i) => ({
        text,
        icon: (["bolt", "shield", "clock"] as const)[i] || ("bolt" as const),
      }))
    : REFERENCE_HERO.features;

  return (
    <section
      className="relative min-h-[540px] overflow-hidden lg:min-h-[600px]"
      onClick={() => ctx?.active && ctx.select("hero.image_url")}
    >
      {remote ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={HERO_IMAGE.alt} className="absolute inset-0 h-full w-full object-cover object-[70%_center] sm:object-[center_right]" />
      ) : (
        <Image
          src={src}
          alt={HERO_IMAGE.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-[70%_center] sm:object-[center_right]"
        />
      )}
      <div
        className="absolute inset-0"
        style={{
          background: heroOverlay || "var(--hero-overlay, linear-gradient(to right, rgba(224,242,254,0.95) 32%, rgba(255,255,255,0.85) 48%, rgba(255,255,255,0.15) 100%))",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-transparent lg:hidden" />

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 lg:grid-cols-[1fr_0.85fr] lg:gap-10 lg:py-16">
        <div>
          <div
            className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-bold uppercase tracking-wide"
            style={{ borderColor: `${REF.teal}55`, backgroundColor: REF.tealLight, color: REF.tealDark }}
          >
            <IconCheckCircle size={14} style={{ color: REF.teal }} />
            <CmsField path="hero.badge" draggable>
              {badge}
            </CmsField>
          </div>

          <h1 className="mt-6 text-[2.4rem] font-extrabold leading-[1.1] tracking-tight md:text-[2.85rem] lg:text-[3.35rem]">
            <CmsField path="hero.headline_line1" as="span" style={{ color: REF.navy }} draggable>
              {headline1}{" "}
            </CmsField>
            <CmsField path="hero.headline_highlight" as="span" style={{ color: REF.teal }} draggable>
              {headlineHi}
            </CmsField>
          </h1>

          {(headlineSub || ctx?.active) && (
            <CmsField
              path="hero.headline_sub"
              as="p"
              className="mt-3 text-lg font-bold md:text-xl"
              style={{ color: REF.navy }}
              draggable
            >
              {headlineSub}
            </CmsField>
          )}

          <CmsField
            path="hero.description"
            as="p"
            className="mt-5 max-w-lg text-[15px] leading-relaxed md:text-base"
            style={{ color: REF.textMuted }}
          >
            {description}
          </CmsField>

          <ul className="mt-7 space-y-3.5">
            {features.map((feature) => {
              const Icon = ICONS[feature.icon as keyof typeof ICONS] || IconBolt;
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
            <span
              className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-base font-bold text-white shadow-md"
              style={{ backgroundColor: REF.teal, boxShadow: `0 10px 24px -8px ${REF.teal}66` }}
            >
              <CmsField path="hero.cta_primary">{ctaPrimary}</CmsField>
              <span aria-hidden>→</span>
            </span>
            <span
              className="inline-flex items-center gap-2.5 rounded-full border-2 bg-white/90 px-7 py-3.5 text-base font-semibold backdrop-blur-sm"
              style={{ borderColor: "#CBD5E1", color: REF.navy }}
            >
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full border-2 text-[9px]"
                style={{ borderColor: REF.navy }}
              >
                ▶
              </span>
              <CmsField path="hero.cta_secondary">{ctaSecondary}</CmsField>
            </span>
          </div>
        </div>

        <div className="relative hidden min-h-[280px] lg:block">
          {h.approval_card_amount && (
            <div className="absolute left-4 top-8 glass-panel rounded-2xl px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                {h.approval_card_label || "Loan Disbursed"}
              </p>
              <p className="text-2xl font-black text-teal-700">
                <CmsField path="hero.approval_card_amount" draggable>
                  {h.approval_card_amount}
                </CmsField>
              </p>
            </div>
          )}
          {h.testimonial_quote && (
            <div className="absolute right-0 top-4 max-w-[240px] glass-panel rounded-2xl p-4 text-xs leading-relaxed text-slate-600">
              &ldquo;
              <CmsField path="hero.testimonial_quote" draggable>
                {h.testimonial_quote}
              </CmsField>
              &rdquo;
              {h.testimonial_author && (
                <p className="mt-2 font-semibold text-slate-800">— {h.testimonial_author}</p>
              )}
            </div>
          )}
          <div className="absolute bottom-8 right-0">
            <HeroRoiCard
              roiRate={h.roi_badge || REFERENCE_HERO.roiRate}
              roiLabel={h.roi_badge_label || REFERENCE_HERO.roiLabel}
              roiPath="hero.roi_badge"
            />
          </div>
        </div>
      </div>

      <div className="relative z-10 flex justify-end px-4 pb-8 lg:hidden">
        <HeroRoiCard
          roiRate={h.roi_badge || REFERENCE_HERO.roiRate}
          roiLabel={h.roi_badge_label || REFERENCE_HERO.roiLabel}
          roiPath="hero.roi_badge"
        />
      </div>
    </section>
  );
}
