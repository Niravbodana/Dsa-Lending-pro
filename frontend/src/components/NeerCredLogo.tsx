import Image from "next/image";
import { BRAND } from "@/lib/brand";

type NeerCredLogoProps = {
  variant?: "full" | "header" | "icon" | "wordmark" | "stacked";
  size?: number;
  dark?: boolean;
  className?: string;
};

/** Official brand lockup — user-provided PNG (icon + NeerCred + tagline) */
const LOCKUP_SRC = "/neercred-logo-lockup.png";
const ICON_SRC = "/neercred-icon.svg";

const DIMENSIONS = {
  lockup: { width: 1536, height: 1024 },
  icon: { width: 96, height: 96 },
} as const;

export function NeerCredLogo({
  variant = "full",
  size,
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

  const height = size ?? 64;

  return (
    <span className="inline-flex items-center">
      <Image
        src={LOCKUP_SRC}
        alt={`${BRAND.appName} — ${BRAND.logoTagline}`}
        width={DIMENSIONS.lockup.width}
        height={DIMENSIONS.lockup.height}
        className={`h-auto w-auto object-contain object-left ${className}`}
        style={className ? undefined : { height, width: "auto", maxWidth: 240 }}
        priority
      />
    </span>
  );
}
