"use client";

import Link from "next/link";
import Image from "next/image";
import { ScrollReveal, ScrollRevealAlternate } from "@/components/ScrollReveal";
import type { SiteConfig } from "@/lib/cms";
import { INDIAN_IMAGES } from "@/lib/indian-images";

export function DreamSection({ config }: { config: SiteConfig }) {
  if (!config.sections.dream_section) return null;
  const d = config.dream_section;
  if (!d.cards?.length) return null;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(13,148,136,0.08),transparent_50%)]" />
      <div className="relative mx-auto max-w-7xl px-4">
        <ScrollReveal variant="up" className="mx-auto max-w-3xl text-center">
          <span className="rounded-full bg-teal-100 px-4 py-1 text-sm font-bold text-teal-700">
            WHY NEER LOAN
          </span>
          <h2 className="mt-4 text-4xl font-black text-slate-900 md:text-5xl">{d.title}</h2>
          <p className="mt-4 text-lg text-slate-600">{d.subtitle}</p>
        </ScrollReveal>

        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {d.cards.map((card, i) => (
            <ScrollRevealAlternate key={card.title} index={i} delay={i * 100}>
              <Link
                href="/apply"
                className="group block overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-100 transition hover:-translate-y-2 hover:shadow-2xl"
              >
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    className="object-cover transition duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-2xl font-black text-white">{card.title}</h3>
                    <p className="mt-1 text-sm text-teal-100">{card.desc}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-5">
                  <span className="font-bold text-teal-600">{card.cta}</span>
                  <span className="rounded-full bg-teal-600 px-4 py-2 text-sm font-bold text-white transition group-hover:bg-teal-700">
                    Apply →
                  </span>
                </div>
              </Link>
            </ScrollRevealAlternate>
          ))}
        </div>

        <ScrollReveal variant="fade" className="mt-16 text-center">
          <Link
            href="/apply"
            className="inline-flex rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 px-12 py-5 text-xl font-black text-white shadow-2xl shadow-teal-600/30 transition hover:scale-105"
          >
            Start My Free Eligibility Check →
          </Link>
          <p className="mt-4 text-sm text-slate-500">No impact on credit score · Takes 2 minutes</p>
        </ScrollReveal>
      </div>
    </section>
  );
}

export function EmotionalCtaBand() {
  return (
    <section className="relative overflow-hidden py-20">
      <Image
        src={INDIAN_IMAGES.lifestyle.celebration}
        alt="Happy customers"
        fill
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-teal-900/95 via-teal-800/90 to-slate-900/85" />
      <div className="relative mx-auto max-w-4xl px-4 text-center text-white">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neercred-gold">Institutional-grade lending</p>
        <h2 className="mt-4 text-4xl font-bold md:text-5xl">
          Compare offers with <span className="text-neercred-gold">confidence</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
          Select from regulated partner lenders, review terms transparently, and complete your application entirely online.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/apply"
            className="rounded-2xl bg-gradient-to-r from-neercred-gold to-amber-500 px-10 py-4 text-lg font-bold text-neercred-navy shadow-xl transition hover:brightness-110"
          >
            Start Application
          </Link>
          <Link
            href="/loans"
            className="rounded-2xl border border-white/30 px-8 py-4 text-lg font-semibold text-white transition hover:bg-white/10"
          >
            Explore Loan Types
          </Link>
        </div>
      </div>
    </section>
  );
}

export function MobileStickyCTA() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-neercred-navy/98 p-3 shadow-2xl backdrop-blur md:hidden">
      <Link
        href="/apply"
        className="flex items-center justify-center rounded-xl bg-gradient-to-r from-neercred-gold to-amber-500 py-3.5 text-center text-base font-bold text-neercred-navy"
      >
        Apply for Loan
      </Link>
    </div>
  );
}
