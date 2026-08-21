"use client";

import Image from "next/image";
import Link from "next/link";
import { IconCheckCircle, IconStar } from "@/components/icons";

export default function PromoApprovedPage() {
  return (
    <div
      className="relative min-h-dvh"
      style={{ background: "linear-gradient(165deg, #DBEAFE 0%, #E0F2FE 30%, #F0F9FF 60%, #F8FAFC 100%)" }}
    >
      <div className="relative mx-auto flex min-h-dvh max-w-md flex-col px-5 pb-8 pt-5">
        <Link href="/" className="mb-6 inline-flex w-fit items-center">
          <Image src="/neercred-logo-header.svg" alt="NeerCred" width={220} height={72} priority className="h-14 w-auto" />
        </Link>

        <div className="relative flex flex-1 flex-col items-center text-center">
          <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center gap-5 text-[#0F766E] opacity-90">
            {[IconStar, IconCheckCircle, IconStar, IconCheckCircle].map((Icon, i) => (
              <Icon key={i} size={22} className="animate-bounce" style={{ animationDelay: `${i * 0.2}s`, animationDuration: "1.4s" } as React.CSSProperties} />
            ))}
          </div>

          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full shadow-lg" style={{ background: "linear-gradient(135deg, #0F766E, #0891B2)" }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0F766E]">Congratulations!</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#0B1220]">You May Qualify!</h1>
          <p className="mt-2 text-sm text-slate-500">Eligible offer from a lending partner on NeerCred</p>

          <div className="mt-8 w-full rounded-3xl border border-[#0F766E]/20 bg-white p-6 shadow-[0_12px_40px_-16px_rgba(15,118,110,0.25)]">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Eligible amount</p>
            <p className="mt-1 text-5xl font-extrabold text-transparent" style={{ background: "linear-gradient(135deg, #0D5C56, #0F766E, #2DD4BF)", WebkitBackgroundClip: "text" }}>
              ₹15,00,000
            </p>
            <p className="mt-1 text-sm text-slate-500">Indicative · subject to lender approval</p>

            <div className="mt-6 text-left">
              <label className="text-xs font-semibold text-slate-600">Select your loan amount</label>
              <div className="mt-3 h-2 rounded-full bg-slate-100">
                <div className="h-2 w-full rounded-full" style={{ background: "linear-gradient(90deg, #0F766E, #5EEAD4)" }} />
              </div>
              <div className="mt-2 flex justify-between text-xs text-slate-500">
                <span>₹1L</span>
                <span className="font-bold text-[#0F766E]">₹15,00,000</span>
                <span>₹15L</span>
              </div>
            </div>

            <button type="button" className="mt-6 w-full rounded-2xl py-4 text-base font-bold text-white shadow-lg" style={{ background: "linear-gradient(135deg, #0B1220, #134E4A, #0F766E)" }}>
              Get Disbursed in Minutes →
            </button>
          </div>

          <div className="mt-6 grid w-full grid-cols-3 gap-2 text-center">
            {[
              { label: "Rate", value: "10.99%*" },
              { label: "EMI", value: "₹38,761*" },
              { label: "Tenure", value: "48 mo" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-slate-100 bg-white/80 px-2 py-3">
                <p className="text-[10px] font-semibold uppercase text-slate-400">{item.label}</p>
                <p className="mt-1 text-sm font-bold text-[#0B1220]">{item.value}</p>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[10px] text-slate-400">*Indicative only — final terms from lender</p>
        </div>
      </div>
    </div>
  );
}
