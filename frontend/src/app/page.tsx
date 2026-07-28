import { Header } from "@/components/Header";
import { Footer, Hero, HowItWorks, Partners } from "@/components/LandingSections";
import { EmiCalculator } from "@/components/EmiCalculator";
import { Testimonials } from "@/components/Testimonials";
import { FAQ } from "@/components/FAQ";
import { BugReportWidget } from "@/components/BugReportWidget";
import { FloatingCTA } from "@/components/FloatingCTA";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <HowItWorks />
      <EmiCalculator />
      <Testimonials />
      <Partners />
      <FAQ />
      <Footer />
      <BugReportWidget />
      <FloatingCTA />
    </main>
  );
}
