"use client";

import Image from "next/image";
import Link from "next/link";
import { IconCheck } from "@/components/icons";

const OFFERS = [
  {
    id: "hdfc",
    name: "HDFC Bank",
    logo: "/logos/hdfc-bank.svg",
    rate: "10.99",
    amount: 1500000,
    emi: 38741,
    tenure: 48,
    fee: "Up to 2%",
    badge: "Recommended for you",
    features: ["Instant approval", "Zero foreclosure"],
    best: true,
  },
  {
    id: "icici",
    name: "ICICI Bank",
    logo: "",
    rate: "11.49",
    amount: 1400000,
    emi: 36520,
    tenure: 48,
    fee: "1.5%",
    badge: "Strong match",
    features: ["Flexible tenure", "Quick disbursal"],
    best: false,
  },
] as const;

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function PromoOffersPage() {
  return (
    <div
      className="min-h-dvh"
      style={{ background: "linear-gradient(165deg, #DBEAFE 0%, #E0F2FE 30%, #F0F9FF 60%, #F8FAFC 100%)" }}
    >
      <div className="mx-auto flex min-h-dvh max-w-md flex-col px-4 pb-6 pt-3">
        <div className="mb-3 flex items-center justify-between gap-2">
          <Link href="/" className="shrink-0">
            <Image src="/neercred-logo-header.svg" alt="NeerCred™" width={168} height={56} priority className="h-12 w-auto" />
          </Link>
          <span className="rounded-full bg-[#0F766E]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#0F766E]">
            Step 4 of 5
          </span>
        </div>

        <h1 className="text-2xl font-extrabold tracking-tight text-[#0B1220]">Your eligible offers</h1>
        <p className="mt-1 text-sm text-slate-500">Compare rates and pick the best match for you</p>

        <div className="mt-5 space-y-4">
          {OFFERS.map((offer) => (
            <div
              key={offer.id}
              className={`relative rounded-2xl border bg-white p-5 shadow-[0_8px_30px_-12px_rgba(15,118,110,0.2)] ${
                offer.best ? "border-[#D4A017]/40 ring-1 ring-[#D4A017]/25" : "border-slate-200/90"
              }`}
            >
              {offer.best && (
                <div
                  className="absolute -top-3 left-5 rounded-full px-3 py-1 text-[10px] font-bold text-[#0B1220]"
                  style={{ background: "linear-gradient(90deg, #FDE68A, #D4A017)" }}
                >
                  {offer.badge}
                </div>
              )}

              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {offer.logo ? (
                    <div className="relative flex h-12 w-[88px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white ring-1 ring-slate-100">
                      <Image src={offer.logo} alt={offer.name} width={80} height={28} className="h-7 w-auto object-contain" />
                    </div>
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 text-xs font-bold text-[#0F766E] ring-1 ring-teal-100">
                      ICIC
                    </div>
                  )}
                  <div>
                    <h2 className="font-bold text-[#0B1220]">{offer.name}</h2>
                    <span className="mt-1 inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                      Strong match
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#0F766E]">{offer.rate}%</p>
                  <p className="text-[10px] text-slate-500">interest p.a.</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-xl bg-slate-50 p-2.5 text-center">
                  <p className="text-xs font-bold text-[#0B1220]">{formatCurrency(offer.amount)}</p>
                  <p className="text-[9px] uppercase tracking-wide text-slate-500">Amount</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-2.5 text-center">
                  <p className="text-xs font-bold text-[#0B1220]">{formatCurrency(offer.emi)}</p>
                  <p className="text-[9px] uppercase tracking-wide text-slate-500">EMI / mo</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-2.5 text-center">
                  <p className="text-xs font-bold text-[#0B1220]">{offer.tenure} mo</p>
                  <p className="text-[9px] uppercase tracking-wide text-slate-500">Tenure</p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {offer.features.map((f) => (
                  <span key={f} className="inline-flex items-center gap-1 rounded-full bg-teal-50/80 px-2.5 py-1 text-[10px] font-medium text-[#0F766E]">
                    <IconCheck size={10} className="shrink-0" strokeWidth={3} />
                    {f}
                  </span>
                ))}
              </div>

              <p className="mt-2 text-[10px] text-slate-400">Processing fee: {offer.fee}</p>

              <button
                type="button"
                className={`mt-4 w-full rounded-xl py-3.5 text-sm font-bold ${
                  offer.best
                    ? "text-[#0B1220] shadow-md"
                    : "bg-[#0B1220] text-white"
                }`}
                style={
                  offer.best
                    ? { background: "linear-gradient(90deg, #FDE68A, #D4A017)" }
                    : undefined
                }
              >
                {offer.best ? "Select this offer" : "Select this offer"}
              </button>
            </div>
          ))}
        </div>

        <p className="mt-4 text-center text-[10px] text-slate-400">*Indicative offers — final terms from lender</p>
      </div>
    </div>
  );
}
