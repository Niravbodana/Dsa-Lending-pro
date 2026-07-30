import { PageLoadingShell } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-neercred-navy">
      <PageLoadingShell title="Opening your dashboard" subtitle="Loading applications and offers…" />
    </main>
  );
}
