"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { InnerHero } from "@/components/InnerHero";
import { JourneyStepHeader } from "@/components/JourneyStepHeader";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { INDIAN_IMAGES } from "@/lib/indian-images";
import { trackApplication } from "@/lib/api";
import { IconCheckCircle, IconFile, IconShield } from "@/components/icons";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

const STATUS_VARIANT: Record<string, "success" | "warning" | "info" | "default"> = {
  disbursed: "success",
  approved: "success",
  kyc_pending: "warning",
  under_review: "warning",
  offer_selected: "info",
};

function TrackContent() {
  const params = useSearchParams();
  const [ref, setRef] = useState(params.get("ref") || "");
  const [mobile, setMobile] = useState("");
  const [result, setResult] = useState<{
    application: {
      application_ref: string;
      lender_name: string;
      loan_amount: number;
      status: string;
      emi: number;
    };
    timeline: { status: string; message: string | null; created_at: string }[];
    lead_name: string | null;
  } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleTrack(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSearched(true);
    try {
      const data = await trackApplication(ref.toUpperCase(), mobile);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Application not found. Check your reference and mobile number.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 pb-16">
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-neercred sm:p-8">
        <JourneyStepHeader
          stepLabel="Application tracking"
          title="Track your loan status"
          subtitle="Enter your application reference and registered mobile — we'll show exactly where you are in the journey."
          trustNote="Secure lookup · Only you can view your application"
        />

        <form onSubmit={handleTrack} className="mt-2 space-y-4">
          <Input
            label="Application reference"
            placeholder="e.g. NLR123456"
            value={ref}
            onChange={(e) => setRef(e.target.value.toUpperCase())}
            className="font-mono"
            hint="Found in your confirmation SMS or email"
            required
          />
          <Input
            label="Registered mobile number"
            placeholder="10-digit mobile"
            inputMode="numeric"
            value={mobile}
            onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
            required
          />
          {error && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Looking up your application…" : "Track status →"}
          </Button>
        </form>

        {result && (
          <div className="mt-8 border-t border-slate-100 pt-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-mono text-xs text-slate-400">{result.application.application_ref}</p>
                <h2 className="mt-1 text-xl font-bold text-neercred-navy">{result.application.lender_name}</h2>
                {result.lead_name && (
                  <p className="text-sm text-slate-500">Applicant: {result.lead_name}</p>
                )}
              </div>
              <Badge variant={STATUS_VARIANT[result.application.status] || "default"}>
                {result.application.status.replace(/_/g, " ")}
              </Badge>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Loan amount</p>
                <p className="text-lg font-bold text-neercred-navy">{formatCurrency(result.application.loan_amount)}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Monthly EMI</p>
                <p className="text-lg font-bold text-neercred-teal">{formatCurrency(result.application.emi)}</p>
              </div>
            </div>

            <h3 className="mt-8 text-sm font-bold text-neercred-navy">Your journey timeline</h3>
            <ol className="mt-4 space-y-0">
              {result.timeline.map((t, i) => {
                const isLast = i === result.timeline.length - 1;
                return (
                  <li key={i} className="relative flex gap-4 pb-6 last:pb-0">
                    {!isLast && <span className="absolute left-[11px] top-6 h-full w-px bg-teal-200" aria-hidden />}
                    <span className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 text-neercred-teal">
                      <IconCheckCircle size={14} />
                    </span>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <p className="font-semibold capitalize text-slate-800">{t.status.replace(/_/g, " ")}</p>
                      {t.message && <p className="mt-0.5 text-sm text-slate-500">{t.message}</p>}
                      <p className="mt-1 text-xs text-slate-400">
                        {new Date(t.created_at).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/dashboard" className="neercred-btn inline-flex flex-1 justify-center px-6 py-3 text-sm sm:flex-none">
                Open dashboard →
              </Link>
              <Link
                href="/help"
                className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:flex-none"
              >
                Need help?
              </Link>
            </div>
          </div>
        )}

        {searched && !loading && !result && !error && (
          <div className="mt-8">
            <EmptyState
              icon={<IconFile size={24} className="text-neercred-teal" />}
              title="No application found"
              description="Double-check your reference number and mobile. If you just applied, status may take a few minutes to appear."
              action={{ label: "Apply for a loan", href: "/apply" }}
            />
          </div>
        )}

        <p className="mt-8 flex items-center justify-center gap-1.5 text-center text-xs text-slate-400">
          <IconShield size={12} />
          Your lookup is encrypted and never shared with third parties
        </p>
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <PageShell>
      <InnerHero
        badge="TRACK APPLICATION"
        title="Know exactly where you stand"
        subtitle="Real-time status for your NeerCred application — transparent, secure, and always up to date."
        image={INDIAN_IMAGES.pages.track}
      />
      <Suspense fallback={<div className="py-16 text-center text-sm text-slate-500">Loading…</div>}>
        <TrackContent />
      </Suspense>
    </PageShell>
  );
}
