"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { HERO_REVIEWS } from "@/lib/hero-reviews";

type Props = {
  roiRate?: string;
  roiLabel?: string;
};

/** Auto-rotating hero photos — opens with first slide, changes every 4s */
export function HeroPhotoCarousel({ roiRate = "9.99%", roiLabel = "Starting Interest Rate" }: Props) {
  const [active, setActive] = useState(0);
  const reviews = HERO_REVIEWS;

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % reviews.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [reviews.length]);

  return (
    <div className="relative w-full max-w-lg">
      <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-teal-100/80 via-cyan-50 to-amber-50 blur-sm" />
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/60">
        {reviews.map((review, index) => (
          <div
            key={review.id}
            className={`transition-opacity duration-700 ease-in-out ${
              index === active ? "relative opacity-100" : "pointer-events-none absolute inset-0 opacity-0"
            }`}
          >
            <Image
              src={review.image}
              alt={`${review.name} — ${review.role}`}
              width={640}
              height={720}
              className="h-[380px] w-full object-cover object-top sm:h-[440px] lg:h-[480px]"
              priority={index === 0}
            />
          </div>
        ))}

        <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-slate-100 bg-white/95 p-4 shadow-lg backdrop-blur-sm sm:max-w-[240px]">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{roiLabel}</p>
          <p className="text-2xl font-black text-neercred-teal">{roiRate} p.a.</p>
          <p className="text-xs font-semibold text-slate-600">Lowest ROI Guaranteed</p>
        </div>
      </div>

      <div className="mt-4 flex justify-center gap-2">
        {reviews.map((review, index) => (
          <button
            key={review.id}
            type="button"
            onClick={() => setActive(index)}
            aria-label={`Show ${review.name}`}
            className={`h-2 rounded-full transition-all ${
              index === active ? "w-8 bg-neercred-teal" : "w-2 bg-slate-300 hover:bg-slate-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
