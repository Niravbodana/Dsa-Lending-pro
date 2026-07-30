"use client";

import type { ReactNode } from "react";
import { ScrollProgressBar } from "@/components/ScrollProgressBar";

type Props = {
  children: ReactNode;
};

/** Native fast scroll — no smooth-scroll hijacking */
export function PremiumProviders({ children }: Props) {
  return (
    <>
      <ScrollProgressBar />
      {children}
    </>
  );
}
