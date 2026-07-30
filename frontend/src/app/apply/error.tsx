"use client";

import Link from "next/link";
import { Header } from "@/components/Header";
import { EmptyState } from "@/components/ui/EmptyState";

export default function ApplyError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-slate-50">
      <Header />
      <div className="mx-auto max-w-lg px-4 py-16">
        <EmptyState
          variant="warning"
          title="Something interrupted your application"
          description={error.message || "We couldn't complete this step. Your progress is saved — try again or contact support."}
          action={{ label: "Try again", href: "/apply" }}
          secondaryAction={{ label: "Help center", href: "/help" }}
        />
        <button
          type="button"
          onClick={reset}
          className="mx-auto mt-4 block text-sm font-medium text-neercred-teal hover:underline"
        >
          Reload this step
        </button>
        <p className="mt-6 text-center">
          <Link href="/" className="text-xs text-slate-400 hover:text-slate-600">
            ← Back to homepage
          </Link>
        </p>
      </div>
    </main>
  );
}
