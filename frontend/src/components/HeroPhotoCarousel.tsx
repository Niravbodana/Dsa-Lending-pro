"use client";

import { REFERENCE_HERO } from "@/lib/hero-images";
import { REF } from "@/lib/reference-theme";
import { IconRupee } from "@/components/icons";

type Props = {
  roiRate?: string;
  roiLabel?: string;
  className?: string;
};

/** Floating ROI card over hero background */
export function HeroRoiCard({
  roiRate = REFERENCE_HERO.roiRate,
  roiLabel = REFERENCE_HERO.roiLabel,
  className = "",
}: Props) {
  return (
    <div className={`w-[220px] ${className}`}>
      <div className="glass-panel w-[220px] rounded-2xl p-4">
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
  );
}

/** @deprecated Use HeroRoiCard — hero image is now section background */
export function HeroPhotoCarousel(props: Props) {
  return <HeroRoiCard {...props} />;
}
