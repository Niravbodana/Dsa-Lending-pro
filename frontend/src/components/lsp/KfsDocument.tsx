"use client";

import { useEffect, useState } from "react";
import { LspDisclosure } from "@/components/lsp/LspDisclosure";
import { getKfs, acceptKfs } from "@/lib/api";

export type KfsData = {
  lsp_name: string;
  lsp_disclosure: string;
  lender_name: string;
  application_ref: string;
  borrower_name: string | null;
  loan_amount: number;
  interest_rate_pa: number;
  apr_percent: number;
  tenure_months: number;
  emi: number;
  processing_fee: number;
  processing_fee_pct: number;
  gst_on_processing_fee: number;
  total_interest: number;
  total_amount_payable: number;
  foreclosure_charges: string;
  late_payment_penalty: string;
  bounce_charges: string;
  cooling_off_days: number;
  cooling_off_note: string;
};

function formatInr(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

export function KfsDocument({
  applicationId,
  sessionToken,
  onAccepted,
}: {
  applicationId: number;
  sessionToken: string;
  onAccepted: () => void;
}) {
  const [kfs, setKfs] = useState<KfsData | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    void getKfs(sessionToken, applicationId)
      .then(setKfs)
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load KFS"));
  }, [applicationId, sessionToken]);

  async function handleAccept() {
    if (!accepted) {
      setError("Please confirm you have read the Key Fact Statement");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await acceptKfs(sessionToken, applicationId);
      onAccepted();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not accept KFS");
    } finally {
      setLoading(false);
    }
  }

  if (!kfs) {
    return <p className="text-sm text-slate-500">{error || "Loading Key Fact Statement…"}</p>;
  }

  const rows = [
    ["Regulated Entity (Lender)", kfs.lender_name],
    ["Loan Service Provider", kfs.lsp_name],
    ["Application ref", kfs.application_ref],
    ["Loan amount", formatInr(kfs.loan_amount)],
    ["Interest rate (p.a.)", `${kfs.interest_rate_pa}%`],
    ["APR (indicative)", `${kfs.apr_percent}%`],
    ["Tenure", `${kfs.tenure_months} months`],
    ["Monthly EMI", formatInr(kfs.emi)],
    ["Processing fee", `${formatInr(kfs.processing_fee)} (${kfs.processing_fee_pct}%)`],
    ["GST on processing", formatInr(kfs.gst_on_processing_fee)],
    ["Total interest", formatInr(kfs.total_interest)],
    ["Total amount payable", formatInr(kfs.total_amount_payable)],
    ["Foreclosure", kfs.foreclosure_charges],
    ["Late payment", kfs.late_payment_penalty],
    ["Bounce charges", kfs.bounce_charges],
    ["Cooling-off", kfs.cooling_off_note],
  ];

  return (
    <div>
      <h2 className="text-xl font-bold text-neercred-navy">Key Fact Statement (KFS)</h2>
      <p className="mt-1 text-sm text-slate-500">RBI-mandated disclosure before you sign the loan agreement</p>

      <LspDisclosure lenderName={kfs.lender_name} className="mt-4" />

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <tbody>
            {rows.map(([label, value]) => (
              <tr key={label} className="border-b border-slate-100 last:border-0">
                <td className="bg-slate-50 px-4 py-2.5 font-medium text-slate-600">{label}</td>
                <td className="px-4 py-2.5 text-slate-900">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <label className="mt-4 flex items-start gap-3 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          className="mt-1 accent-neercred-teal"
        />
        <span>
          I have read and understood the Key Fact Statement. I understand NeerCred is an LSP and{" "}
          <strong>{kfs.lender_name}</strong> is the lender.
        </span>
      </label>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={() => void handleAccept()}
        disabled={loading || !accepted}
        className="neercred-btn mt-4 w-full py-3.5 disabled:opacity-50"
      >
        {loading ? "Saving…" : "Accept KFS & continue to eSign →"}
      </button>
    </div>
  );
}
