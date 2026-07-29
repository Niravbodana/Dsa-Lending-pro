import { BRAND } from "@/lib/brand";

export type LogoVariant = "full" | "header" | "icon" | "wordmark" | "stacked" | "wide";

type NeerCredLogoProps = {
  variant?: LogoVariant;
  size?: number;
  dark?: boolean;
  className?: string;
};

/** Transparent professional logo kit — /public/brand/ */
const LOGOS = {
  horizontal: "/brand/neercred-horizontal.svg",
  horizontalLight: "/brand/neercred-horizontal-light.svg",
  icon: "/brand/neercred-icon.svg",
  wordmark: "/brand/neercred-wordmark.svg",
  wordmarkLight: "/brand/neercred-wordmark-light.svg",
  stacked: "/brand/neercred-stacked.svg",
  wide: "/brand/neercred-wide.svg",
} as const;

const DEFAULT_HEIGHT: Record<LogoVariant, number> = {
  full: 64,
  header: 68,
  icon: 48,
  wordmark: 56,
  stacked: 140,
  wide: 96,
};

function resolveSrc(variant: LogoVariant, dark: boolean): string {
  if (variant === "icon") return LOGOS.icon;
  if (variant === "wordmark") return dark ? LOGOS.wordmarkLight : LOGOS.wordmark;
  if (variant === "stacked") return LOGOS.stacked;
  if (variant === "wide") return LOGOS.wide;
  return dark ? LOGOS.horizontalLight : LOGOS.horizontal;
}

/** Transparent SVG lockups — no background box */
export function NeerCredLogo({
  variant = "full",
  size,
  dark = false,
  className = "",
}: NeerCredLogoProps) {
  const src = resolveSrc(variant === "header" ? "header" : variant, dark);
  const height = size ?? DEFAULT_HEIGHT[variant === "header" ? "header" : variant];

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={variant === "icon" ? "" : `${BRAND.appName} — Dream Big. Borrow Smart.`}
      className={`h-auto w-auto bg-transparent object-contain object-left ${className}`}
      style={className ? undefined : { height, width: "auto" }}
    />
  );
}

export { LOGOS as NEERCRED_LOGOS };
