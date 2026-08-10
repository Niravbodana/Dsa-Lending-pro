import { BRAND } from "@/lib/brand";

type NeerCredLogoProps = {
  variant?: "full" | "header" | "icon" | "wordmark" | "stacked";
  size?: number;
  dark?: boolean;
  className?: string;
};

const SOURCES = {
  icon: "/neercred-icon.svg",
  stacked: "/neercred-logo-stacked.svg",
  dark: "/brand/neercred-stacked.svg",
} as const;

function OneLineLockup({
  size = 44,
  dark = false,
  className = "",
}: {
  size?: number;
  dark?: boolean;
  className?: string;
}) {
  const height = Math.round(size * 0.95);
  const width = Math.round(size * 4.45);
  const src = dark ? "/neercred-logo-lockup-dark.svg" : "/neercred-logo-lockup.svg";

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="NeerCred"
      className={`shrink-0 object-contain object-left ${className}`}
      style={{ height, width: "auto", maxWidth: width }}
    />
  );
}

/** Official NeerCred logo — icon + wordmark always on one line */
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

  if (variant === "stacked" && !dark) {
    const height = size ?? 64;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={SOURCES.stacked}
        alt={`${BRAND.appName} — ${BRAND.logoTagline}`}
        className={`h-auto w-auto bg-transparent object-contain object-left ${className}`}
        style={className ? undefined : { height, width: "auto", maxWidth: 200 }}
      />
    );
  }

  const lockupSize = size ?? (variant === "header" ? 44 : 52);
  return <OneLineLockup size={lockupSize} dark={dark} className={className} />;
}

export const NEERCRED_LOGO_SRC = SOURCES.icon;
