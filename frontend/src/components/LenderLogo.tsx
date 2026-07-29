import Image from "next/image";

function isImageUrl(logo: string) {
  return logo.startsWith("http://") || logo.startsWith("https://") || logo.startsWith("/");
}

export function lenderBadgeText(name: string, logo?: string): string {
  if (logo && logo.length > 0 && !isImageUrl(logo)) return logo.slice(0, 4).toUpperCase();
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.slice(0, 4).toUpperCase();
}

type LenderLogoProps = {
  name: string;
  logo?: string;
  size?: number;
  className?: string;
};

export function LenderLogo({ name, logo = "", size = 48, className = "" }: LenderLogoProps) {
  const dim = { width: size, height: size };

  if (logo && isImageUrl(logo)) {
    return (
      <div
        className={`relative shrink-0 overflow-hidden rounded-xl bg-white ring-1 ring-slate-100 ${className}`}
        style={dim}
      >
        <Image src={logo} alt={name} fill className="object-contain p-1.5" sizes={`${size}px`} />
      </div>
    );
  }

  const badge = lenderBadgeText(name, logo);

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-50 to-cyan-50 text-sm font-bold text-neercred-teal ring-1 ring-teal-100 ${className}`}
      style={dim}
      aria-hidden
    >
      {badge}
    </div>
  );
}
