import Image from "next/image";
import { BRAND } from "@/lib/brand";

type NeerCredLogoProps = {
  variant?: "full" | "icon" | "wordmark" | "stacked";
  size?: number;
  dark?: boolean;
  className?: string;
};

/** Original approved lockup asset — do not redraw in SVG (design drift). */
const LOCKUP_SRC = "/neercred-logo-lockup.png";
const LOCKUP_WIDTH = 1536;
const LOCKUP_HEIGHT = 1024;
const LOCKUP_ASPECT = LOCKUP_WIDTH / LOCKUP_HEIGHT;

function LockupImage({ height, className = "" }: { height: number; className?: string }) {
  return (
    <Image
      src={LOCKUP_SRC}
      alt={`${BRAND.appName} — ${BRAND.logoTagline}`}
      width={LOCKUP_WIDTH}
      height={LOCKUP_HEIGHT}
      className={`w-auto object-contain ${className}`}
      style={{ height, maxHeight: height }}
      priority
    />
  );
}

/** Icon-only crop from the approved lockup (left mark). */
function LockupIcon({ size, className = "" }: { size: number; className?: string }) {
  return (
    <span
      className={`relative inline-block shrink-0 overflow-hidden rounded-[22%] ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <Image
        src={LOCKUP_SRC}
        alt=""
        width={LOCKUP_WIDTH}
        height={LOCKUP_HEIGHT}
        className="absolute max-w-none object-cover"
        style={{
          height: size * 2.4,
          width: size * 2.4 * LOCKUP_ASPECT * 2.8,
          left: -size * 0.12,
          top: -size * 0.42,
        }}
      />
    </span>
  );
}

export function NeerCredLogo({
  variant = "full",
  size = 40,
  dark = false,
  className = "",
}: NeerCredLogoProps) {
  if (variant === "icon") {
    return <LockupIcon size={size} className={className} />;
  }

  if (variant === "wordmark" || variant === "stacked") {
    const height = variant === "stacked" ? size * 1.35 : size;
    const logo = <LockupImage height={height} />;
    return (
      <span className={`inline-flex flex-col items-center ${className}`}>
        {dark ? (
          <span className="inline-flex rounded-xl bg-white px-3 py-1.5 shadow-sm">{logo}</span>
        ) : (
          logo
        )}
      </span>
    );
  }

  const logo = <LockupImage height={size} />;

  if (dark) {
    return (
      <span className={`inline-flex items-center rounded-xl bg-white px-3 py-1.5 shadow-sm ${className}`}>
        {logo}
      </span>
    );
  }

  return <span className={`inline-flex items-center ${className}`}>{logo}</span>;
}
