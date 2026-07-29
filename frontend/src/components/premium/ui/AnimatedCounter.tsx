"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, motion } from "framer-motion";

type Props = {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
};

export function AnimatedCounter({ value, prefix = "", suffix = "", decimals = 0, duration = 1.8 }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const startTime = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - startTime) / (duration * 1000), 1);
      const eased = 1 - (1 - p) ** 3;
      start = value * eased;
      setDisplay(start);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, value, duration]);

  const formatted =
    decimals > 0 ? display.toFixed(decimals) : Math.floor(display).toLocaleString("en-IN");

  return (
    <motion.span ref={ref} className="tabular-nums">
      {prefix}
      {formatted}
      {suffix}
    </motion.span>
  );
}
