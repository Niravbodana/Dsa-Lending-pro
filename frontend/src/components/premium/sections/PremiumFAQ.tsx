"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal } from "@/components/premium/ui/Reveal";
import { premiumContent } from "@/lib/premium/content";

export function PremiumFAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="bg-white py-20 md:py-28" id="faq">
      <div className="mx-auto max-w-3xl px-4">
        <Reveal>
          <p className="text-center text-sm font-semibold uppercase tracking-widest text-teal-600">FAQ</p>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-slate-900 md:text-4xl">Questions, answered</h2>
        </Reveal>

        <div className="mt-10 space-y-3">
          {premiumContent.faq.map((item, i) => (
            <Reveal key={item.q} delay={i * 0.06}>
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/50">
                <button
                  type="button"
                  className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold text-slate-900 md:text-base"
                  onClick={() => setOpen(open === i ? null : i)}
                >
                  {item.q}
                  <span className="text-teal-600">{open === i ? "−" : "+"}</span>
                </button>
                <AnimatePresence initial={false}>
                  {open === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <p className="border-t border-slate-200 px-5 py-4 text-sm leading-relaxed text-slate-600">
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
