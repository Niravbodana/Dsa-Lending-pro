"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type RevealVariant = "up" | "left" | "right" | "scale" | "fade";

export function ScrollReveal({
  children,
  className = "",
  variant = "up",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  variant?: RevealVariant;
  delay?: number;
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
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
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
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
