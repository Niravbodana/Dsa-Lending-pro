"use client";

import Link from "next/link";
import { IconBolt, IconCheckCircle, IconClock, IconMenu, IconShield } from "@/components/icons";
import { NeerCredLogo } from "@/components/NeerCredLogo";

const FEATURES = [
  { icon: IconBolt, text: "Loans up to ₹15 Lakhs with same-day disbursal" },
  { icon: IconShield, text: "Fully digital – no branch visits, no paperwork" },
  { icon: IconClock, text: "0 Application Charges – we never charge you to apply" },
  { icon: IconCheckCircle, text: "Compare offers from multiple lending partners side by side" },
  { icon: IconBolt, text: "Approved offers disbursed straight to your bank account" },
] as const;

export default function PromoHomepage() {
  return (
    <div
      className="relative min-h-dvh overflow-hidden font-[family-name:var(--font-poppins)]"
      style={{
        background: "linear-gradient(180deg, #E8F7F5 0%, #F4FBFA 38%, #FFFFFF 100%)",
      }}
    >
      <div className="relative z-10 mx-auto flex min-h-dvh max-w-md flex-col px-4 pb-4 pt-3">
        <header className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <NeerCredLogo variant="header" size={40} />
            <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.22em] text-[#64748B]">
              Dream Big · Borrow Smart
            </p>
          </div>
          <button
            type="button"
            aria-label="Menu"
            className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200/80 bg-white/70 text-[#0B1220]"
          >
            <IconMenu size={20} />
          </button>
        </header>

        <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[#0F766E]/20 bg-[#E6F4F1] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.08em] text-[#0F766E]">
          <IconCheckCircle size={12} className="shrink-0 text-[#0F766E]" />
          Multi-Lender Marketplace · Fully Digital
        </div>

        <h1 className="mt-5 text-[2rem] font-extrabold leading-[1.12] tracking-tight text-[#0B1220]">
          Get a Personal Loan{" "}
          <span className="text-[#0F766E]">
            up to ₹15 Lakh
          </span>
        </h1>

        <Link
          href="/apply"
          className="mt-5 inline-flex w-full items-center justify-center rounded-full bg-[#0B5C56] px-6 py-3.5 text-sm font-bold text-white shadow-md"
        >
          Continue Application →
        </Link>

        <ul className="mt-5 space-y-3">
          {FEATURES.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3 text-[13px] font-semibold leading-snug text-[#0B1220]">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#DDF3EF] text-[#0F766E]">
                <Icon size={16} />
              </span>
              <span className="pt-1.5">{text}</span>
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-6">
          <p className="text-center text-sm font-bold text-[#0B1220]">
            Compare offers. Apply once. Get funded fast.
          </p>
          <p className="mt-2 text-center text-[11px] leading-relaxed text-[#64748B]">
            Compare real offers from multiple lending partners in one simple, fully digital application — no branch
            visits, no paperwork, no waiting.
          </p>
          <Link
            href="/apply"
            className="mt-4 flex w-full items-center justify-center rounded-2xl bg-[#0F766E] py-4 text-base font-bold text-white shadow-lg"
          >
            Get Loan Offers
          </Link>
        </div>
      </div>
    </div>
  );
}
