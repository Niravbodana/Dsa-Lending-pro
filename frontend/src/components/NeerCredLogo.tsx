import { BRAND } from "@/lib/brand";

type NeerCredLogoProps = {
  variant?: "full" | "header" | "icon" | "wordmark" | "stacked";
  size?: number;
  dark?: boolean;
  className?: string;
};

const SOURCES = {
  header: "/neercred-logo-header.svg",
  full: "/neercred-logo.svg",
  icon: "/neercred-icon.svg",
  stacked: "/neercred-logo-stacked.svg",
  wordmark: "/brand/neercred-horizontal.svg",
  dark: "/brand/neercred-stacked.svg",
} as const;

/** Official NeerCred logo — transparent SVG lockups (no missing PNG) */
export function NeerCredLogo({
  variant = "full",
  size,
  dark = false,
  className = "",
}: NeerCredLogoProps) {
  if (variant === "icon") {
    const iconSize = size ?? 40;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={SOURCES.icon}
        alt=""
        className={`shrink-0 rounded-[22%] ${className}`}
        style={{ width: iconSize, height: iconSize }}
      />
    );
  }

  let src: string = SOURCES.full;
  if (dark) src = SOURCES.dark;
  else if (variant === "header") src = SOURCES.header;
  else if (variant === "stacked") src = SOURCES.stacked;
  else if (variant === "wordmark") src = SOURCES.wordmark;

  const height = size ?? (variant === "header" ? 72 : 64);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`${BRAND.appName} — ${BRAND.logoTagline}`}
      className={`h-auto w-auto bg-transparent object-contain object-left ${className}`}
      style={className ? undefined : { height, width: "auto", maxWidth: 240 }}
    />
  );
}

export const NEERCRED_LOGO_SRC = SOURCES.full;
