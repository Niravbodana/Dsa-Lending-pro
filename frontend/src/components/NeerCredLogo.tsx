import Image from "next/image";
import { BRAND } from "@/lib/brand";

type NeerCredLogoProps = {
  variant?: "full" | "icon" | "wordmark" | "stacked";
  size?: number;
  dark?: boolean;
  className?: string;
};

const LOGO_SRC = "/neercred-logo.svg";
const ICON_SRC = "/neercred-icon.svg";

export function NeerCredLogo({
  variant = "full",
  size,
  dark = false,
  className = "",
}: NeerCredLogoProps) {
  const height = size ?? 56;

  if (variant === "icon") {
    const iconSize = size ?? 40;
    return (
      <Image
        src={ICON_SRC}
        alt=""
        width={iconSize}
        height={iconSize}
        className={`shrink-0 rounded-[22%] ${className}`}
        style={{ width: iconSize, height: iconSize }}
        priority
      />
    );
  }

  const logo = (
    <Image
      src={LOGO_SRC}
      alt={`${BRAND.appName} — ${BRAND.logoTagline}`}
      width={320}
      height={88}
      className={`h-auto w-auto object-contain ${className}`}
      style={className ? undefined : { height, width: "auto" }}
      priority
    />
  );

  if (dark) {
    return (
      <span className="inline-flex items-center rounded-xl bg-[#fefefe] px-2 py-1 shadow-sm sm:px-2.5 sm:py-1.5">
        {logo}
      </span>
    );
  }

  return <span className="inline-flex items-center">{logo}</span>;
}
