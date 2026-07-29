"use client";

import Link from "next/link";
import { Reveal } from "@/components/premium/ui/Reveal";
import { GradientOrb } from "@/components/premium/ui/GradientOrb";
import { premiumContent } from "@/lib/premium/content";

export function PremiumCTA() {
  const { cta } = premiumContent;

  return (
    <section className="relative overflow-hidden bg-[#0A0F1C] py-20 md:py-28">
      <GradientOrb className="left-1/2 top-0 h-96 w-96 -translate-x-1/2" />
      <div className="relative mx-auto max-w-3xl px-4 text-center">
        <Reveal>
          <h2 className="text-3xl font-extrabold text-white md:text-4xl">{cta.title}</h2>
          <p className="mt-4 text-lg text-slate-400">{cta.desc}</p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href={cta.primary.href}
              className="rounded-full bg-gradient-to-r from-teal-400 to-emerald-500 px-10 py-4 text-base font-bold text-[#0A0F1C] shadow-lg shadow-teal-500/30 transition hover:brightness-110"
            >
              {cta.primary.label}
            </Link>
            <Link
              href={cta.secondary.href}
              className="rounded-full border border-white/25 px-10 py-4 text-base font-semibold text-white transition hover:bg-white/10"
            >
              {cta.secondary.label}
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
