import { BRAND } from "@/lib/brand";

type NeerCredLogoProps = {
  /** Use light-text version on dark backgrounds (footer, dashboard) */
  dark?: boolean;
  size?: number;
  className?: string;
};

/** Single official lockup — /brand/neercred-horizontal.svg (transparent) */
const LOGO = "/brand/neercred-horizontal.svg";
const LOGO_DARK = "/brand/neercred-horizontal-light.svg";

export function NeerCredLogo({ dark = false, size = 76, className = "" }: NeerCredLogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={dark ? LOGO_DARK : LOGO}
      alt={`${BRAND.appName} — ${BRAND.logoTagline}`}
      className={`h-auto w-auto bg-transparent object-contain object-left ${className}`}
      style={className ? undefined : { height: size, width: "auto" }}
    />
  );
}

export const NEERCRED_LOGO_SRC = LOGO;
