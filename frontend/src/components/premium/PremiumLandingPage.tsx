"use client";

import { PremiumNavbar } from "@/components/premium/layout/PremiumNavbar";
import { PremiumFooter } from "@/components/premium/layout/PremiumFooter";
import { PremiumHero } from "@/components/premium/hero/PremiumHero";
import { PremiumTrustStrip } from "@/components/premium/sections/PremiumTrustStrip";
import { PremiumLoanCategories } from "@/components/premium/sections/PremiumLoanCategories";
import { PremiumWhyChoose } from "@/components/premium/sections/PremiumWhyChoose";
import { PremiumBenefits } from "@/components/premium/sections/PremiumBenefits";
import { PremiumProcess } from "@/components/premium/sections/PremiumProcess";
import { PremiumFeatures } from "@/components/premium/sections/PremiumFeatures";
import { PremiumTestimonials } from "@/components/premium/sections/PremiumTestimonials";
import { PremiumFAQ } from "@/components/premium/sections/PremiumFAQ";
import { PremiumCTA } from "@/components/premium/sections/PremiumCTA";
import { EmiCalculator } from "@/components/EmiCalculator";

/** Production-ready premium fintech landing page */
export function PremiumLandingPage() {
  return (
    <div className="premium-landing min-h-screen bg-white font-[family-name:var(--font-plus-jakarta)]">
      <PremiumNavbar />
      <main>
        <PremiumHero />
        <PremiumTrustStrip />
        <PremiumLoanCategories />
        <PremiumWhyChoose />
        <PremiumBenefits />
        <PremiumProcess />
        <PremiumFeatures />
        <section id="emi" className="bg-slate-50 py-20">
          <div className="mx-auto max-w-7xl px-4">
            <EmiCalculator />
          </div>
        </section>
        <PremiumTestimonials />
        <PremiumFAQ />
        <PremiumCTA />
      </main>
      <PremiumFooter />
    </div>
  );
}
