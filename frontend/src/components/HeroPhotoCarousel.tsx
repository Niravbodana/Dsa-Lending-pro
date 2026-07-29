"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { IconStar } from "@/components/icons";
import { HERO_REVIEWS } from "@/lib/hero-reviews";

type Props = {
  fallbackImage?: string;
  fallbackQuote?: string;
  fallbackAuthor?: string;
};

/** Right-column hero photo carousel — syncs with business reviews */
export function HeroPhotoCarousel({ fallbackImage, fallbackQuote, fallbackAuthor }: Props) {
  const [active, setActive] = useState(0);
  const reviews = HERO_REVIEWS;
  const current = reviews[active];

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [reviews.length]);

  return (
    <div className="relative w-full max-w-md">
      <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-amber-400/30 via-teal-400/20 to-cyan-400/30 blur-2xl" />
      <div className="relative overflow-hidden rounded-[2rem] border-4 border-white/25 shadow-2xl ring-1 ring-white/20">
        {reviews.map((review, index) => (
          <div
            key={review.id}
            className={`transition-opacity duration-700 ${
              index === active ? "relative opacity-100" : "pointer-events-none absolute inset-0 opacity-0"
            }`}
          >
            <Image
              src={review.image}
              alt={`${review.name} — ${review.role}`}
              width={600}
              height={750}
              className="h-[460px] w-full object-cover object-top md:h-[520px]"
              priority={index === 0}
            />
          </div>
        ))}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-900/90 to-transparent p-6 pt-24">
          <p className="text-lg font-bold leading-snug text-white transition-opacity duration-500">
            &ldquo;{current?.quote || fallbackQuote}&rdquo;
          </p>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-teal-200">
            <span className="font-semibold text-white">{current?.name}</span>
            <span className="text-teal-300/80">· {current?.role}</span>
            <span className="flex text-amber-400">
              {[1, 2, 3, 4, 5].map((n) => (
                <IconStar key={n} size={12} className="fill-current" />
              ))}
            </span>
          </p>
          <p className="mt-1 text-xs text-teal-300/70">
            {current?.city} · Loan {current?.loan}
          </p>
        </div>
      </div>

      {/* Thumbnail strip */}
      <div className="mt-4 flex justify-center gap-2">
        {reviews.map((review, index) => (
          <button
            key={review.id}
            type="button"
            onClick={() => setActive(index)}
            aria-label={`Show review from ${review.name}`}
            className={`overflow-hidden rounded-xl ring-2 transition ${
              index === active ? "ring-amber-400 scale-110" : "ring-white/30 opacity-70 hover:opacity-100"
            }`}
          >
            <Image
              src={review.image}
              alt=""
              width={44}
              height={44}
              className="h-11 w-11 object-cover"
            />
          </button>
        ))}
      </div>

      {/* Fallback for CMS-only single image (unused when carousel active) */}
      {fallbackImage && fallbackAuthor && !current && (
        <p className="sr-only">{fallbackAuthor}</p>
      )}
    </div>
  );
}
