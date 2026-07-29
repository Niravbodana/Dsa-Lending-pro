"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { premiumContent } from "@/lib/premium/content";
import { Reveal } from "@/components/premium/ui/Reveal";
import { GlassCard } from "@/components/premium/ui/GlassCard";
import { GradientOrb } from "@/components/premium/ui/GradientOrb";
import { AnimatedCounter } from "@/components/premium/ui/AnimatedCounter";
import { IconBolt, IconCheckCircle, IconShield } from "@/components/icons";

const TRUST_ICONS = { bolt: IconBolt, shield: IconShield, check: IconCheckCircle };

export function PremiumHero() {
  const { hero } = premiumContent;
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(useTransform(mx, [-0.5, 0.5], [-12, 12]), { stiffness: 120, damping: 20 });
  const sy = useSpring(useTransform(my, [-0.5, 0.5], [-8, 8]), { stiffness: 120, damping: 20 });

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  }

  return (
    <section
      ref={ref}
      onMouseMove={onMove}
      className="relative min-h-screen overflow-hidden bg-[#0A0F1C] pt-24 text-white"
    >
      <GradientOrb className="-left-32 top-20 h-96 w-96" />
      <GradientOrb className="-right-24 bottom-0 h-80 w-80" color="rgba(201,169,98,0.2)" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-12 lg:grid-cols-2 lg:gap-16 lg:py-20">
        <div>
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-teal-200">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
              {hero.badge}
            </span>
          </Reveal>

          <Reveal delay={0.08}>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.08] tracking-tight md:text-5xl lg:text-[3.4rem]">
              <span className="text-white">{hero.headline[0]}</span>{" "}
              <span className="bg-gradient-to-r from-teal-300 to-emerald-400 bg-clip-text text-transparent">
                {hero.headline[1]}
              </span>
            </h1>
          </Reveal>

          <Reveal delay={0.14}>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-400 md:text-lg">{hero.description}</p>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="mt-8 flex flex-wrap gap-4">
              {hero.trust.map((t) => {
                const Icon = TRUST_ICONS[t.icon as keyof typeof TRUST_ICONS];
                return (
                  <span
                    key={t.label}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200"
                  >
                    <Icon size={14} className="text-teal-400" />
                    {t.label}
                  </span>
                );
              })}
            </div>
          </Reveal>

          <Reveal delay={0.26}>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href={hero.ctaPrimary.href}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-400 to-emerald-500 px-8 py-3.5 text-base font-bold text-[#0A0F1C] shadow-lg shadow-teal-500/30 transition hover:brightness-110"
              >
                {hero.ctaPrimary.label}
                <span aria-hidden>→</span>
              </Link>
              <Link
                href={hero.ctaSecondary.href}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-7 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/10"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/40 text-[9px]">▶</span>
                {hero.ctaSecondary.label}
              </Link>
            </div>
          </Reveal>

          <Reveal delay={0.32}>
            <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {hero.stats.map((s) => (
                <GlassCard key={s.label} dark className="p-4">
                  <p className="text-xl font-bold text-white md:text-2xl">
                    <AnimatedCounter
                      value={s.value}
                      prefix={s.prefix}
                      suffix={s.suffix}
                      decimals={"decimals" in s ? s.decimals : 0}
                    />
                  </p>
                  <p className="mt-1 text-[11px] text-slate-400">{s.label}</p>
                </GlassCard>
              ))}
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.15} className="relative flex justify-center lg:justify-end">
          <motion.div style={{ x: sx, y: sy }} className="relative w-full max-w-lg">
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl">
              <Image
                src={hero.heroImage}
                alt={hero.heroAlt}
                width={900}
                height={1100}
                className="h-[380px] w-full object-cover sm:h-[440px] lg:h-[520px]"
                priority
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0A0F1C]/60 via-transparent to-transparent" />
            </div>

            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-4 right-4 sm:right-6"
            >
              <GlassCard dark className="w-[210px] p-4">
                <p className="text-[11px] font-medium text-slate-400">{hero.rateCard.label}</p>
                <p className="mt-1 text-3xl font-extrabold text-teal-300">{hero.rateCard.rate}</p>
                <p className="mt-1 text-xs text-slate-500">{hero.rateCard.note}</p>
              </GlassCard>
            </motion.div>

            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -left-2 top-8 hidden sm:block"
            >
              <GlassCard dark className="px-4 py-3">
                <p className="text-xs font-semibold text-teal-300">✓ KYC verified</p>
                <p className="text-[10px] text-slate-500">256-bit encrypted</p>
              </GlassCard>
            </motion.div>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}
