"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { DynamicHero } from "@/components/DynamicHero";
import { HeroTrustBand } from "@/components/HeroTrustBand";
import { UrgencyBar, PromoStrip, LiveSocialProof } from "@/components/ConversionBars";
import {
  DreamSection,
  EmotionalCtaBand,
  MobileStickyCTA,
} from "@/components/ConversionSections";
import {
  HowItWorks,
  LoanProductsStrip,
  LifestyleShowcase,
  TrustGallery,
  AppDownloadBanner,
  ReferBanner,
} from "@/components/LandingSections";
import {
  BusinessModelFlow,
  MetricsTicker,
  PlatformCapabilities,
  PremiumFeaturesGrid,
} from "@/components/PremiumSections";
import { Footer } from "@/components/Footer";
import { EmiCalculator } from "@/components/EmiCalculator";
import { Testimonials } from "@/components/Testimonials";
import { FAQ } from "@/components/FAQ";
import { BugReportWidget } from "@/components/BugReportWidget";
import { FloatingCTA } from "@/components/FloatingCTA";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { AIChatWidget } from "@/components/AIChatWidget";
import { FALLBACK_CONFIG, fetchSiteConfig, type SiteConfig } from "@/lib/cms";
import { SiteConfigProvider } from "@/lib/visual-editor/SiteConfigContext";
import { themeStyleVars } from "@/lib/site-theme";

type Props = {
  previewConfig?: SiteConfig;
  isPreview?: boolean;
  visualEdit?: boolean;
};

function LiveCustomBlocks({ blocks }: { blocks: SiteConfig["custom_blocks"] }) {
  if (!blocks?.length) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
      {blocks.map((block) => (
        <div
          key={block.id}
          className="absolute max-w-xs rounded-lg px-3 py-2 shadow-md"
          style={{
            left: block.left,
            top: block.top,
            color: block.color,
            fontSize: block.fontSize,
            fontWeight: block.fontWeight,
            backgroundColor: block.backgroundColor || "rgba(255,255,255,0.92)",
          }}
        >
          {block.text}
        </div>
      ))}
    </div>
  );
}

export function HomePage({ previewConfig, isPreview = false, visualEdit = false }: Props) {
  const [config, setConfig] = useState<SiteConfig>(previewConfig ?? FALLBACK_CONFIG);

  useEffect(() => {
    if (previewConfig) {
      setConfig(previewConfig);
      return;
    }
    void fetchSiteConfig().then(setConfig);
    const interval = setInterval(() => {
      void fetchSiteConfig().then(setConfig);
    }, 15000);
    const onFocus = () => void fetchSiteConfig().then(setConfig);
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, [previewConfig]);

  const themeVars = themeStyleVars(config.theme);

  return (
    <SiteConfigProvider config={config}>
    <main
      className="premium-site-bg min-h-screen pb-20 font-[family-name:var(--font-poppins)] md:pb-0"
      style={{ ...themeVars, background: "var(--site-bg)" }}
    >
      {isPreview && !visualEdit && (
        <div className="sticky top-0 z-[60] bg-amber-500 px-4 py-2 text-center text-sm font-bold text-amber-950">
          👁️ PREVIEW MODE — changes not live until you Publish
        </div>
      )}
      {visualEdit && (
        <div className="sticky top-0 z-[60] bg-violet-600 px-4 py-2 text-center text-sm font-bold text-white">
          ✏️ VISUAL EDIT — click elements to edit · Move tool to drag
        </div>
      )}
      <div className="relative">
        <Header />
      <UrgencyBar config={config} />
      <PromoStrip config={config} />
      <LiveSocialProof config={config} />
      <DynamicHero config={config} />
      <HeroTrustBand config={config} />
      {config.sections.metrics_ticker !== false && <MetricsTicker config={config} />}
      {config.sections.dream_section !== false && <DreamSection config={config} />}
      <BusinessModelFlow config={config} />
      <LoanProductsStrip config={config} />
      <EmotionalCtaBand config={config} />
      <LifestyleShowcase config={config} />
      <HowItWorks config={config} />
      <PremiumFeaturesGrid config={config} />
      {config.sections.emi_calculator !== false && <EmiCalculator />}
      {config.sections.testimonials !== false && <Testimonials config={config} />}
      <PlatformCapabilities config={config} />
      <TrustGallery config={config} />
      <ReferBanner config={config} />
      <AppDownloadBanner config={config} />
      {config.sections.faq !== false && <FAQ config={config} />}
      <Footer config={config} />
        <LiveCustomBlocks blocks={config.custom_blocks} />
      </div>
      {!isPreview && !visualEdit && (
        <>
          <BugReportWidget />
          <AIChatWidget />
          <FloatingCTA />
          <WhatsAppButton />
          <MobileStickyCTA />
        </>
      )}
    </main>
    </SiteConfigProvider>
  );
}
