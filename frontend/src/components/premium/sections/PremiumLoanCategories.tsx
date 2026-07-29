"use client";

import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/premium/ui/Reveal";
import { GlassCard } from "@/components/premium/ui/GlassCard";
import { premiumContent } from "@/lib/premium/content";

export function PremiumLoanCategories() {
  return (
    <section className="bg-slate-50 py-20 md:py-28" id="loans">
      <div className="mx-auto max-w-7xl px-4">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-widest text-teal-600">Loan categories</p>
          <h2 className="mt-2 text-3xl font-extrabold text-slate-900 md:text-4xl">Fund every chapter of life</h2>
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {premiumContent.loanCategories.map((loan, i) => (
            <Reveal key={loan.title} delay={i * 0.08}>
              <GlassCard className="group overflow-hidden transition hover:-translate-y-1 hover:shadow-xl">
                <div className="relative h-40 overflow-hidden">
                  <Image
                    src={loan.image}
                    alt={loan.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="(max-width:768px) 100vw, 25vw"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-bold text-slate-900">{loan.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{loan.desc}</p>
                  <p className="mt-3 text-sm font-bold text-teal-600">{loan.rate}</p>
                  <Link href={loan.href} className="mt-4 inline-flex text-sm font-semibold text-slate-900 hover:text-teal-600">
                    Explore →
                  </Link>
                </div>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
