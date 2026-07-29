"use client";

import { Reveal } from "@/components/premium/ui/Reveal";
import { GlassCard } from "@/components/premium/ui/GlassCard";
import { premiumContent } from "@/lib/premium/content";
import { IconShield, IconCpu, IconSmartphone, IconChart } from "@/components/icons";

const ICONS = { shield: IconShield, cpu: IconCpu, phone: IconSmartphone, chart: IconChart };

export function PremiumWhyChoose() {
  return (
    <section className="relative overflow-hidden bg-[#0A0F1C] py-20 text-white md:py-28">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(20,184,166,0.12),transparent_55%)]" />
      <div className="relative mx-auto max-w-7xl px-4">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-400">Why NeerCred</p>
          <h2 className="mt-2 text-3xl font-extrabold md:text-4xl">Built for modern Indian borrowers</h2>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {premiumContent.whyChoose.map((item, i) => {
            const Icon = ICONS[item.icon as keyof typeof ICONS];
            return (
              <Reveal key={item.title} delay={i * 0.08}>
                <GlassCard dark className="p-6 transition hover:border-teal-400/30">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-400/15 text-teal-300">
                    <Icon size={22} />
                  </span>
                  <h3 className="mt-4 text-xl font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.desc}</p>
                </GlassCard>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
