import type { SiteConfig } from "@/lib/cms";

export type ThemeConfig = SiteConfig["theme"] & {
  background?: string;
  hero_overlay?: string;
  glass_intensity?: string;
  hero_background?: string;
};

const BACKGROUNDS: Record<string, string> = {
  "glass-blue":
    "linear-gradient(165deg, #dbeafe 0%, #e0f2fe 22%, #f0f9ff 48%, #ecfeff 72%, #f8fafc 100%)",
  "glass-white": "linear-gradient(180deg, #f8fafc 0%, #ffffff 50%, #f1f5f9 100%)",
  "navy-gradient": "linear-gradient(135deg, #0b1220 0%, #0f766e 50%, #0891b2 100%)",
  "teal-mist": "linear-gradient(160deg, #ccfbf1 0%, #e0f2fe 40%, #f0fdfa 100%)",
};

const OVERLAYS: Record<string, string> = {
  "sky-glass":
    "linear-gradient(to right, rgba(224,242,254,0.95) 32%, rgba(255,255,255,0.85) 48%, rgba(255,255,255,0.15) 100%)",
  "white-glass":
    "linear-gradient(to right, rgba(255,255,255,0.95) 35%, rgba(255,255,255,0.7) 55%, transparent 100%)",
  navy: "linear-gradient(to right, rgba(11,18,32,0.92) 30%, rgba(11,18,32,0.6) 60%, transparent 100%)",
  "mint-glass":
    "linear-gradient(to right, rgba(240,253,250,0.94) 32%, rgba(255,255,255,0.8) 50%, transparent 100%)",
};

import type { CSSProperties } from "react";

export function themeStyleVars(theme: ThemeConfig): CSSProperties {
  const bg = BACKGROUNDS[theme.background || "glass-blue"] || BACKGROUNDS["glass-blue"];
  const glassBlur =
    theme.glass_intensity === "high" ? "20px" : theme.glass_intensity === "low" ? "8px" : "14px";
  const accent = theme.accent === "gold" ? "#D4A853" : "#0F766E";
  return {
    ["--site-bg" as string]: bg,
    ["--hero-overlay" as string]: OVERLAYS[theme.hero_overlay || "sky-glass"] || OVERLAYS["sky-glass"],
    ["--glass-blur" as string]: glassBlur,
    ["--site-accent" as string]: accent,
  };
}

export function siteBackgroundClass(theme: ThemeConfig): string {
  if (theme.background === "navy-gradient") return "text-white";
  return "";
}
