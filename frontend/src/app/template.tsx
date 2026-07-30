"use client";

import { motion, useReducedMotion } from "framer-motion";
import { APPLE_EASE } from "@/components/ScrollReveal";

export default function Template({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.55, ease: APPLE_EASE }}
    >
      {children}
    </motion.div>
  );
}
