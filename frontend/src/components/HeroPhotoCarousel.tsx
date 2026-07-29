"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { HERO_CAROUSEL, REFERENCE_HERO } from "@/lib/hero-images";
import { IconCheckCircle } from "@/components/icons";

type Props = {
  roiRate?: string;
  roiLabel?: string;
};

/** Reference hero — Indian photos auto-fade, ROI card bottom-right */
export function HeroPhotoCarousel({
  roiRate = REFERENCE_HERO.roiRate,
  roiLabel = REFERENCE_HERO.roiLabel,
}: Props) {
  const [active, setActive] = useState(0);
  const slides = HERO_CAROUSEL;

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="relative w-full max-w-[540px]">
      <div className="relative overflow-hidden rounded-[2rem] bg-slate-100 shadow-[0_28px_64px_-24px_rgba(0,75,77,0.35)]">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`transition-opacity duration-[1200ms] ease-in-out ${
              index === active
                ? "relative opacity-100"
                : "pointer-events-none absolute inset-0 opacity-0"
            }`}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              width={900}
              height={1050}
              className="h-[340px] w-full object-cover object-center sm:h-[400px] lg:h-[480px]"
              priority={index === 0}
            />
          </div>
        ))}

        <div className="absolute bottom-5 right-5 w-[210px] rounded-2xl border border-slate-100 bg-white p-4 shadow-xl">
          <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-[#E8F8F5] text-[#2DB2A2]">
            <IconCheckCircle size={18} />
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{roiLabel}</p>
          <p className="mt-0.5 text-[1.75rem] font-bold leading-none text-[#004B4D]">
            {roiRate} <span className="text-base font-semibold">p.a.</span>
          </p>
          <p className="mt-1 text-xs font-medium text-slate-600">{REFERENCE_HERO.roiFooter}</p>
        </div>
      </div>
    </div>
  );
}
