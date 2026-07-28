import { Header } from "@/components/Header";
import {
  Hero,
  HowItWorks,
  Partners,
  LoanProductsStrip,
  LifestyleShowcase,
  TrustGallery,
  AppDownloadBanner,
  ReferBanner,
} from "@/components/LandingSections";
import { Footer } from "@/components/Footer";
import { EmiCalculator } from "@/components/EmiCalculator";
import { Testimonials } from "@/components/Testimonials";
import { FAQ } from "@/components/FAQ";
import { BugReportWidget } from "@/components/BugReportWidget";
import { FloatingCTA } from "@/components/FloatingCTA";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { AIChatWidget } from "@/components/AIChatWidget";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <LoanProductsStrip />
      <LifestyleShowcase />
      <HowItWorks />
      <EmiCalculator />
      <Testimonials />
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
    </main>
  );
}
