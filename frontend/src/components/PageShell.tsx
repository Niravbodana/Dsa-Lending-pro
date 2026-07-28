import { Header } from "@/components/Header";
import { Footer } from "@/components/LandingSections";
import { BugReportWidget } from "@/components/BugReportWidget";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export function PageShell({
  children,
  showWidgets = true,
}: {
  children: React.ReactNode;
  showWidgets?: boolean;
}) {
  return (
    <main className="min-h-screen bg-slate-50">
      <Header />
      {children}
      <Footer />
      {showWidgets && (
        <>
          <BugReportWidget />
          <WhatsAppButton />
        </>
      )}
    </main>
  );
}
