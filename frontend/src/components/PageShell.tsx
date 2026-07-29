import { Header } from "@/components/Header";
import { Footer } from "@/components/LandingSections";
import { BugReportWidget } from "@/components/BugReportWidget";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { AIChatWidget } from "@/components/AIChatWidget";

export function PageShell({
  children,
  showWidgets = true,
}: {
  children: React.ReactNode;
  showWidgets?: boolean;
}) {
  return (
    <main className="premium-site-bg min-h-screen">
      <Header />
      {children}
      <Footer />
      {showWidgets && (
        <>
          <BugReportWidget />
          <AIChatWidget />
          <WhatsAppButton />
        </>
      )}
    </main>
  );
}
