import { PageLoadingShell } from "@/components/ui/Skeleton";

export default function ApplyLoading() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-teal-50/30">
      <PageLoadingShell title="Preparing your application" subtitle="Restoring your saved progress securely…" />
    </main>
  );
}
