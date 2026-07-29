"use client";

import { motion } from "framer-motion";

type Props = { className?: string; color?: string };

export function GradientOrb({ className = "", color = "rgba(20,184,166,0.4)" }: Props) {
  return (
    <motion.div
      className={`pointer-events-none absolute rounded-full blur-3xl ${className}`}
      style={{ background: `radial-gradient(circle, ${color} 0%, transparent 70%)` }}
      animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.7, 0.5] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}
