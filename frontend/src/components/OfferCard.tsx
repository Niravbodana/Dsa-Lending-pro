"use client";

import { LoanOffer } from "@/lib/api";

const chanceColors = {
  high: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-orange-100 text-orange-700",
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
}: {
  offer: LoanOffer;
  onSelect: (offer: LoanOffer) => void;
  loading: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-teal-300 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-sm font-bold text-teal-700">
            {offer.lender_logo}
          </div>
          <div>
            <h3 className="font-bold text-slate-900">{offer.lender_name}</h3>
            <span
              className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${chanceColors[offer.approval_chance]}`}
            >
              {offer.approval_chance} approval chance
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-extrabold text-teal-700">
            {formatCurrency(offer.loan_amount)}
          </p>
          <p className="text-sm text-slate-500">loan amount</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-slate-50 p-3 text-center">
          <p className="text-lg font-bold text-slate-900">{offer.interest_rate}%</p>
          <p className="text-xs text-slate-500">Interest p.a.</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3 text-center">
          <p className="text-lg font-bold text-slate-900">{formatCurrency(offer.emi)}</p>
          <p className="text-xs text-slate-500">EMI/month</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3 text-center">
          <p className="text-lg font-bold text-slate-900">{offer.tenure_months}mo</p>
          <p className="text-xs text-slate-500">Tenure</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {offer.features.map((f) => (
          <span key={f} className="rounded-full bg-teal-50 px-3 py-1 text-xs text-teal-700">
            ✓ {f}
          </span>
        ))}
      </div>

      <p className="mt-3 text-xs text-slate-400">Processing fee: {offer.processing_fee}</p>

      <button
        onClick={() => onSelect(offer)}
        disabled={loading}
        className="mt-4 w-full rounded-xl bg-teal-600 py-3 font-bold text-white transition hover:bg-teal-700 disabled:opacity-50"
      >
        {loading ? "Processing..." : "Select This Offer →"}
      </button>
    </div>
  );
}
