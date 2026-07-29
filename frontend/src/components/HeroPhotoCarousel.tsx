"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { HERO_CAROUSEL } from "@/lib/hero-images";

type Props = {
  roiRate?: string;
  roiLabel?: string;
};

/** Auto-rotating Indian lifestyle hero photos — matches reference mockup */
export function HeroPhotoCarousel({
  roiRate = "9.99%",
  roiLabel = "Starting Interest Rate",
}: Props) {
  const [active, setActive] = useState(0);
  const slides = HERO_CAROUSEL;

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="relative w-full max-w-[520px]">
      <div className="relative overflow-hidden rounded-[1.75rem] bg-slate-100 shadow-[0_24px_60px_-20px_rgba(15,23,42,0.22)]">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`transition-opacity duration-1000 ease-in-out ${
              index === active
                ? "relative opacity-100"
                : "pointer-events-none absolute inset-0 opacity-0"
            }`}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              width={720}
              height={860}
              className="h-[360px] w-full object-cover object-center sm:h-[420px] lg:h-[460px]"
              priority={index === 0}
            />
          </div>
        ))}

        <div className="absolute bottom-6 left-6 max-w-[220px] rounded-2xl border border-white/80 bg-white/95 p-4 shadow-lg backdrop-blur-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{roiLabel}</p>
          <p className="text-[1.65rem] font-extrabold leading-tight text-[#00796B]">
            {roiRate} <span className="text-lg">p.a.</span>
          </p>
          <p className="text-xs font-semibold text-slate-600">Lowest ROI Guaranteed</p>
        </div>
      </div>
    </div>
  );
}
