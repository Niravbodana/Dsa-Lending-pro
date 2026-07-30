"use client";

import { REFERENCE_HERO } from "@/lib/hero-images";
import { REF } from "@/lib/reference-theme";
import { IconRupee } from "@/components/icons";
import { CmsField } from "@/components/cms/CmsField";

type Props = {
  roiRate?: string;
  roiLabel?: string;
  roiPath?: string;
  className?: string;
};

/** Premium floating ROI card — single overlay on hero photo */
export function HeroRoiCard({
  roiRate = REFERENCE_HERO.roiRate,
  roiLabel = REFERENCE_HERO.roiLabel,
  roiPath = "hero.roi_badge",
  className = "",
}: Props) {
  return (
    <div className={`w-[230px] ${className}`}>
      <div className="rounded-2xl border border-white/50 bg-white/90 p-5 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.35)] backdrop-blur-2xl ring-1 ring-black/5">
        <div
          className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl shadow-sm"
          style={{ backgroundColor: REF.tealLight, color: REF.teal }}
        >
          <IconRupee size={20} />
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{roiLabel}</p>
        <p className="mt-1 text-[2rem] font-extrabold leading-none tracking-tight" style={{ color: REF.teal }}>
          <CmsField path={roiPath} draggable>
            {roiRate}
          </CmsField>{" "}
          <span className="text-lg font-bold">p.a.</span>
        </p>
        <p className="mt-2 text-xs font-medium text-slate-500">{REFERENCE_HERO.roiFooter}</p>
      </div>
    </div>
  );
}

/** @deprecated Use HeroRoiCard — hero image is now section background */
export function HeroPhotoCarousel(props: Props) {
  return <HeroRoiCard {...props} />;
}
