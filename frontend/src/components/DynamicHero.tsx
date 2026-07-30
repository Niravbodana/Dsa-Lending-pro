"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { HeroRoiCard } from "@/components/HeroPhotoCarousel";
import { IconBolt, IconCheckCircle, IconClock, IconShield } from "@/components/icons";
import { HERO_IMAGE, HERO_WEDDING_SRC, REFERENCE_HERO } from "@/lib/hero-images";
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
  if (url && url.trim() && !url.includes("hero-wedding-couple.png")) return url;
  return HERO_WEDDING_SRC;
}

function isRemote(src: string): boolean {
  return src.startsWith("http://") || src.startsWith("https://");
}

export function DynamicHero({ config, heroOverlay }: Props) {
  const h = config.hero;
  const ctx = useVisualEditor();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.04, 1.12]);

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
      ref={sectionRef}
      className="relative min-h-[540px] overflow-hidden lg:min-h-[600px]"
      onClick={() => ctx?.active && ctx.select("hero.image_url")}
    >
      <motion.div className="absolute inset-0 will-change-transform" style={{ y: imageY, scale: imageScale }}>
        {remote ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt={HERO_IMAGE.alt}
            className="hero-ken-burns h-full w-full object-cover object-[72%_28%] sm:object-[center_30%]"
          />
        ) : (
          <Image
            src={src}
            alt={HERO_IMAGE.alt}
            fill
            priority
            quality={95}
            sizes="100vw"
            className="hero-ken-burns object-cover object-[72%_28%] sm:object-[center_30%]"
          />
        )}
      </motion.div>
      <div className="hero-shimmer pointer-events-none absolute inset-0" />
      <div
        className="absolute inset-0"
        style={{
          background:
            heroOverlay ||
            "var(--hero-overlay, linear-gradient(to right, rgba(224,242,254,0.93) 28%, rgba(255,255,255,0.78) 44%, rgba(255,255,255,0.12) 100%))",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-transparent lg:hidden" />

      <motion.div
        className="relative z-10 mx-auto grid max-w-7xl items-center gap-8 px-4 py-10 lg:grid-cols-[1fr_0.85fr] lg:gap-10 lg:py-16"
        style={{ y: contentY }}
      >
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
            <Link
              href="/apply"
              className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-base font-bold text-white shadow-md transition hover:brightness-110"
              style={{ backgroundColor: REF.teal, boxShadow: `0 10px 24px -8px ${REF.teal}66` }}
            >
              <CmsField path="hero.cta_primary">{ctaPrimary}</CmsField>
              <span aria-hidden>→</span>
            </Link>
            <Link
              href="/#how-it-works"
              className="inline-flex items-center gap-2.5 rounded-full border-2 bg-white/90 px-7 py-3.5 text-base font-semibold backdrop-blur-sm transition hover:border-teal-300"
              style={{ borderColor: "#CBD5E1", color: REF.navy }}
            >
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full border-2 text-[9px]"
                style={{ borderColor: REF.navy }}
              >
                ▶
              </span>
              <CmsField path="hero.cta_secondary">{ctaSecondary}</CmsField>
            </Link>
          </div>
        </div>

        <div className="relative hidden min-h-[280px] lg:block">
          <div className="absolute bottom-6 right-2">
            <HeroRoiCard
              roiRate={h.roi_badge || REFERENCE_HERO.roiRate}
              roiLabel={h.roi_badge_label || REFERENCE_HERO.roiLabel}
              roiPath="hero.roi_badge"
            />
          </div>
        </div>
      </motion.div>

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
