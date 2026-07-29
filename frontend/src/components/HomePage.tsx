"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { DynamicHero } from "@/components/DynamicHero";
import { HeroTrustBand } from "@/components/HeroTrustBand";
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
import { themeStyleVars } from "@/lib/site-theme";

type Props = {
  previewConfig?: SiteConfig;
  isPreview?: boolean;
};

export function HomePage({ previewConfig, isPreview = false }: Props) {
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
    <main
      className="premium-site-bg min-h-screen pb-20 font-[family-name:var(--font-poppins)] md:pb-0"
      style={{ ...themeVars, background: "var(--site-bg)" }}
    >
      {isPreview && (
        <div className="sticky top-0 z-[60] bg-amber-500 px-4 py-2 text-center text-sm font-bold text-amber-950">
          👁️ PREVIEW MODE — changes not live until you Publish
        </div>
      )}
      <Header />
      <DynamicHero config={config} />
      <HeroTrustBand />
      <DreamSection config={config} />
      <BusinessModelFlow />
      <LoanProductsStrip />
      <EmotionalCtaBand />
      <LifestyleShowcase />
      <HowItWorks />
      <PremiumFeaturesGrid />
      {config.sections.emi_calculator !== false && <EmiCalculator />}
      {config.sections.testimonials !== false && <Testimonials />}
      <PlatformCapabilities />
      <TrustGallery />
      <ReferBanner />
      <AppDownloadBanner />
      <FAQ />
      <Footer />
      {!isPreview && (
        <>
          <BugReportWidget />
          <AIChatWidget />
          <FloatingCTA />
          <WhatsAppButton />
          <MobileStickyCTA />
        </>
      )}
    </main>
  );
}
