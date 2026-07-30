"use client";

import { LoanOffer } from "@/lib/api";
import { IconCheck } from "@/components/icons";
import { LenderLogo } from "@/components/LenderLogo";

const chanceLabels = {
  high: { label: "Strong match", className: "bg-emerald-50 text-emerald-700" },
  medium: { label: "Good match", className: "bg-amber-50 text-amber-800" },
  low: { label: "Fair match", className: "bg-slate-100 text-slate-600" },
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function OfferCard({
  offer,
  onSelect,
  loading,
  recommended,
}: {
  offer: LoanOffer;
  onSelect: (offer: LoanOffer) => void;
  loading: boolean;
  recommended?: "rate" | "emi" | "amount";
}) {
  const chance = chanceLabels[offer.approval_chance];

  return (
    <div
      className={`relative rounded-2xl border bg-white p-6 shadow-neercred transition hover:shadow-lg ${
        offer.is_best_deal
          ? "border-neercred-gold/50 ring-1 ring-neercred-gold/30"
          : "border-slate-200/90 hover:border-teal-200"
      }`}
    >
      {offer.is_best_deal && (
        <div className="absolute -top-3 left-6 rounded-full bg-gradient-to-r from-neercred-gold to-amber-500 px-4 py-1 text-xs font-bold text-neercred-navy">
          Recommended for you
        </div>
      )}
      {recommended && !offer.is_best_deal && (
        <div className="absolute -top-3 left-6 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-neercred-teal">
          {recommended === "rate" && "Lowest rate"}
          {recommended === "emi" && "Lowest EMI"}
          {recommended === "amount" && "Highest amount"}
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <LenderLogo name={offer.lender_name} logo={offer.lender_logo} size={48} />
          <div>
            <h3 className="font-bold text-neercred-navy">{offer.lender_name}</h3>
            <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${chance.className}`}>
              {chance.label}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-neercred-teal">{offer.interest_rate}%</p>
          <p className="text-xs text-slate-500">interest p.a.</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-slate-50 p-3 text-center">
          <p className="text-sm font-bold text-neercred-navy">{formatCurrency(offer.loan_amount)}</p>
          <p className="text-[10px] uppercase tracking-wide text-slate-500">Amount</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3 text-center">
          <p className="text-sm font-bold text-neercred-navy">{formatCurrency(offer.emi)}</p>
          <p className="text-[10px] uppercase tracking-wide text-slate-500">EMI / mo</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3 text-center">
          <p className="text-sm font-bold text-neercred-navy">{offer.tenure_months} mo</p>
          <p className="text-[10px] uppercase tracking-wide text-slate-500">Tenure</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {offer.features.slice(0, 3).map((f) => (
          <span key={f} className="inline-flex items-center gap-1 rounded-full bg-teal-50/80 px-3 py-1 text-xs text-neercred-teal">
            <IconCheck size={12} />
            {f}
          </span>
        ))}
      </div>

      <p className="mt-3 text-xs text-slate-400">Processing fee: {offer.processing_fee}</p>

      <button
        type="button"
        onClick={() => onSelect(offer)}
        disabled={loading}
        className={`mt-5 w-full rounded-xl py-3.5 text-sm font-bold transition disabled:opacity-50 ${
          offer.is_best_deal
            ? "bg-gradient-to-r from-neercred-gold to-amber-500 text-neercred-navy hover:brightness-110"
            : "bg-neercred-cta text-white hover:brightness-110"
        }`}
      >
        {loading ? "Please wait…" : offer.workflow_mode === "external_handoff" ? "Continue with verified profile →" : "Select this offer"}
      </button>
    </div>
  );
}
