"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { exportMyData, requestDataDeletion } from "@/lib/api";
import { getStoredSessionToken } from "@/lib/customer-session";

export default function PrivacyPage() {
  const [token, setToken] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setToken(getStoredSessionToken());
  }, []);

  async function handleExport() {
    if (!token) {
      setMessage("Please login first to export your data.");
      return;
    }
    setLoading(true);
    try {
      const data = await exportMyData(token);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "neercred-data-export.json";
      a.click();
      URL.revokeObjectURL(url);
      setMessage("Your data has been downloaded.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Export failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!token) {
      setMessage("Please login first.");
      return;
    }
    if (!confirm("Request deletion of your personal data? Active applications may delay erasure per RBI rules.")) {
      return;
    }
    setLoading(true);
    try {
      const res = await requestDataDeletion(token);
      setMessage(res.message);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-2xl px-4 py-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-neercred-teal">Your data rights</p>
        <h1 className="mt-2 text-3xl font-bold text-neercred-navy">Privacy & DPDP</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Under the Digital Personal Data Protection Act 2023, you can access, export, or request erasure of your
          personal data held by NeerCred (RBI-registered LSP).
        </p>

        {!token && (
          <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <Link href="/login" className="font-semibold underline">
              Login
            </Link>{" "}
            with your mobile OTP to manage your data.
          </p>
        )}

        <div className="mt-8 space-y-4">
          <button
            type="button"
            onClick={() => void handleExport()}
            disabled={loading || !token}
            className="neercred-btn w-full py-3.5 disabled:opacity-50"
          >
            Download my data (JSON)
          </button>
          <button
            type="button"
            onClick={() => void handleDelete()}
            disabled={loading || !token}
            className="w-full rounded-xl border border-red-200 bg-red-50 py-3.5 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50"
          >
            Request data deletion
          </button>
        </div>

        {message && <p className="mt-4 text-sm text-slate-600">{message}</p>}

        <p className="mt-8 text-sm text-slate-500">
          See also{" "}
          <Link href="/compliance" className="font-semibold text-neercred-teal hover:underline">
            Compliance & regulatory disclosures
          </Link>
        </p>
      </div>
    </PageShell>
  );
}
