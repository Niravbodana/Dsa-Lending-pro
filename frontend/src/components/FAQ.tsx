"use client";

import { useState } from "react";

const faqs = [
  {
    q: "Kya DSA Lending Pro khud loan deta hai?",
    a: "Nahi! Hum ek Loan Service Provider (LSP) hain. Hum aapko partner banks aur NBFCs se connect karte hain. Loan partner lender deta hai, seedha aapke bank account mein.",
  },
  {
    q: "Kitna loan mil sakta hai?",
    a: "₹50,000 se ₹5,00,000 tak personal loan. Aapki income aur credit profile ke basis pe amount decide hota hai.",
  },
  {
    q: "Approval mein kitna time lagta hai?",
    a: "Eligibility check 2-5 minute mein. Final approval partner lender ke process pe depend karta hai — usually same day ya 24 hours.",
  },
  {
    q: "Kya documents chahiye?",
    a: "Phase 1 mein sirf mobile, PAN aur basic details. Phase 3 mein eKYC (Aadhaar OTP) aur bank verification add hoga — sab digital.",
  },
  {
    q: "Interest rate kitna hai?",
    a: "10.99% se start hota hai partner lenders ke offers mein. Aapko multiple offers dikhte hain — aap sabse best choose karte ho.",
  },
  {
    q: "Kya pre-payment penalty hai?",
    a: "Depends on lender. Kai partners zero foreclosure charges offer karte hain — offer details mein clearly dikhega.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-slate-50 py-24">
      <div className="mx-auto max-w-3xl px-4">
        <div className="text-center">
          <h2 className="text-4xl font-black text-slate-900">
            Sawal Hai? <span className="text-teal-600">Jawab Hai!</span>
          </h2>
          <p className="mt-3 text-slate-500">Sab kuch clear — koi chhupa charge nahi</p>
        </div>
        <div className="mt-12 space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between px-6 py-5 text-left font-bold text-slate-900 transition hover:bg-slate-50"
              >
                {faq.q}
                <span className="text-2xl text-teal-600">{open === i ? "−" : "+"}</span>
              </button>
              {open === i && (
                <div className="border-t border-slate-100 px-6 py-4 text-slate-600 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
