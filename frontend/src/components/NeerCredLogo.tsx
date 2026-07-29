import { BRAND } from "@/lib/brand";
import { NeerCredMark } from "@/components/NeerCredMark";

type NeerCredLogoProps = {
  /** Use light-text version on dark backgrounds (footer, dashboard) */
  dark?: boolean;
  size?: number;
  className?: string;
};

/** One-line lockup: icon + big NeerCred + small tagline — fully transparent */
export function NeerCredLogo({ dark = false, size = 72, className = "" }: NeerCredLogoProps) {
  const markSize = Math.round(size * 0.88);

  return (
    <div
      className={`inline-flex items-center gap-2.5 bg-transparent sm:gap-3 ${className}`}
      style={className ? undefined : { height: size }}
      role="img"
      aria-label={`${BRAND.appName} — ${BRAND.logoTagline}`}
    >
      <NeerCredMark size={markSize} />
      <div className="flex flex-col justify-center leading-none">
        <p
          className="font-[family-name:var(--font-poppins)] text-[1.65rem] font-extrabold tracking-tight sm:text-[2rem] lg:text-[2.15rem]"
          style={{ lineHeight: 1.05 }}
        >
          <span className={dark ? "text-white" : "text-neercred-navy"}>Neer</span>
          <span className="bg-gradient-to-r from-[#0D5C56] via-[#0F766E] to-[#2DD4BF] bg-clip-text text-transparent">
            Cred
          </span>
        </p>
        <p
          className={`mt-1 font-[family-name:var(--font-poppins)] text-[0.48rem] font-semibold uppercase tracking-[0.28em] sm:text-[0.52rem] sm:tracking-[0.32em] ${
            dark ? "text-slate-300" : "text-neercred-navy/75"
          }`}
        >
          {BRAND.logoTagline.toUpperCase()}
        </p>
      </div>
    </div>
  );
}

export const NEERCRED_LOGO_SRC = "/brand/neercred-horizontal.svg";
