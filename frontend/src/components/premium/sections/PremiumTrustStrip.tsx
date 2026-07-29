"use client";

import { Reveal } from "@/components/premium/ui/Reveal";
import { premiumContent } from "@/lib/premium/content";

export function PremiumTrustStrip() {
  const { trustStrip } = premiumContent;

  return (
    <section className="border-y border-slate-200 bg-white py-10">
      <div className="mx-auto max-w-7xl px-4">
        <Reveal>
          <p className="text-center text-sm font-medium text-slate-500">{trustStrip.title}</p>
        </Reveal>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {trustStrip.logos.map((name) => (
            <Reveal key={name} delay={0.05}>
              <span className="text-sm font-bold tracking-wide text-slate-400 transition hover:text-slate-600">
                {name}
              </span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
