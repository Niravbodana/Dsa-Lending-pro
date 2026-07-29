"use client";

import { Reveal } from "@/components/premium/ui/Reveal";
import { premiumContent } from "@/lib/premium/content";

export function PremiumProcess() {
  return (
    <section className="bg-slate-50 py-20 md:py-28" id="process">
      <div className="mx-auto max-w-7xl px-4">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-600">Process</p>
          <h2 className="mt-2 text-3xl font-extrabold text-slate-900 md:text-4xl">Four steps to disbursal</h2>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-4">
          {premiumContent.process.map((step, i) => (
            <Reveal key={step.step} delay={i * 0.1}>
              <div className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
                <span className="text-4xl font-black text-teal-100">{step.step}</span>
                <h3 className="mt-2 text-lg font-bold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{step.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
