/** N icon mark only — transparent */
export function NeerCredMark({
  size = 52,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-hidden
    >
      <defs>
        <linearGradient id="mk-blue" x1="14" y1="14" x2="50" y2="54" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2DD4BF" />
          <stop offset="0.45" stopColor="#0EA5E9" />
          <stop offset="1" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id="mk-gold" x1="38" y1="12" x2="58" y2="54" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFF8E1" />
          <stop offset="0.2" stopColor="#F5D76E" />
          <stop offset="0.55" stopColor="#D4A017" />
          <stop offset="1" stopColor="#92600A" />
        </linearGradient>
        <linearGradient id="mk-ring-b" x1="8" y1="32" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38BDF8" />
          <stop offset="1" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id="mk-ring-g" x1="32" y1="32" x2="56" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FDE68A" />
          <stop offset="1" stopColor="#A16207" />
        </linearGradient>
        <linearGradient id="mk-shine" x1="20" y1="12" x2="36" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FFFFFF" stopOpacity="0.55" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d="M32 7 A25 25 0 0 0 32 57" stroke="url(#mk-ring-b)" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M32 7 A25 25 0 0 1 32 57" stroke="url(#mk-ring-g)" strokeWidth="2.6" fill="none" strokeLinecap="round" />
      <path d="M21 17 L21 47" stroke="url(#mk-blue)" strokeWidth="6.5" strokeLinecap="round" />
      <path d="M21 17 L43 47" stroke="url(#mk-blue)" strokeWidth="6.5" strokeLinecap="round" />
      <path d="M43 17 L43 47" stroke="url(#mk-gold)" strokeWidth="6.5" strokeLinecap="round" />
      <path
        d="M32 3.5 L33.6 7.8 L38 7.8 L34.4 10.8 L35.6 14.8 L32 12.2 L28.4 14.8 L29.6 10.8 L26 7.8 L30.4 7.8 Z"
        fill="url(#mk-gold)"
      />
      <ellipse cx="29" cy="23" rx="8" ry="12" fill="url(#mk-shine)" opacity="0.4" />
    </svg>
  );
}
