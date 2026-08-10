"use client";

import Image from "next/image";
import Link from "next/link";

const FEATURES = [
  {
    icon: "⚡",
    title: "Instant loans up to ₹20 Lakhs",
    sub: "Fully digital, no branch visits",
  },
  {
    icon: "🛡️",
    title: "Multiple lending partners",
    sub: "Compared in one place, side by side",
  },
  {
    icon: "⏱️",
    title: "Approved offers disbursed",
    sub: "Straight to your bank account",
  },
] as const;

const CARDS = [
  { title: "Soft Check Only", sub: "Won't affect your credit score" },
  { title: "A NeerCred Use Case", sub: "Wedding expenses covered in 48 hours" },
  { title: "Personalized Pricing", sub: "Offers made for your profile" },
  { title: "Compare Offers", sub: "Multiple lenders, one form" },
  { title: "Fully Digital", sub: "No branch visits" },
  { title: "Transparent", sub: "No hidden charges" },
] as const;

export default function PromoHomepage() {
  return (
    <div className="min-h-dvh bg-gradient-to-br from-[#E8F8F5] via-[#F0FDFA] to-[#CCFBF1]">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col px-4 pb-6 pt-4">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-2">
          <Link href="/" className="shrink-0">
            <Image
              src="/neercred-logo-header.svg"
              alt="NeerCred"
              width={168}
              height={56}
              priority
              className="h-14 w-auto"
            />
          </Link>
          <Link
            href="/apply"
            className="shrink-0 rounded-full bg-[#0F766E] px-3 py-2 text-[11px] font-bold text-white shadow-md"
          >
            Check Eligibility →
          </Link>
        </div>

        {/* Badge */}
        <div className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-teal-200/80 bg-white/70 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-wide text-teal-800">
          <span className="text-teal-600">✓</span>
          Digital Lending Aggregator · Financial Services Platform
        </div>

        {/* Hero */}
        <h1 className="text-[2rem] font-extrabold leading-[1.1] tracking-tight text-[#0B3D38]">
          One Platform.
          <br />
          Every Financial Goal.
        </h1>
        <p className="mt-2 text-xl font-bold text-[#0F766E]">Loans live today.</p>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          NeerCred is your trusted platform to borrow, pay, protect, and grow your money — starting
          with personal loans and a transparent application process.
        </p>

        {/* Feature bullets */}
        <ul className="mt-5 space-y-3">
          {FEATURES.map((f) => (
            <li key={f.title} className="flex gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/80 text-base shadow-sm">
                {f.icon}
              </span>
              <div>
                <p className="text-sm font-bold text-slate-800">{f.title}</p>
                <p className="text-xs text-slate-500">{f.sub}</p>
              </div>
            </li>
          ))}
        </ul>

        {/* CTAs */}
        <div className="mt-6 space-y-2.5">
          <Link
            href="/apply"
            className="flex w-full items-center justify-center rounded-2xl bg-[#0F766E] py-4 text-sm font-bold text-white shadow-lg shadow-teal-900/15"
          >
            Get Loan Offers →
          </Link>
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/90 py-3.5 text-sm font-semibold text-slate-700"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-xs">
              ▶
            </span>
            How It Works
          </button>
        </div>

        {/* Feature cards grid */}
        <div className="mt-6 grid grid-cols-2 gap-2.5">
          {CARDS.map((card) => (
            <div
              key={card.title}
              className="rounded-2xl border border-white/80 bg-white/60 p-3 backdrop-blur-sm"
            >
              <p className="text-[11px] font-bold leading-tight text-slate-800">{card.title}</p>
              <p className="mt-1 text-[10px] leading-snug text-slate-500">{card.sub}</p>
            </div>
          ))}
        </div>

        <p className="mt-5 text-center text-[10px] font-medium text-slate-400">
          Built on security, transparency, and regulatory clarity
        </p>
      </div>
    </div>
  );
}
