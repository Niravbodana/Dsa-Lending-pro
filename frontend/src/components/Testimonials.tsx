"use client";

import Image from "next/image";
import { ScrollReveal, ScrollRevealAlternate } from "@/components/ScrollReveal";
import { IconCheckCircle, IconStar } from "@/components/icons";
import { CmsField } from "@/components/cms/CmsField";
import type { SiteConfig } from "@/lib/cms";

export function Testimonials({ config }: { config: SiteConfig }) {
  const section = config.testimonials_section;
  const items = section?.items?.length ? section.items : [];
  if (!items.length) return null;

  const titleParts = section.title.split(section.title_highlight);

  return (
    <section id="testimonials" className="bg-gradient-to-b from-slate-50 to-white py-24">
      <div className="mx-auto max-w-7xl px-4">
        <ScrollReveal variant="up" className="text-center">
          <CmsField
            path="testimonials_section.badge"
            className="rounded-full bg-teal-50 px-4 py-1 text-sm font-bold text-teal-700"
            group="Reviews"
          >
            {section.badge}
          </CmsField>
          <h2 className="mt-4 text-4xl font-black text-slate-900">
            <CmsField path="testimonials_section.title" group="Reviews">{titleParts[0]}</CmsField>
            <span className="text-teal-600">{section.title_highlight}</span>
            {titleParts[1] || ""}
          </h2>
          <CmsField path="testimonials_section.subtitle" as="p" className="mx-auto mt-4 max-w-2xl text-slate-600" group="Reviews">
            {section.subtitle}
          </CmsField>
        </ScrollReveal>
        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {items.map((t, i) => (
            <ScrollRevealAlternate key={t.name} index={i} delay={i * 80}>
              <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-lg transition hover:-translate-y-2 hover:shadow-2xl">
                <div className="relative h-32 bg-gradient-to-br from-neercred-navy to-neercred-teal">
                  <Image
                    src={t.image}
                    alt={`${t.name} from ${t.city}`}
                    width={80}
                    height={80}
                    className="absolute -bottom-10 left-8 h-20 w-20 rounded-2xl object-cover ring-4 ring-white shadow-lg"
                  />
                  <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-teal-700">
                    <IconCheckCircle size={12} />
                    Verified
                  </span>
                </div>
                <div className="flex flex-1 flex-col px-8 pb-8 pt-14">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CmsField path={`testimonials_section.items.${i}.name`} as="p" className="font-bold text-slate-900" group="Reviews">
                        {t.name}
                      </CmsField>
                      <CmsField path={`testimonials_section.items.${i}.city`} as="p" className="text-sm text-slate-500" group="Reviews">
                        {t.city}
                      </CmsField>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-0.5 text-amber-500">
                        <IconStar size={14} className="fill-current" />
                        <CmsField path={`testimonials_section.items.${i}.rating`} className="text-sm font-bold text-slate-800" group="Reviews">
                          {t.rating}
                        </CmsField>
                      </div>
                      <CmsField path={`testimonials_section.items.${i}.date`} as="p" className="text-[11px] text-slate-400" group="Reviews">
                        {t.date}
                      </CmsField>
                    </div>
                  </div>
                  <CmsField path={`testimonials_section.items.${i}.quote`} as="p" className="mt-4 flex-1 leading-relaxed text-slate-600" group="Reviews">
                    &ldquo;{t.quote}&rdquo;
                  </CmsField>
                  <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                    <CmsField
                      path={`testimonials_section.items.${i}.purpose`}
                      className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700"
                      group="Reviews"
                    >
                      {t.purpose}
                    </CmsField>
                    <CmsField path={`testimonials_section.items.${i}.amount`} className="text-sm font-bold text-teal-600" group="Reviews">
                      Loan: {t.amount}
                    </CmsField>
                  </div>
                </div>
              </div>
            </ScrollRevealAlternate>
          ))}
        </div>
      </div>
    </section>
  );
}
