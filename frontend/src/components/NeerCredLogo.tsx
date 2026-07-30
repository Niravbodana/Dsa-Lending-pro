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
  const iconSize = Math.round(size * 0.82);
  const fontSize = Math.round(size * 0.52);

  return (
    <span className={`inline-flex items-center gap-2 whitespace-nowrap ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={SOURCES.icon}
        alt=""
        className="shrink-0 rounded-[22%]"
        style={{ width: iconSize, height: iconSize }}
      />
      <span className="font-bold leading-none tracking-tight" style={{ fontSize }}>
        <span className={dark ? "text-white" : "text-neercred-navy"}>Neer</span>
        <span className={dark ? "text-teal-300" : "text-neercred-teal"}>Cred</span>
      </span>
    </span>
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
