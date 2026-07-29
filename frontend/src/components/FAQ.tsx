"use client";

import { useState } from "react";
import { ScrollReveal, ScrollRevealAlternate } from "@/components/ScrollReveal";
import type { SiteConfig } from "@/lib/cms";

export function FAQ({ config }: { config: SiteConfig }) {
  const [open, setOpen] = useState<number | null>(0);
  if (config.sections?.faq === false) return null;
  const section = config.faq_section;
  const faqs = section?.items?.length ? section.items : [];

  if (!faqs.length) return null;

  const titleParts = section.title.split(section.title_highlight);

  return (
    <section id="faq" className="py-24">
      <div className="mx-auto max-w-3xl px-4">
        <ScrollReveal variant="up" className="text-center">
          <h2 className="text-4xl font-black text-slate-900">
            {titleParts[0]}
            <span className="text-teal-600">{section.title_highlight}</span>
            {titleParts[1] || ""}
          </h2>
          <p className="mt-3 text-slate-500">{section.subtitle}</p>
        </ScrollReveal>
        <div className="mt-12 space-y-3">
          {faqs.map((faq, i) => (
            <ScrollRevealAlternate key={faq.q} index={i} delay={i * 60}>
              <div className="glass-panel overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpen(open === i ? null : i)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left font-bold text-slate-900 transition hover:bg-slate-50"
                >
                  {faq.q}
                  <span className="text-2xl text-teal-600">{open === i ? "−" : "+"}</span>
                </button>
                {open === i && (
                  <div className="border-t border-slate-100 px-6 py-4 leading-relaxed text-slate-600">{faq.a}</div>
                )}
              </div>
            </ScrollRevealAlternate>
          ))}
        </div>
      </div>
    </section>
  );
}
