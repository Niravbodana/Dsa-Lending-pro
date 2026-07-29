"use client";

import { Reveal } from "@/components/premium/ui/Reveal";
import { premiumContent } from "@/lib/premium/content";
import { IconCheckCircle } from "@/components/icons";

export function PremiumBenefits() {
  return (
    <section className="bg-white py-20 md:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 lg:grid-cols-2">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-600">Benefits</p>
          <h2 className="mt-2 text-3xl font-extrabold text-slate-900 md:text-4xl">Everything you expect from a premium lender marketplace</h2>
          <p className="mt-4 text-slate-600">
            We designed NeerCred for clarity — no jargon, no dark patterns, just regulated offers ranked for your profile.
          </p>
        </Reveal>

        <ul className="grid gap-4 sm:grid-cols-2">
          {premiumContent.benefits.map((b, i) => (
            <Reveal key={b} delay={i * 0.06}>
              <li className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-4 text-sm font-medium text-slate-700">
                <IconCheckCircle size={18} className="mt-0.5 shrink-0 text-teal-600" />
                {b}
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
