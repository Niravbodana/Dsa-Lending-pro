"use client";

import Image from "next/image";
import Link from "next/link";

export default function PromoApprovedPage() {
  return (
    <div className="min-h-dvh bg-gradient-to-b from-[#ECFDF5] via-white to-[#F0FDFA]">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col px-5 pb-8 pt-5">
        <Link href="/" className="mb-6 inline-flex w-fit items-center">
          <Image src="/neercred-logo-lockup.svg" alt="NeerCred" width={168} height={56} priority className="h-12 w-auto" />
        </Link>

        <div className="flex flex-1 flex-col items-center text-center">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg shadow-emerald-500/30">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Congratulations!</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#0B1220]">Loan Approved</h1>
          <p className="mt-2 text-sm text-slate-500">Your application has been approved by our lending partner</p>

          <div className="mt-8 w-full rounded-3xl border border-emerald-200/80 bg-white p-6 shadow-[0_12px_40px_-16px_rgba(16,185,129,0.35)]">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Approved amount</p>
            <p className="mt-1 bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-5xl font-extrabold text-transparent">
              ₹5,00,000
            </p>
            <p className="mt-1 text-sm text-slate-500">Pre-approved · Instant disbursal eligible</p>

            <div className="mt-6 text-left">
              <label className="text-xs font-semibold text-slate-600">Select your loan amount</label>
              <div className="mt-3 h-2 rounded-full bg-slate-100">
                <div className="h-2 w-[72%] rounded-full bg-gradient-to-r from-teal-500 to-emerald-500" />
              </div>
              <div className="mt-2 flex justify-between text-xs text-slate-500">
                <span>₹1L</span>
                <span className="font-bold text-teal-700">₹5,00,000</span>
                <span>₹5L</span>
              </div>
            </div>

            <button
              type="button"
              className="mt-6 w-full rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 py-4 text-base font-bold text-white shadow-lg shadow-teal-900/20"
            >
              Get Disbursed in Minutes →
            </button>
          </div>

          <div className="mt-6 grid w-full grid-cols-3 gap-2 text-center">
            {[
              { label: "Rate", value: "10.99%" },
              { label: "EMI", value: "₹11,247" },
              { label: "Tenure", value: "48 mo" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-slate-100 bg-white/80 px-2 py-3">
                <p className="text-[10px] font-semibold uppercase text-slate-400">{item.label}</p>
                <p className="mt-1 text-sm font-bold text-slate-800">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
