import Image from "next/image";
import { BRAND } from "@/lib/brand";

type NeerCredLogoProps = {
  variant?: "full" | "header" | "icon" | "wordmark" | "stacked";
  size?: number;
  dark?: boolean;
  className?: string;
};

const LOGO_SRC = "/neercred-logo.svg";
const HEADER_SRC = "/neercred-logo-header.svg";
const STACKED_SRC = "/neercred-logo-stacked.svg";
const ICON_SRC = "/neercred-icon.svg";

const DIMENSIONS = {
  full: { width: 400, height: 92 },
  header: { width: 240, height: 68 },
  stacked: { width: 280, height: 248 },
  icon: { width: 96, height: 96 },
} as const;

export function NeerCredLogo({
  variant = "full",
  size,
  dark = false,
  className = "",
}: NeerCredLogoProps) {
  if (variant === "icon") {
    const iconSize = size ?? 40;
    return (
      <Image
        src={ICON_SRC}
        alt=""
        width={DIMENSIONS.icon.width}
        height={DIMENSIONS.icon.height}
        className={`shrink-0 rounded-[22%] ${className}`}
        style={{ width: iconSize, height: iconSize }}
        priority
      />
    );
  }

  const isStacked = variant === "stacked" || variant === "wordmark" || dark;
  const isHeader = variant === "header";
  const src = isHeader ? HEADER_SRC : isStacked ? STACKED_SRC : LOGO_SRC;
  const dims = isHeader
    ? DIMENSIONS.header
    : isStacked
      ? DIMENSIONS.stacked
      : DIMENSIONS.full;
  const height = size ?? (isHeader ? 64 : isStacked ? 120 : 56);

  return (
    <span className="inline-flex items-center">
      <Image
        src={src}
        alt={`${BRAND.appName} — ${BRAND.logoTagline}`}
        width={dims.width}
        height={dims.height}
        className={`h-auto w-auto object-contain ${className}`}
        style={className ? undefined : { height, width: "auto" }}
        priority
      />
    </span>
  );
}
