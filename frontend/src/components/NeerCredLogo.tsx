import { BRAND } from "@/lib/brand";
import { NeerCredLogoSvg } from "@/components/NeerCredLogoSvg";

type NeerCredLogoProps = {
  /** Use light-text version on dark backgrounds (footer, dashboard) */
  dark?: boolean;
  size?: number;
  className?: string;
};

/** Official transparent lockup — inline SVG (no white box, Poppins renders correctly) */
export function NeerCredLogo({ dark = false, size = 76, className = "" }: NeerCredLogoProps) {
  return (
    <NeerCredLogoSvg
      variant={dark ? "dark" : "light"}
      className={`block h-auto w-auto bg-transparent ${className}`}
      style={className ? undefined : { height: size, width: "auto" }}
      aria-label={`${BRAND.appName} — ${BRAND.logoTagline}`}
    />
  );
}

export const NEERCRED_LOGO_SRC = "/brand/neercred-horizontal.svg";
