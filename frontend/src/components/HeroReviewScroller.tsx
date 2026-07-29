"use client";

import Image from "next/image";
import { IconCheckCircle, IconStar } from "@/components/icons";
import { HERO_REVIEWS } from "@/lib/hero-reviews";

type Props = { variant?: "dark" | "light" };

/** Vertical auto-scroll reviews — left column on desktop, below hero on mobile */
export function HeroReviewScroller({ variant = "light" }: Props) {
  const loop = [...HERO_REVIEWS, ...HERO_REVIEWS];
  const isLight = variant === "light";

  return (
    <div
      className={`mt-8 max-h-[200px] overflow-hidden rounded-2xl border lg:max-h-[220px] ${
        isLight
          ? "border-slate-200 bg-slate-50 shadow-sm"
          : "hidden border-white/15 bg-white/5 backdrop-blur-md lg:block"
      }`}
    >
      <div className={`border-b px-4 py-2 ${isLight ? "border-slate-200 bg-white" : "border-white/10"}`}>
        <p
          className={`text-[10px] font-bold uppercase tracking-widest ${
            isLight ? "text-neercred-teal" : "text-amber-300/90"
          }`}
        >
          Verified customer reviews
        </p>
      </div>
      <div className="hero-review-scroll relative">
        <div className="hero-review-track space-y-3 p-3">
          {loop.map((review, i) => (
            <div
              key={`${review.id}-${i}`}
              className={`flex gap-3 rounded-xl border p-3 ${
                isLight
                  ? "border-slate-100 bg-white"
                  : "border-white/10 bg-slate-900/40"
              }`}
            >
              <Image
                src={review.image}
                alt={review.name}
                width={48}
                height={48}
                className="h-12 w-12 shrink-0 rounded-lg object-cover ring-2 ring-teal-100"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className={`truncate text-sm font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
                    {review.name}
                  </p>
                  <span className="flex shrink-0 items-center gap-0.5 text-amber-500">
                    <IconStar size={10} className="fill-current" />
                    <span className="text-[10px] font-bold">5.0</span>
                  </span>
                </div>
                <p className={`text-[10px] ${isLight ? "text-slate-500" : "text-teal-200/80"}`}>
                  {review.role} · {review.city}
                </p>
                <p
                  className={`mt-1 line-clamp-2 text-xs leading-snug ${
                    isLight ? "text-slate-600" : "text-slate-200/90"
                  }`}
                >
                  &ldquo;{review.quote}&rdquo;
                </p>
                <p
                  className={`mt-1 flex items-center gap-1 text-[10px] font-semibold ${
                    isLight ? "text-neercred-teal" : "text-teal-300"
                  }`}
                >
                  <IconCheckCircle size={10} />
                  Loan {review.loan}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
