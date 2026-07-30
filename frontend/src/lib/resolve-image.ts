const SITE_IMAGE_RE =
  /^\/images\/site\/(\d+)-([a-f0-9]+)(?:-(\d+)x(\d+))?\.(?:jpg|jpeg|webp)$/i;

const HERO_WEDDING_FALLBACK =
  "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&w=2400&q=95&fit=crop";

/** Map legacy `/images/site/...` CMS paths to live Unsplash URLs. */
export function resolveCmsImageUrl(url: string | undefined | null): string {
  if (!url?.trim()) return "";
  const trimmed = url.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;

  const match = SITE_IMAGE_RE.exec(trimmed);
  if (match) {
    const [, ts, hash, width, height] = match;
    const w = width || "600";
    const h = height || "400";
    return `https://images.unsplash.com/photo-${ts}-${hash}?w=${w}&h=${h}&fit=crop`;
  }

  if (trimmed.includes("hero-wedding-couple")) return HERO_WEDDING_FALLBACK;

  return trimmed;
}
