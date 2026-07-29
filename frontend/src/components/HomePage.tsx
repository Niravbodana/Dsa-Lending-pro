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
  Partners,
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
  MetricsTicker,
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

export function HomePage() {
  const [config, setConfig] = useState<SiteConfig>(FALLBACK_CONFIG);

  useEffect(() => {
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
  }, []);

  return (
    <main className="min-h-screen pb-20 md:pb-0">
      <Header />
      <DynamicHero config={config} />
      <HeroTrustBand />
      {config.sections.metrics_ticker !== false && <MetricsTicker />}
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
      <Partners />
      <ReferBanner />
      <AppDownloadBanner />
      <FAQ />
      <Footer />
      <BugReportWidget />
      <AIChatWidget />
      <FloatingCTA />
      <WhatsAppButton />
      <MobileStickyCTA />
    </main>
  );
}
