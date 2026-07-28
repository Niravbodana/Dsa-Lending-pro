"use client";

import { useState } from "react";
import Link from "next/link";

function calculateEmi(principal: number, annualRate: number, tenureMonths: number): number {
  const monthlyRate = annualRate / 12 / 100;
  if (monthlyRate === 0) return Math.ceil(principal / tenureMonths);
  const emi =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
    (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  return Math.ceil(emi);
}

export function EmiCalculator() {
  const [amount, setAmount] = useState(300000);
  const [rate, setRate] = useState(12);
  const [tenure, setTenure] = useState(36);

  const emi = calculateEmi(amount, rate, tenure);
  const totalPayment = emi * tenure;
  const totalInterest = totalPayment - amount;

  return (
    <section id="emi-calculator" className="bg-gradient-to-b from-teal-50 to-white py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center">
          <span className="rounded-full bg-teal-100 px-4 py-1 text-sm font-bold text-teal-700">
            FREE TOOL
          </span>
          <h2 className="mt-4 text-4xl font-black text-slate-900">
            EMI Calculator — <span className="text-teal-600">Pehle Jaano, Phir Lo</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-500">
            Apni EMI calculate karo before applying. No hidden surprises!
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-8 lg:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
            <div className="space-y-8">
              <div>
                <div className="flex justify-between">
                  <label className="font-semibold text-slate-700">Loan Amount</label>
                  <span className="font-bold text-teal-600">
                    ₹{amount.toLocaleString("en-IN")}
                  </span>
                </div>
                <input
                  type="range"
                  min={50000}
                  max={500000}
                  step={10000}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="mt-3 w-full accent-teal-600"
                />
              </div>
              <div>
                <div className="flex justify-between">
                  <label className="font-semibold text-slate-700">Interest Rate (% p.a.)</label>
                  <span className="font-bold text-teal-600">{rate}%</span>
                </div>
                <input
                  type="range"
                  min={8}
                  max={24}
                  step={0.5}
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value))}
                  className="mt-3 w-full accent-teal-600"
                />
              </div>
              <div>
                <div className="flex justify-between">
                  <label className="font-semibold text-slate-700">Tenure (months)</label>
                  <span className="font-bold text-teal-600">{tenure} months</span>
                </div>
                <input
                  type="range"
                  min={6}
                  max={60}
                  step={6}
                  value={tenure}
                  onChange={(e) => setTenure(Number(e.target.value))}
                  className="mt-3 w-full accent-teal-600"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center rounded-3xl bg-gradient-to-br from-teal-600 to-cyan-600 p-8 text-white shadow-2xl">
            <p className="text-sm font-medium text-teal-100">Your Monthly EMI</p>
            <p className="mt-2 text-5xl font-black">
              ₹{emi.toLocaleString("en-IN")}
              <span className="text-lg font-normal text-teal-100">/month</span>
            </p>
            <div className="mt-8 space-y-4">
              <div className="flex justify-between border-b border-white/20 pb-3">
                <span className="text-teal-100">Principal Amount</span>
                <span className="font-bold">₹{amount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between border-b border-white/20 pb-3">
                <span className="text-teal-100">Total Interest</span>
                <span className="font-bold">₹{totalInterest.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-teal-100">Total Payment</span>
                <span className="font-bold">₹{totalPayment.toLocaleString("en-IN")}</span>
              </div>
            </div>
            <Link
              href="/apply"
              className="mt-8 block rounded-2xl bg-amber-400 py-4 text-center font-extrabold text-slate-900 transition hover:bg-amber-300"
            >
              Itni EMI Mein Loan Lo →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
