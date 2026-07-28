import { Header } from "@/components/Header";
import { Footer, Hero, HowItWorks, Partners } from "@/components/LandingSections";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <HowItWorks />
      <Partners />
      <Footer />
    </main>
  );
}
