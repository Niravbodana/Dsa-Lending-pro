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
    <div
      className={`relative rounded-2xl border bg-white p-6 shadow-sm transition hover:shadow-md ${
        offer.is_best_deal
          ? "border-amber-400 ring-2 ring-amber-200"
          : "border-slate-200 hover:border-teal-300"
      }`}
    >
      {offer.is_best_deal && (
        <div className="absolute -top-3 left-6 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-1 text-xs font-extrabold text-slate-900 shadow-lg">
          BEST DEAL
        </div>
      )}

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-sm font-bold text-teal-700">
            {offer.lender_logo}
          </div>
          <div>
            <h3 className="font-bold text-slate-900">{offer.lender_name}</h3>
            <div className="mt-1 flex flex-wrap gap-1">
              <span
                className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${chanceColors[offer.approval_chance]}`}
              >
                {offer.approval_chance} approval
              </span>
              {offer.response_time_ms && (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                  {offer.response_time_ms}ms
                </span>
              )}
            </div>
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

      <p className="mt-3 text-xs text-slate-400">
        Processing fee: {offer.processing_fee}
        {offer.lender_api_source === "api" && " • Live API"}
      </p>

      <button
        onClick={() => onSelect(offer)}
        disabled={loading}
        className={`mt-4 w-full rounded-xl py-3 font-bold text-white transition disabled:opacity-50 ${
          offer.is_best_deal
            ? "bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 hover:from-amber-300"
            : "bg-teal-600 hover:bg-teal-700"
        }`}
      >
        {loading ? "Processing..." : offer.is_best_deal ? "Select Best Deal" : "Select This Offer"}
      </button>
    </div>
  );
}
