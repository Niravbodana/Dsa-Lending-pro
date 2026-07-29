"use client";

import Link from "next/link";
import { Reveal } from "@/components/premium/ui/Reveal";
import { GlassCard } from "@/components/premium/ui/GlassCard";
import { premiumContent } from "@/lib/premium/content";

export function PremiumFeatures() {
  return (
    <section className="bg-white py-20 md:py-28" id="features">
      <div className="mx-auto max-w-7xl px-4">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-600">Features</p>
          <h2 className="mt-2 text-3xl font-extrabold text-slate-900 md:text-4xl">Tools that power smarter borrowing</h2>
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {premiumContent.features.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.08}>
              <Link href={f.href}>
                <GlassCard className="h-full p-6 transition hover:-translate-y-1 hover:border-teal-200">
                  <h3 className="text-lg font-bold text-slate-900">{f.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{f.desc}</p>
                  <span className="mt-4 inline-block text-sm font-semibold text-teal-600">Open →</span>
                </GlassCard>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
