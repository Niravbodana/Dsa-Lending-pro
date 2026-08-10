"use client";

import Image from "next/image";
import Link from "next/link";

const FEATURES = [
  { icon: "⚡", title: "Eligible offers up to ₹20 Lakhs", sub: "Fully digital — no branch visits" },
  { icon: "🛡️", title: "Multiple lending partners", sub: "Compared in one place, side by side" },
  { icon: "⏱️", title: "Funds to your bank account", sub: "When your lender disburses" },
] as const;

const CARDS = [
  { title: "Soft Check Only", sub: "Won't affect your credit score" },
  { title: "A NeerCred Use Case", sub: "Wedding expenses — one simple form" },
  { title: "Personalised Pricing", sub: "Offers matched to your profile" },
  { title: "Compare Offers", sub: "Multiple lenders, one form" },
  { title: "Fully Digital", sub: "No branch visits" },
  { title: "Transparent", sub: "No hidden charges" },
] as const;

export default function PromoHomepage() {
  return (
    <div
      className="h-dvh overflow-hidden"
      style={{ background: "linear-gradient(165deg, #DBEAFE 0%, #E0F2FE 25%, #F0F9FF 50%, #ECFEFF 75%, #F8FAFC 100%)" }}
    >
      <div className="mx-auto flex h-full max-w-md flex-col px-4 pb-4 pt-3">
        <div className="mb-3 flex items-start justify-between gap-2">
          <Link href="/" className="shrink-0">
            <Image src="/neercred-logo-header.svg" alt="NeerCred" width={168} height={56} priority className="h-14 w-auto" />
          </Link>
          <Link
            href="/apply"
            className="shrink-0 rounded-full px-3 py-2 text-[11px] font-bold text-white shadow-md"
            style={{ background: "linear-gradient(135deg, #0B1220, #134E4A, #0F766E)" }}
          >
            Check Eligibility →
          </Link>
        </div>

        <div className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-[#0F766E]/20 bg-white/80 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-wide text-[#0F766E]">
          <span>✓</span> Digital Lending Aggregator · Financial Services Platform
        </div>

        <h1 className="text-[2rem] font-extrabold leading-[1.1] tracking-tight text-[#0B1220]">
          One Platform.
          <br />
          Every Financial Goal.
        </h1>
        <p className="mt-2 text-xl font-bold text-[#0F766E]">Loans live today.</p>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          NeerCred matches you with trusted lending partners — borrow smart with a transparent, fully digital journey.
        </p>

        <ul className="mt-4 space-y-2.5">
          {FEATURES.map((f) => (
            <li key={f.title} className="flex gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/90 text-base shadow-sm">{f.icon}</span>
              <div>
                <p className="text-sm font-bold text-[#0B1220]">{f.title}</p>
                <p className="text-xs text-slate-500">{f.sub}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-4 space-y-2">
          <Link
            href="/apply"
            className="flex w-full items-center justify-center rounded-2xl py-4 text-sm font-bold text-white shadow-lg"
            style={{ background: "linear-gradient(135deg, #0B1220, #134E4A, #0F766E)" }}
          >
            Get Loan Offers →
          </Link>
          <button type="button" className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/90 py-3.5 text-sm font-semibold text-[#0B1220]">
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-xs">▶</span>
            How It Works
          </button>
        </div>

        <p className="mt-3 text-center text-[10px] text-slate-400">Rates from 10.99% p.a. · indicative only</p>

        <div className="mt-3 grid flex-1 grid-cols-2 gap-2 content-end">
          {CARDS.map((card) => (
            <div key={card.title} className="rounded-2xl border border-white/80 bg-white/70 p-3 backdrop-blur-sm">
              <p className="text-[11px] font-bold leading-tight text-[#0B1220]">{card.title}</p>
              <p className="mt-1 text-[10px] leading-snug text-slate-500">{card.sub}</p>
            </div>
          ))}
        </div>

        <p className="mt-2 shrink-0 text-center text-[10px] font-medium text-slate-400">
          Purity & Trust · Built on security and transparency
        </p>
      </div>
    </div>
  );
}
