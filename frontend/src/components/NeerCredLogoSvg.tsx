type NeerCredLogoSvgProps = {
  variant?: "light" | "dark";
  className?: string;
  style?: React.CSSProperties;
  "aria-label"?: string;
};

/** Official NeerCred lockup — inline SVG for crisp Poppins + true transparency */
export function NeerCredLogoSvg({
  variant = "light",
  className = "",
  style,
  "aria-label": ariaLabel = "NeerCred — Dream Big · Borrow Smart",
}: NeerCredLogoSvgProps) {
  const neerFill = variant === "dark" ? "#FFFFFF" : "#0B1220";
  const taglineFill = variant === "dark" ? "#CBD5E1" : "#0B1220";

  return (
    <svg
      viewBox="0 0 440 82"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={ariaLabel}
      className={className}
      style={style}
    >
      <defs>
        <linearGradient id="nc-blue" x1="14" y1="14" x2="50" y2="54" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2DD4BF" />
          <stop offset="0.45" stopColor="#0EA5E9" />
          <stop offset="1" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id="nc-gold" x1="38" y1="12" x2="58" y2="54" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF8E1" />
          <stop offset="0.2" stopColor="#F5D76E" />
          <stop offset="0.55" stopColor="#D4A017" />
          <stop offset="1" stopColor="#92600A" />
        </linearGradient>
        <linearGradient id="nc-ring-b" x1="8" y1="32" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38BDF8" />
          <stop offset="1" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id="nc-ring-g" x1="32" y1="32" x2="56" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FDE68A" />
          <stop offset="1" stopColor="#A16207" />
        </linearGradient>
        <linearGradient id="nc-cred" x1="80" y1="8" x2="300" y2="8" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0D5C56" />
          <stop offset="0.4" stopColor="#0F766E" />
          <stop offset="1" stopColor="#2DD4BF" />
        </linearGradient>
        <linearGradient id="nc-shine" x1="20" y1="12" x2="36" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" stopOpacity="0.55" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* N icon */}
      <g transform="translate(2, 9)">
        <path
          d="M32 7 A25 25 0 0 0 32 57"
          stroke="url(#nc-ring-b)"
          strokeWidth="2.6"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M32 7 A25 25 0 0 1 32 57"
          stroke="url(#nc-ring-g)"
          strokeWidth="2.6"
          fill="none"
          strokeLinecap="round"
        />
        <path d="M21 17 L21 47" stroke="url(#nc-blue)" strokeWidth="6.5" strokeLinecap="round" />
        <path d="M21 17 L43 47" stroke="url(#nc-blue)" strokeWidth="6.5" strokeLinecap="round" />
        <path d="M43 17 L43 47" stroke="url(#nc-gold)" strokeWidth="6.5" strokeLinecap="round" />
        <path
          d="M32 3.5 L33.6 7.8 L38 7.8 L34.4 10.8 L35.6 14.8 L32 12.2 L28.4 14.8 L29.6 10.8 L26 7.8 L30.4 7.8 Z"
          fill="url(#nc-gold)"
        />
        <ellipse cx="29" cy="23" rx="8" ry="12" fill="url(#nc-shine)" opacity="0.4" />
      </g>

      {/* Wordmark */}
      <text
        x="80"
        y="38"
        fontFamily="var(--font-poppins), Poppins, system-ui, sans-serif"
        fontSize="37"
        fontWeight="800"
        letterSpacing="-0.5"
      >
        <tspan fill={neerFill}>Neer</tspan>
        <tspan fill="url(#nc-cred)">Cred</tspan>
      </text>

      {/* Tagline — navy on light, muted on dark (matches reference) */}
      <text
        x="80"
        y="60"
        fontFamily="var(--font-poppins), Poppins, system-ui, sans-serif"
        fontSize="10.5"
        fontWeight="600"
        fill={taglineFill}
        letterSpacing="4.6"
      >
        DREAM BIG · BORROW SMART
      </text>
    </svg>
  );
}
