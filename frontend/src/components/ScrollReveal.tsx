"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type RevealVariant = "up" | "left" | "right" | "scale" | "fade";

export function ScrollReveal({
  children,
  className = "",
  variant = "up",
  delay = 0,
  duration = 1000,
}: {
  children: ReactNode;
  className?: string;
  variant?: RevealVariant;
  delay?: number;
  duration?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const variantClass = {
    up: "reveal-up",
    left: "reveal-left",
    right: "reveal-right",
    scale: "reveal-scale",
    fade: "reveal-fade",
  }[variant];

  return (
    <div
      ref={ref}
      className={`reveal ${variantClass} ${visible ? "reveal-visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms`, transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
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
