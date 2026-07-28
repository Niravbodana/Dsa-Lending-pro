"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { trackApplication } from "@/lib/api";

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

  async function handleTrack(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await trackApplication(ref.toUpperCase(), mobile);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Not found");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <div className="rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-black text-center">Track Loan Status</h1>
        <p className="mt-2 text-center text-sm text-slate-500">
          Track using your application reference and registered mobile number
        </p>
        <form onSubmit={handleTrack} className="mt-6 space-y-4">
          <input
            placeholder="Application Ref (e.g. NLR123456)"
            value={ref}
            onChange={(e) => setRef(e.target.value.toUpperCase())}
            className="w-full rounded-xl border px-4 py-3 font-mono outline-none focus:border-teal-500"
            required
          />
          <input
            placeholder="Registered mobile number"
            value={mobile}
            onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
            className="w-full rounded-xl border px-4 py-3 outline-none focus:border-teal-500"
            required
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-teal-600 py-3 font-bold text-white disabled:opacity-50"
          >
            {loading ? "Searching..." : "Track Status →"}
          </button>
        </form>

        {result && (
          <div className="mt-8 border-t pt-6">
            <p className="font-mono text-sm text-slate-400">{result.application.application_ref}</p>
            <p className="mt-1 text-xl font-bold">{result.application.lender_name}</p>
            <p className="text-teal-600">
              ₹{result.application.loan_amount.toLocaleString("en-IN")} • EMI ₹
              {result.application.emi.toLocaleString("en-IN")}
            </p>
            <span className="mt-2 inline-block rounded-full bg-teal-100 px-3 py-1 text-sm font-bold text-teal-700 capitalize">
              {result.application.status.replace(/_/g, " ")}
            </span>
            <div className="mt-6 space-y-3">
              {result.timeline.map((t, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <span className="text-teal-600">●</span>
                  <div>
                    <p className="font-semibold capitalize">{t.status.replace(/_/g, " ")}</p>
                    <p className="text-slate-500">{t.message}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/dashboard" className="mt-6 block text-center text-sm text-teal-600 underline">
              Full Dashboard →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TrackPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Header />
      <Suspense>
        <TrackContent />
      </Suspense>
    </main>
  );
}
