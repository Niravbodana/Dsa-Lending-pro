"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/** Apple-style ease — used across scroll reveals and page transitions */
export const APPLE_EASE = [0.16, 1, 0.3, 1] as const;

type RevealVariant = "up" | "left" | "right" | "scale" | "fade";

const VARIANTS: Record<
  RevealVariant,
  { hidden: Record<string, string | number>; visible: Record<string, string | number> }
> = {
  up: {
    hidden: { opacity: 0, y: 52, filter: "blur(8px)" },
    visible: { opacity: 1, y: 0, filter: "blur(0px)" },
  },
  left: {
    hidden: { opacity: 0, x: -64, filter: "blur(6px)" },
    visible: { opacity: 1, x: 0, filter: "blur(0px)" },
  },
  right: {
    hidden: { opacity: 0, x: 64, filter: "blur(6px)" },
    visible: { opacity: 1, x: 0, filter: "blur(0px)" },
  },
  scale: {
    hidden: { opacity: 0, scale: 0.94, filter: "blur(4px)" },
    visible: { opacity: 1, scale: 1, filter: "blur(0px)" },
  },
  fade: {
    hidden: { opacity: 0, filter: "blur(10px)" },
    visible: { opacity: 1, filter: "blur(0px)" },
  },
};

export function ScrollReveal({
  children,
  className = "",
  variant = "up",
  delay = 0,
  duration = 0.9,
}: {
  children: ReactNode;
  className?: string;
  variant?: RevealVariant;
  delay?: number;
  duration?: number;
}) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.18, margin: "0px 0px -8% 0px" }}
      variants={VARIANTS[variant]}
      transition={{
        duration,
        delay: delay / 1000,
        ease: APPLE_EASE,
      }}
    >
      {children}
    </motion.div>
  );
}

/** Alternates left/right motion for list items while scrolling. */
export function ScrollRevealAlternate({
  index,
  children,
  className = "",
  delay = 0,
}: {
  index: number;
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const variant = index % 2 === 0 ? "left" : "right";
  return (
    <ScrollReveal variant={variant} delay={delay} className={className}>
      {children}
    </ScrollReveal>
  );
}
