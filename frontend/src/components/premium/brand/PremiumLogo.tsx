"use client";

import Image from "next/image";

type Variant = "icon" | "horizontal" | "stacked" | "full";

const SOURCES: Record<Variant, string> = {
  icon: "/brand/neercred-icon.svg",
  horizontal: "/brand/neercred-horizontal.svg",
  stacked: "/brand/neercred-stacked.svg",
  full: "/brand/neercred-full.svg",
};

const SIZES: Record<Variant, { w: number; h: number; defaultH: number }> = {
  icon: { w: 96, h: 96, defaultH: 40 },
  horizontal: { w: 320, h: 72, defaultH: 48 },
  stacked: { w: 200, h: 220, defaultH: 120 },
  full: { w: 400, h: 96, defaultH: 56 },
};

type Props = {
  variant?: Variant;
  height?: number;
  className?: string;
  onDark?: boolean;
};

/** Original NeerCred logo — growth bars + trust arc mark */
export function PremiumLogo({ variant = "horizontal", height, className = "", onDark }: Props) {
  const dims = SIZES[variant];
  const h = height ?? dims.defaultH;
  const src = SOURCES[variant];

  if (variant === "icon") {
    return (
      <Image
        src={src}
        alt="NeerCred"
        width={dims.w}
        height={dims.h}
        className={`rounded-2xl ${className}`}
        style={{ width: h, height: h }}
        priority
      />
    );
  }

  return (
    <Image
      src={onDark && variant === "horizontal" ? "/brand/neercred-full.svg" : src}
      alt="NeerCred — Dream Big. Borrow Smart."
      width={dims.w}
      height={dims.h}
      className={`h-auto w-auto object-contain ${className}`}
      style={{ height: h, width: "auto" }}
      priority
    />
  );
}
