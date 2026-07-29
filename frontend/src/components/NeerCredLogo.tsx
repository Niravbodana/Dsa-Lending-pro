import { BRAND } from "@/lib/brand";

type NeerCredLogoProps = {
  variant?: "full" | "header" | "icon" | "wordmark" | "stacked";
  size?: number;
  dark?: boolean;
  className?: string;
};

const HEADER_SRC = "/neercred-logo-header.svg";
const LIGHT_SRC = "/neercred-logo-light.svg";
const ICON_SRC = "/neercred-icon.svg";

/** Transparent SVG lockups — no white/dark background box */
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
        src={ICON_SRC}
        alt=""
        width={iconSize}
        height={iconSize}
        className={`shrink-0 ${className}`}
      />
    );
  }

  const src = dark ? LIGHT_SRC : HEADER_SRC;
  const height = size ?? 64;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={`${BRAND.appName} — ${BRAND.logoTagline}`}
      className={`h-auto w-auto bg-transparent object-contain object-left ${className}`}
      style={className ? undefined : { height, width: "auto" }}
    />
  );
}
