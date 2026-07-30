"use client";

import { ReactLenis } from "lenis/react";
import { useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { ScrollProgressBar } from "@/components/ScrollProgressBar";

type Props = {
  children: ReactNode;
};

/** Mac-style inertia smooth scrolling sitewide */
export function PremiumProviders({ children }: Props) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return (
      <>
        <ScrollProgressBar />
        {children}
      </>
    );
  }

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.085,
        duration: 1.15,
        smoothWheel: true,
        touchMultiplier: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      }}
    >
      <ScrollProgressBar />
      {children}
    </ReactLenis>
  );
}
