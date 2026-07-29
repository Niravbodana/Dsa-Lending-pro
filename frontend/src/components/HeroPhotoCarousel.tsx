"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { HERO_CAROUSEL, REFERENCE_HERO } from "@/lib/hero-images";
import { REF } from "@/lib/reference-theme";
import { IconRupee } from "@/components/icons";

type Props = {
  roiRate?: string;
  roiLabel?: string;
};

/** Reference hero image + floating ROI card (bottom-right) */
export function HeroPhotoCarousel({
  roiRate = REFERENCE_HERO.roiRate,
  roiLabel = REFERENCE_HERO.roiLabel,
}: Props) {
  const [active, setActive] = useState(0);
  const slides = HERO_CAROUSEL;

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="relative w-full max-w-[560px]">
      <div className="relative overflow-hidden rounded-[1.75rem] shadow-[0_24px_56px_-20px_rgba(11,18,32,0.28)]">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`transition-opacity duration-[1400ms] ease-in-out ${
              index === active
                ? "relative opacity-100"
                : "pointer-events-none absolute inset-0 opacity-0"
            }`}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              width={960}
              height={1100}
              className="h-[360px] w-full object-cover object-center sm:h-[420px] lg:h-[500px]"
              priority={index === 0}
            />
          </div>
        ))}

        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-white/90 to-transparent sm:w-20"
          aria-hidden
        />

        <div className="absolute bottom-6 right-6 w-[220px] rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.18)]">
          <div
            className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-xl"
            style={{ backgroundColor: REF.tealLight, color: REF.teal }}
          >
            <IconRupee size={18} />
          </div>
          <p className="text-[11px] font-medium text-slate-500">{roiLabel}</p>
          <p className="mt-0.5 text-[1.85rem] font-extrabold leading-none" style={{ color: REF.teal }}>
            {roiRate} <span className="text-lg font-bold">p.a.</span>
          </p>
          <p className="mt-1.5 text-xs font-medium text-slate-500">{REFERENCE_HERO.roiFooter}</p>
        </div>
      </div>
    </div>
  );
}
