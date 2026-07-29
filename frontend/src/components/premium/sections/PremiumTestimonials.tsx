"use client";

import Image from "next/image";
import { Reveal } from "@/components/premium/ui/Reveal";
import { GlassCard } from "@/components/premium/ui/GlassCard";
import { premiumContent } from "@/lib/premium/content";
import { IconStar } from "@/components/icons";

export function PremiumTestimonials() {
  return (
    <section className="bg-slate-50 py-20 md:py-28" id="testimonials">
      <div className="mx-auto max-w-7xl px-4">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-600">Testimonials</p>
          <h2 className="mt-2 text-3xl font-extrabold text-slate-900 md:text-4xl">Loved by professionals across India</h2>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {premiumContent.testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.1}>
              <GlassCard className="flex h-full flex-col p-6">
                <div className="flex gap-1 text-amber-400">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <IconStar key={j} size={14} />
                  ))}
                </div>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-600">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-6 flex items-center gap-3 border-t border-slate-100 pt-4">
                  <Image
                    src={t.image}
                    alt={t.name}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-bold text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
