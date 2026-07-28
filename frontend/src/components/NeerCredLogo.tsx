import { BRAND } from "@/lib/brand";

type NeerCredLogoProps = {
  variant?: "full" | "icon" | "wordmark" | "stacked";
  size?: number;
  dark?: boolean;
  className?: string;
};

/** NeerCred mark: water droplet + ascending trust arc (unique — not CRED / InCred / Neer retail). */
function NeerCredMark({ size = 40 }: { size?: number }) {
  const id = `nc-${size}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id={`${id}-bg`} x1="8" y1="4" x2="40" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0B1220" />
          <stop offset="1" stopColor="#0F766E" />
        </linearGradient>
        <linearGradient id={`${id}-drop`} x1="24" y1="10" x2="24" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5EEAD4" />
          <stop offset="1" stopColor="#0891B2" />
        </linearGradient>
        <linearGradient id={`${id}-arc`} x1="14" y1="30" x2="34" y2="14" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FDE68A" />
          <stop offset="1" stopColor="#D4A017" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="14" fill={`url(#${id}-bg)`} />
      <path
        d="M11 31C11 31 13.5 22 24 14C34.5 22 37 31 37 31"
        stroke={`url(#${id}-arc)`}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        opacity="0.95"
      />
      <path
        d="M33 28L36.5 24.5L40 28"
        stroke={`url(#${id}-arc)`}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M24 11.5C24 11.5 31 19.2 31 26.2C31 32.4 26.8 37.5 24 37.5C21.2 37.5 17 32.4 17 26.2C17 19.2 24 11.5 24 11.5Z"
        fill={`url(#${id}-drop)`}
      />
      <path
        d="M20.5 26.5L23 29.5L28.5 22.5"
        stroke="#0B1220"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.85"
      />
      <circle cx="24" cy="13.5" r="2" fill="#FDE68A" opacity="0.95" />
    </svg>
  );
}

function NeerCredWordmark({
  dark = false,
  size = "md",
}: {
  dark?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const titleColor = dark ? "text-white" : "text-slate-900";
  const credColor = dark ? "text-teal-400" : "text-teal-600";
  const sizeClass =
    size === "lg" ? "text-2xl" : size === "sm" ? "text-sm" : "text-base";

  return (
    <span className={`font-extrabold tracking-tight ${sizeClass} ${titleColor}`}>
      Neer<span className={credColor}>Cred</span>
    </span>
  );
}

function NeerCredTagline({ dark = false }: { dark?: boolean }) {
  return (
    <span
      className={`text-[10px] font-semibold uppercase tracking-[0.18em] ${
        dark ? "text-teal-500/90" : "text-slate-500"
      }`}
    >
      {BRAND.logoTagline}
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
    return (
      <span className={`inline-flex shrink-0 ${className}`}>
        <NeerCredMark size={size} />
      </span>
    );
  }

  if (variant === "wordmark") {
    return (
      <span className={`inline-flex flex-col items-start gap-0.5 ${className}`}>
        <NeerCredWordmark dark={dark} />
        <NeerCredTagline dark={dark} />
      </span>
    );
  }

  if (variant === "stacked") {
    return (
      <span className={`inline-flex flex-col items-center gap-2 ${className}`}>
        <NeerCredMark size={size} />
        <span className="flex flex-col items-center gap-0.5">
          <NeerCredWordmark dark={dark} size="lg" />
          <NeerCredTagline dark={dark} />
        </span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <NeerCredMark size={size} />
      <span className="flex flex-col gap-0.5">
        <NeerCredWordmark dark={dark} />
        <NeerCredTagline dark={dark} />
      </span>
    </span>
  );
}
