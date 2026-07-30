"use client";

import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";

/** Thin top progress bar — subtle Mac-style scroll indicator */
export function ScrollProgressBar() {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28, restDelta: 0.001 });

  if (reduceMotion) return null;

  return (
    <motion.div
      className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-[2px] origin-left bg-gradient-to-r from-teal-500 via-cyan-400 to-teal-600"
      style={{ scaleX }}
      aria-hidden
    />
  );
}
