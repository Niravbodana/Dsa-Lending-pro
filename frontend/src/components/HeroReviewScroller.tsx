"use client";

import Image from "next/image";
import { IconCheckCircle, IconStar } from "@/components/icons";
import { HERO_REVIEWS } from "@/lib/hero-reviews";

/** Left-column vertical auto-scroll — business customer notes */
export function HeroReviewScroller() {
  const loop = [...HERO_REVIEWS, ...HERO_REVIEWS];

  return (
    <div className="mt-8 hidden max-h-[220px] overflow-hidden rounded-2xl border border-white/15 bg-white/5 backdrop-blur-md lg:block">
      <div className="border-b border-white/10 px-4 py-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-amber-300/90">
          Verified business customers
        </p>
      </div>
      <div className="hero-review-scroll relative">
        <div className="hero-review-track space-y-3 p-3">
          {loop.map((review, i) => (
            <div
              key={`${review.id}-${i}`}
              className="flex gap-3 rounded-xl border border-white/10 bg-slate-900/40 p-3"
            >
              <Image
                src={review.image}
                alt={review.name}
                width={48}
                height={48}
                className="h-12 w-12 shrink-0 rounded-lg object-cover ring-2 ring-white/20"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-bold text-white">{review.name}</p>
                  <span className="flex shrink-0 items-center gap-0.5 text-amber-400">
                    <IconStar size={10} className="fill-current" />
                    <span className="text-[10px] font-bold">5.0</span>
                  </span>
                </div>
                <p className="text-[10px] text-teal-200/80">
                  {review.role} · {review.city}
                </p>
                <p className="mt-1 line-clamp-2 text-xs leading-snug text-slate-200/90">
                  &ldquo;{review.quote}&rdquo;
                </p>
                <p className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-teal-300">
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
