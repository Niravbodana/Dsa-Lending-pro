import Link from "next/link";
import { ScrollReveal, ScrollRevealAlternate } from "@/components/ScrollReveal";
import { CmsField } from "@/components/cms/CmsField";
import {
  IconCpu,
  IconShield,
  IconTarget,
  IconChart,
  IconBolt,
  IconCheck,
  IconArrowRight,
} from "@/components/icons";
import type { SiteConfig } from "@/lib/cms";

const PHASE_ICONS = [IconTarget, IconChart, IconShield, IconBolt, IconCpu, IconChart];

export function BusinessModelFlow({ config }: { config: SiteConfig }) {
  const section = config.business_model;
  const steps = section.steps?.length ? section.steps : [];

  return (
    <section className="border-y border-slate-200 bg-white py-20">
      <div className="mx-auto max-w-7xl px-4">
        <ScrollReveal variant="up" className="text-center">
          <CmsField
            path="business_model.badge"
            as="p"
            className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600"
            group="Business Model"
          >
            {section.badge}
          </CmsField>
          <CmsField
            path="business_model.title"
            as="h2"
            className="mt-3 text-3xl font-black text-slate-900 md:text-4xl"
            group="Business Model"
          >
            {section.title}
          </CmsField>
          <CmsField
            path="business_model.subtitle"
            as="p"
            className="mx-auto mt-3 max-w-2xl text-slate-500"
            group="Business Model"
          >
            {section.subtitle}
          </CmsField>
        </ScrollReveal>
        <div className="mt-14 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          {steps.map((s, i) => (
            <ScrollRevealAlternate key={s.step} index={i} delay={i * 80}>
              <div className="relative rounded-2xl border border-slate-100 bg-slate-50 p-5 transition hover:border-teal-200 hover:shadow-lg">
                <CmsField
                  path={`business_model.steps.${i}.step`}
                  as="span"
                  className="text-xs font-bold text-teal-600"
                  group="Business Model"
                >
                  {s.step}
                </CmsField>
                <CmsField
                  path={`business_model.steps.${i}.title`}
                  as="h3"
                  className="mt-2 font-bold text-slate-900"
                  group="Business Model"
                >
                  {s.title}
                </CmsField>
                <CmsField
                  path={`business_model.steps.${i}.desc`}
                  as="p"
                  className="mt-1 text-xs leading-relaxed text-slate-500"
                  group="Business Model"
                >
                  {s.desc}
                </CmsField>
              </div>
            </ScrollRevealAlternate>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PlatformCapabilities({ config }: { config: SiteConfig }) {
  const section = config.platform;
  const phases = section.phases?.length ? section.phases : [];

  return (
    <section className="bg-slate-950 py-24 text-white">
      <div className="mx-auto max-w-7xl px-4">
        <ScrollReveal variant="up" className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <CmsField
              path="platform.badge"
              as="p"
              className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400"
              group="Platform"
            >
              {section.badge}
            </CmsField>
            <CmsField
              path="platform.title"
              as="h2"
              className="mt-3 text-3xl font-black md:text-4xl"
              group="Platform"
            >
              {section.title}
            </CmsField>
            <CmsField
              path="platform.subtitle"
              as="p"
              className="mt-3 max-w-xl text-slate-400"
              group="Platform"
            >
              {section.subtitle}
            </CmsField>
          </div>
          <Link
            href="/platform"
            className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold transition hover:bg-white/10"
          >
            <CmsField path="platform.cta" group="Platform">
              {section.cta}
            </CmsField>{" "}
            <IconArrowRight size={16} />
          </Link>
        </ScrollReveal>
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {phases.map((c, i) => {
            const Icon = PHASE_ICONS[i % PHASE_ICONS.length];
            return (
              <ScrollRevealAlternate key={c.phase} index={i} delay={i * 80}>
                <div className="h-full rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/20 text-teal-300">
                      <Icon size={20} />
                    </div>
                    <div>
                      <CmsField
                        path={`platform.phases.${i}.phase`}
                        as="p"
                        className="text-xs font-bold text-amber-400"
                        group="Platform"
                      >
                        {c.phase}
                      </CmsField>
                      <CmsField path={`platform.phases.${i}.title`} as="h3" className="font-bold" group="Platform">
                        {c.title}
                      </CmsField>
                    </div>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {c.items.map((item, j) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-slate-400">
                        <IconCheck size={14} className="shrink-0 text-teal-400" />
                        <CmsField path={`platform.phases.${i}.items.${j}`} group="Platform">
                          {item}
                        </CmsField>
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollRevealAlternate>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function PremiumFeaturesGrid({ config }: { config: SiteConfig }) {
  const section = config.premium_features;
  const items = section.items?.length ? section.items : [];

  return (
    <section className="bg-gradient-to-b from-white to-slate-50 py-24">
      <div className="mx-auto max-w-7xl px-4">
        <ScrollReveal variant="up" className="text-center">
          <CmsField
            path="premium_features.badge"
            as="p"
            className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600"
            group="Premium Features"
          >
            {section.badge}
          </CmsField>
          <CmsField
            path="premium_features.title"
            as="h2"
            className="mt-3 text-3xl font-black text-slate-900 md:text-4xl"
            group="Premium Features"
          >
            {section.title}
          </CmsField>
        </ScrollReveal>
        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((f, i) => (
            <ScrollRevealAlternate key={f.title} index={i} delay={i * 70}>
              <div className="h-full rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                <div className="h-1 w-12 rounded-full bg-gradient-to-r from-teal-500 to-amber-400" />
                <CmsField
                  path={`premium_features.items.${i}.title`}
                  as="h3"
                  className="mt-5 text-lg font-bold text-slate-900"
                  group="Premium Features"
                >
                  {f.title}
                </CmsField>
                <CmsField
                  path={`premium_features.items.${i}.desc`}
                  as="p"
                  className="mt-2 text-sm leading-relaxed text-slate-500"
                  group="Premium Features"
                >
                  {f.desc}
                </CmsField>
              </div>
            </ScrollRevealAlternate>
          ))}
        </div>
      </div>
    </section>
  );
}

export function MetricsTicker({ config }: { config: SiteConfig }) {
  if (config.sections?.metrics_ticker === false) return null;
  const metrics = config.metrics_ticker?.length ? config.metrics_ticker : [];

  if (!metrics.length) return null;

  return (
    <section className="border-b border-neercred-gold/20 bg-neercred-navy py-8">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-4 px-4 sm:gap-x-14">
        {metrics.map((m, i) => (
          <ScrollRevealAlternate key={m.label} index={i} delay={i * 50}>
            <div className="text-center">
              <CmsField
                path={`metrics_ticker.${i}.value`}
                className="text-2xl font-bold text-neercred-gold"
                group="Metrics"
              >
                {m.value}
              </CmsField>
              <CmsField
                path={`metrics_ticker.${i}.label`}
                as="p"
                className="mt-0.5 text-[11px] uppercase tracking-widest text-slate-400"
                group="Metrics"
              >
                {m.label}
              </CmsField>
            </div>
          </ScrollRevealAlternate>
        ))}
      </div>
    </section>
  );
}
