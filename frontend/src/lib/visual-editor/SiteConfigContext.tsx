"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { ElementStyles, SiteConfig } from "@/lib/cms";

const SiteConfigContext = createContext<SiteConfig | null>(null);

export function SiteConfigProvider({ config, children }: { config: SiteConfig; children: ReactNode }) {
  return <SiteConfigContext.Provider value={config}>{children}</SiteConfigContext.Provider>;
}

export function useSiteConfigContext() {
  return useContext(SiteConfigContext);
}

export function publishedStyle(config: SiteConfig | null, path: string): React.CSSProperties {
  const s = config?.element_styles?.[path];
  if (!s) return {};
  return {
    color: s.color,
    fontSize: s.fontSize,
    fontWeight: s.fontWeight,
    backgroundColor: s.backgroundColor,
    textAlign: s.textAlign,
    ...(s.left != null || s.top != null
      ? { position: "relative" as const, left: s.left, top: s.top, zIndex: s.zIndex }
      : {}),
  };
}

export type { ElementStyles };
