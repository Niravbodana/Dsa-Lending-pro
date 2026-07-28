import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Icon({ size = 20, className = "", children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      {...props}
    >
      {children}
    </svg>
  );
}

export function IconShield({ size, className }: IconProps) {
  return (
    <Icon size={size} className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </Icon>
  );
}

export function IconLock({ size, className }: IconProps) {
  return (
    <Icon size={size} className={className}>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </Icon>
  );
}

export function IconBank({ size, className }: IconProps) {
  return (
    <Icon size={size} className={className}>
      <path d="M3 21h18" />
      <path d="M5 21V7l7-4 7 4v14" />
      <path d="M9 21v-4h6v4" />
      <path d="M9 10h.01M15 10h.01M9 14h.01M15 14h.01" />
    </Icon>
  );
}

export function IconChart({ size, className }: IconProps) {
  return (
    <Icon size={size} className={className}>
      <path d="M3 3v18h18" />
      <path d="M7 16l4-6 4 3 5-8" />
    </Icon>
  );
}

export function IconBolt({ size, className }: IconProps) {
  return (
    <Icon size={size} className={className}>
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </Icon>
  );
}

export function IconUsers({ size, className }: IconProps) {
  return (
    <Icon size={size} className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </Icon>
  );
}

export function IconCheck({ size, className }: IconProps) {
  return (
    <Icon size={size} className={className}>
      <path d="M20 6L9 17l-5-5" />
    </Icon>
  );
}

export function IconCheckCircle({ size, className }: IconProps) {
  return (
    <Icon size={size} className={className}>
      <circle cx="12" cy="12" r="10" />
      <path d="M9 12l2 2 4-4" />
    </Icon>
  );
}

export function IconStar({ size, className }: IconProps) {
  return (
    <Icon size={size} className={className}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </Icon>
  );
}

export function IconPhone({ size, className }: IconProps) {
  return (
    <Icon size={size} className={className}>
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <path d="M12 18h.01" />
    </Icon>
  );
}

export function IconFile({ size, className }: IconProps) {
  return (
    <Icon size={size} className={className}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </Icon>
  );
}

export function IconBuilding({ size, className }: IconProps) {
  return (
    <Icon size={size} className={className}>
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18" />
      <path d="M6 12h12M10 6h.01M14 6h.01M10 10h.01M14 10h.01M10 14h.01M14 14h.01M10 18h.01M14 18h.01" />
    </Icon>
  );
}

export function IconGift({ size, className }: IconProps) {
  return (
    <Icon size={size} className={className}>
      <rect x="3" y="8" width="18" height="13" rx="1" />
      <path d="M12 8v13M3 12h18M12 8c-2-2-4-3-4-5a2 2 0 0 1 4 0c0 2-2 3-4 5zm0 0c2-2 4-3 4-5a2 2 0 0 0-4 0c0 2 2 3 4 5z" />
    </Icon>
  );
}

export function IconSmartphone({ size, className }: IconProps) {
  return <IconPhone size={size} className={className} />;
}

export function IconSparkles({ size, className }: IconProps) {
  return (
    <Icon size={size} className={className}>
      <path d="M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z" />
      <path d="M5 3v3M3 5h3M19 17v3M17 19h3" />
    </Icon>
  );
}

export function IconMenu({ size, className }: IconProps) {
  return (
    <Icon size={size} className={className}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </Icon>
  );
}

export function IconX({ size, className }: IconProps) {
  return (
    <Icon size={size} className={className}>
      <path d="M18 6L6 18M6 6l12 12" />
    </Icon>
  );
}

export function IconArrowRight({ size, className }: IconProps) {
  return (
    <Icon size={size} className={className}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Icon>
  );
}

export function IconRupee({ size, className }: IconProps) {
  return (
    <Icon size={size} className={className}>
      <path d="M6 3h12M6 8h12M8 21V8a4 4 0 0 1 8 0" />
    </Icon>
  );
}

export function IconScale({ size, className }: IconProps) {
  return (
    <Icon size={size} className={className}>
      <path d="M12 3v18M5 7l7-4 7 4M5 7l-2 6h6M19 7l-2 6h6" />
    </Icon>
  );
}

export function IconCpu({ size, className }: IconProps) {
  return (
    <Icon size={size} className={className}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2" />
    </Icon>
  );
}

export function IconTarget({ size, className }: IconProps) {
  return (
    <Icon size={size} className={className}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </Icon>
  );
}

export function IconWhatsApp({ size = 24, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function IconBug({ size, className }: IconProps) {
  return (
    <Icon size={size} className={className}>
      <path d="M8 2v4M16 2v4M12 2v4M4 10h16M6 14h.01M10 14h.01M14 14h.01M18 14h.01M8 18h8M10 22h4M7 6l-2-2M17 6l2-2" />
      <ellipse cx="12" cy="14" rx="7" ry="8" />
    </Icon>
  );
}

export const STAT_ICONS = {
  loan: IconRupee,
  rate: IconChart,
  speed: IconBolt,
  users: IconUsers,
} as const;
