"use client";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { EmptyState } from "@/components/ui/EmptyState";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-teal-50/30">
      <Header />
      <div className="mx-auto max-w-lg px-4 py-20">
        <EmptyState
          variant="warning"
          title="Something went wrong"
          description={
            error.message ||
            "We hit an unexpected issue. Your data is safe — please try again or return to the homepage."
          }
          action={{ label: "Go to homepage", href: "/" }}
          secondaryAction={{ label: "Help center", href: "/help" }}
        />
        <button
          type="button"
          onClick={reset}
          className="mx-auto mt-4 block text-sm font-medium text-neercred-teal hover:underline"
        >
          Try again
        </button>
      </div>
      <Footer />
    </main>
  );
}
