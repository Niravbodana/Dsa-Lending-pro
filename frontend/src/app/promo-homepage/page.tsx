"use client";

import Image from "next/image";
import Link from "next/link";
import { IconBolt, IconCheckCircle, IconClock, IconShield } from "@/components/icons";
import { HERO_WEDDING_SRC } from "@/lib/hero-images";

const FEATURES = [
  { icon: IconBolt, text: "Instant offers from top lending partners" },
  { icon: IconShield, text: "100% secure and digital process" },
  { icon: IconClock, text: "Quick eligibility in minutes" },
] as const;

export default function PromoHomepage() {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-[#F8FAFC]">
      <div className="absolute inset-0">
        <Image
          src={HERO_WEDDING_SRC}
          alt="Indian couple celebrating"
          fill
          priority
          className="object-cover object-[72%_28%]"
          sizes="100vw"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(224,242,254,0.93) 28%, rgba(255,255,255,0.78) 44%, rgba(255,255,255,0.12) 100%)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white/25 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-dvh max-w-md flex-col px-4 pb-6 pt-3">
        <div className="mb-3 flex items-start justify-between gap-2">
          <Link href="/" className="shrink-0">
            <Image src="/neercred-logo-header.svg" alt="NeerCred" width={168} height={56} priority className="h-11 w-auto" />
          </Link>
          <Link
            href="/apply"
            className="shrink-0 rounded-full px-3 py-2 text-[11px] font-bold text-white shadow-md"
            style={{ background: "linear-gradient(135deg, #0B1220, #134E4A, #0F766E)" }}
          >
            Check Eligibility →
          </Link>
        </div>

        <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-[#0F766E]/25 bg-white/85 px-3 py-1.5 text-[9px] font-bold uppercase tracking-wide text-[#0F766E]">
          <IconCheckCircle size={12} className="shrink-0 text-[#0F766E]" />
          Digital Lending Aggregator
        </div>

        <h1 className="mt-4 text-[2rem] font-extrabold leading-[1.12] tracking-tight text-[#0B1220]">
          Dream Big.{" "}
          <span className="text-[#0F766E]">Borrow Smart.</span>
        </h1>
        <p className="mt-2 text-base font-bold text-[#0B1220]">Personal loans up to ₹15,00,000</p>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Compare curated offers from HDFC, ICICI, Bajaj and more — one transparent platform, zero branch visits.
        </p>

        <ul className="mt-4 space-y-2.5">
          {FEATURES.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-2.5 text-sm font-semibold text-[#0B1220]">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E6F4F1] text-[#0F766E]">
                <Icon size={14} />
              </span>
              {text}
            </li>
          ))}
        </ul>

        <div className="mt-4 space-y-2">
          <Link
            href="/apply"
            className="flex w-full items-center justify-center rounded-2xl py-4 text-sm font-bold text-white shadow-lg"
            style={{ background: "linear-gradient(135deg, #0B1220, #134E4A, #0F766E)" }}
          >
            Get My Loan Offer →
          </Link>
          <button
            type="button"
            className="flex w-full items-center justify-center rounded-2xl border border-slate-200/90 bg-white/90 py-3.5 text-sm font-semibold text-[#0B1220]"
          >
            View Interest Rates
          </button>
        </div>

        <p className="mt-3 text-center text-[10px] text-slate-500">Rates from 10.99% p.a. · indicative only</p>
        <p className="mt-auto pt-4 text-center text-[10px] font-medium text-slate-400">
          Purity & Trust · Built on security and transparency
        </p>
      </div>
    </div>
  );
}
