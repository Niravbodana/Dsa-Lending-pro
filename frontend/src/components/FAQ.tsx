"use client";

import { useState } from "react";
import { ScrollReveal, ScrollRevealAlternate } from "@/components/ScrollReveal";

const faqs = [
  {
    q: "Does Neer Loan Solutions lend money directly?",
    a: "No. We are a Loan Service Provider (LSP). We connect you with partner banks and NBFCs. The loan is disbursed directly by the partner lender to your bank account.",
  },
  {
    q: "How much loan can I get?",
    a: "Personal loans from ₹50,000 up to ₹5,00,000. The final amount depends on your income and credit profile.",
  },
  {
    q: "How long does approval take?",
    a: "Eligibility check takes 2–5 minutes. Final approval depends on the partner lender — usually same day or within 24 hours.",
  },
  {
    q: "What documents are required?",
    a: "Mobile number, PAN, and basic details to start. Full digital KYC includes Aadhaar OTP and bank verification — no physical paperwork.",
  },
  {
    q: "What are the interest rates?",
    a: "Rates start from 10.99% with partner lenders. You receive multiple offers and choose the best one for you.",
  },
  {
    q: "Is there a prepayment penalty?",
    a: "It depends on the lender. Many partners offer zero foreclosure charges — details are shown clearly in each offer.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24">
      <div className="mx-auto max-w-3xl px-4">
        <ScrollReveal variant="up" className="text-center">
          <h2 className="text-4xl font-black text-slate-900">
            Questions? <span className="text-teal-600">We Have Answers</span>
          </h2>
          <p className="mt-3 text-slate-500">Full transparency — no hidden charges</p>
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
                  <div className="border-t border-slate-100 px-6 py-4 leading-relaxed text-slate-600">
                    {faq.a}
                  </div>
                )}
              </div>
            </ScrollRevealAlternate>
          ))}
        </div>
      </div>
    </section>
  );
}
