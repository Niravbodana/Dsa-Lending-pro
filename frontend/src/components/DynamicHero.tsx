"use client";

import Link from "next/link";
import Image from "next/image";
import { ScrollReveal } from "@/components/ScrollReveal";
import {
  IconRupee,
  IconChart,
  IconBolt,
  IconUsers,
  IconCheckCircle,
  IconLock,
  IconShield,
  IconBank,
  IconStar,
} from "@/components/icons";
import type { SiteConfig } from "@/lib/cms";

const STAT_ICONS = [IconRupee, IconChart, IconBolt, IconUsers];

type Props = { config: SiteConfig };

export function DynamicHero({ config }: Props) {
  const h = config.hero;
  const stats = config.stats;

  return (
    <section className="gradient-hero relative min-h-[95vh] overflow-hidden text-white">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&h=1080&fit=crop')] bg-cover bg-center opacity-[0.07]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(251,191,36,0.2)_0%,_transparent_55%)]" />
      <div className="absolute -left-32 top-20 h-[28rem] w-[28rem] rounded-full bg-amber-400/10 blur-3xl" />
      <div className="absolute -right-32 bottom-10 h-[28rem] w-[28rem] rounded-full bg-cyan-400/15 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 lg:grid-cols-2 lg:py-24">
        <ScrollReveal variant="left">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-400/15 px-4 py-2 text-sm font-semibold text-amber-100 shadow-lg shadow-amber-900/20">
            <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
            {h.badge}
          </div>

          <h1 className="mt-8 text-4xl font-black leading-[1.05] tracking-tight md:text-5xl lg:text-[3.5rem]">
            {h.headline_line1}
            <br />
            <span className="text-gradient-gold">{h.headline_highlight}</span>
            <br />
            <span className="mt-2 block text-2xl font-bold text-teal-50 md:text-3xl lg:text-4xl">
              {h.headline_sub}
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-teal-50/95">{h.description}</p>

          <ul className="mt-6 space-y-3">
            {h.bullet_points.map((d) => (
              <li key={d} className="flex items-start gap-3 text-sm font-medium text-white/90 md:text-base">
                <IconCheckCircle size={18} className="mt-0.5 shrink-0 text-amber-400" />
                {d}
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/apply"
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 px-10 py-4 text-lg font-extrabold text-slate-900 shadow-2xl shadow-amber-500/40 transition hover:scale-[1.03] hover:shadow-amber-500/50"
            >
              <span className="relative z-10">{h.cta_primary}</span>
              <span className="absolute inset-0 -translate-x-full bg-white/30 transition group-hover:translate-x-full duration-700" />
            </Link>
            <Link
              href="/rates"
              className="rounded-2xl border-2 border-white/40 bg-white/10 px-8 py-4 text-lg font-bold backdrop-blur transition hover:bg-white/20"
            >
              {h.cta_secondary}
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((s, i) => {
              const Icon = STAT_ICONS[i] || IconRupee;
              return (
                <ScrollReveal key={s.label} variant="up" delay={i * 80}>
                  <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md transition hover:bg-white/15 hover:scale-105">
                    <Icon size={20} className="text-amber-300" />
                    <p className="mt-2 text-2xl font-black">{s.value}</p>
                    <p className="text-xs text-teal-100/80">{s.label}</p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </ScrollReveal>

        <ScrollReveal variant="right" delay={150} className="relative flex justify-center lg:justify-end">
          <div className="relative w-full max-w-md">
            <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-amber-400/30 via-teal-400/20 to-cyan-400/30 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border-4 border-white/25 shadow-2xl ring-1 ring-white/20">
              <Image
                src={h.image_url}
                alt="Happy Neer Loan customer"
                width={600}
                height={750}
                className="h-[460px] w-full object-cover object-top md:h-[520px]"
                priority
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-900/85 to-transparent p-6 pt-20">
                <p className="text-lg font-bold leading-snug text-white">&ldquo;{h.testimonial_quote}&rdquo;</p>
                <p className="mt-2 flex items-center gap-2 text-sm text-teal-200">
                  — {h.testimonial_author}
                  <span className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <IconStar key={n} size={12} className="fill-current" />
                    ))}
                  </span>
                </p>
              </div>
            </div>
            <div className="glass-card animate-float absolute -bottom-4 -left-4 max-w-[240px] rounded-2xl p-4 shadow-2xl lg:-left-8">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <IconCheckCircle size={22} />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">{h.approval_card_label}</p>
                  <p className="text-xl font-black text-emerald-600">{h.approval_card_amount}</p>
                </div>
              </div>
            </div>
            <div className="absolute -right-2 top-6 rotate-3 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 px-5 py-4 text-center font-black text-slate-900 shadow-2xl lg:-right-6">
              <p className="text-3xl leading-none">{h.roi_badge}</p>
              <p className="mt-1 text-[10px] uppercase tracking-widest">{h.roi_badge_label}</p>
            </div>
          </div>
        </ScrollReveal>
      </div>

      <div className="relative border-t border-white/10 bg-black/25 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-6 px-4 py-4 text-sm text-teal-100/90 md:gap-10">
          <span className="flex items-center gap-2"><IconLock size={14} /> 256-bit Bank Encryption</span>
          <Link href="/compliance" className="flex items-center gap-2 transition hover:text-white">
            <IconShield size={14} /> RBI LSP Compliant
          </Link>
          <span className="flex items-center gap-2"><IconBank size={14} /> 15+ Partner Lenders</span>
          <span className="flex items-center gap-2">
            <IconStar size={14} className="text-amber-400" /> 4.9/5 Customer Rating
          </span>
        </div>
      </div>
    </section>
  );
}
