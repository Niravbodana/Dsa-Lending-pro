"use client";

import { LoanOffer } from "@/lib/api";
import { LenderLogo } from "@/components/LenderLogo";
import { IconCheckCircle } from "@/components/icons";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

type Props = {
  offers: LoanOffer[];
  bestOfferId?: string;
  onSelect: (offer: LoanOffer) => void;
  loading: boolean;
  loadingOfferId?: string;
};

/** Side-by-side expert comparison — the decision moment */
export function OfferComparisonTable({ offers, bestOfferId, onSelect, loading, loadingOfferId }: Props) {
  if (!offers.length) return null;

  const best = offers.find((o) => o.offer_id === bestOfferId) || offers[0];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-teal-200 bg-gradient-to-r from-teal-50 to-cyan-50/80 p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-teal-900">
          <IconCheckCircle size={18} />
          Our recommendation: {best.lender_name}
        </p>
        <p className="mt-1 text-xs text-teal-800/90">
          Lowest total cost for your profile — {best.interest_rate}% p.a., EMI {formatCurrency(best.emi)}/mo.
          You stay in control; compare all options below.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-neercred">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/80 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3">Lender</th>
              <th className="px-4 py-3">Rate</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">EMI</th>
              <th className="px-4 py-3">Tenure</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {offers.map((offer) => {
              const isBest = offer.offer_id === best.offer_id;
              const isLoading = loading && loadingOfferId === offer.offer_id;
              return (
                <tr
                  key={offer.offer_id}
                  className={`border-b border-slate-50 transition-colors ${isBest ? "bg-teal-50/50" : "hover:bg-slate-50/50"}`}
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <LenderLogo name={offer.lender_name} logo={offer.lender_logo} size={36} />
                      <div>
                        <p className="font-semibold text-neercred-navy">{offer.lender_name}</p>
                        {isBest && (
                          <span className="text-[10px] font-bold uppercase tracking-wide text-neercred-teal">
                            Recommended
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-bold text-neercred-teal">{offer.interest_rate}%</td>
                  <td className="px-4 py-4">{formatCurrency(offer.loan_amount)}</td>
                  <td className="px-4 py-4 font-medium">{formatCurrency(offer.emi)}</td>
                  <td className="px-4 py-4 text-slate-600">{offer.tenure_months} mo</td>
                  <td className="px-4 py-4">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => onSelect(offer)}
                      className={`rounded-lg px-4 py-2 text-xs font-bold transition disabled:opacity-50 ${
                        isBest
                          ? "bg-neercred-teal text-white hover:brightness-110"
                          : "border border-slate-200 bg-white text-slate-700 hover:border-teal-200"
                      }`}
                    >
                      {isLoading ? "…" : "Select"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
