import { INDIAN_IMAGES } from "@/lib/indian-images";

export type SiteConfig = {
  hero: {
    badge: string;
    headline_line1: string;
    headline_highlight: string;
    headline_sub: string;
    description: string;
    bullet_points: string[];
    cta_primary: string;
    cta_secondary: string;
    image_url: string;
    testimonial_quote: string;
    testimonial_author: string;
    approval_card_label: string;
    approval_card_amount: string;
    roi_badge: string;
    roi_badge_label: string;
  };
  stats: { value: string; label: string }[];
  urgency_bar: { enabled: boolean; text: string; emoji: string };
  promo_strip: { enabled: boolean; text: string; highlight: string };
  social_proof: { enabled: boolean; viewers_base: number; label: string };
  dream_section: {
    title: string;
    subtitle: string;
    cards: { title: string; desc: string; image: string; cta: string }[];
  };
  theme: {
    accent: string;
    hero_style: string;
    background?: string;
    hero_overlay?: string;
    glass_intensity?: string;
    hero_background?: string;
  };
  sections: Record<string, boolean>;
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const FALLBACK_CONFIG: SiteConfig = {
  hero: {
    badge: "RBI LSP Registered · Premium Marketplace",
    headline_line1: "Dream Big.",
    headline_highlight: "Borrow Smart.",
    headline_sub: "Personal loans up to ₹10,00,000",
    description:
      "Compare curated offers from HDFC, ICICI, Bajaj and 15+ regulated lenders — one transparent platform, zero branch visits.",
    bullet_points: [
      "Wedding, home, medical, travel — tailored loan options",
      "Rates from 10.99% p.a. — compare and choose with clarity",
      "End-to-end digital journey from eligibility to disbursal",
    ],
    cta_primary: "Get My Loan Offer",
    cta_secondary: "View Interest Rates",
    image_url: INDIAN_IMAGES.hero.customer,
    testimonial_quote:
      "Shaadi ke liye apply kiya tha — teen lenders ka offer ek screen par mila. KYC ghar baithe ho gayi, 48 ghante mein paise account mein aa gaye.",
    testimonial_author: "Priya Sharma, Pune",
    approval_card_label: "Loan Disbursed",
    approval_card_amount: "₹4,80,000",
    roi_badge: "9.99%",
    roi_badge_label: "From",
  },
  stats: [
    { value: "₹10L+", label: "Max Loan" },
    { value: "10.99%", label: "Lowest ROI" },
    { value: "5 Min", label: "Fast Approval" },
    { value: "50K+", label: "Happy Customers" },
  ],
  urgency_bar: {
    enabled: false,
    text: "",
    emoji: "",
  },
  promo_strip: {
    enabled: false,
    text: "",
    highlight: "",
  },
  social_proof: { enabled: false, viewers_base: 0, label: "" },
  dream_section: {
    title: "Your Dreams Deserve the Best Rate",
    subtitle: "Whether it's a dream wedding, your child's education, or expanding your business — we make borrowing feel effortless.",
    cards: [
      {
        title: "Dream Wedding",
        desc: "Venue, jewellery, honeymoon — fund it all",
        image: INDIAN_IMAGES.dream.wedding,
        cta: "Wedding Loan",
      },
      {
        title: "Dream Home",
        desc: "Renovation, deposit, interiors made easy",
        image: INDIAN_IMAGES.dream.home,
        cta: "Home Loan",
      },
      {
        title: "Dream Business",
        desc: "Inventory, equipment, working capital",
        image: INDIAN_IMAGES.dream.business,
        cta: "Business Loan",
      },
    ],
  },
  theme: {
    accent: "teal",
    hero_style: "premium",
    background: "glass-blue",
    hero_overlay: "sky-glass",
    glass_intensity: "high",
    hero_background: "/hero-wedding-couple.png",
  },
  sections: {
    urgency_bar: false,
    promo_strip: false,
    social_proof: false,
    dream_section: true,
    metrics_ticker: true,
    emi_calculator: true,
    testimonials: true,
  },
};

export async function fetchSiteConfig(): Promise<SiteConfig> {
  try {
    const res = await fetch(`${API_BASE}/api/cms/config`, { cache: "no-store" });
    if (!res.ok) return FALLBACK_CONFIG;
    const data = await res.json();
    return mergeConfig(data.config);
  } catch {
    return FALLBACK_CONFIG;
  }
}

export async function fetchPreviewConfig(token: string): Promise<SiteConfig> {
  const res = await fetch(`${API_BASE}/api/cms/preview?token=${encodeURIComponent(token)}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Preview load failed");
  const data = await res.json();
  return mergeConfig(data.config);
}

function mergeConfig(raw: Partial<SiteConfig>): SiteConfig {
  return {
    ...FALLBACK_CONFIG,
    ...raw,
    hero: { ...FALLBACK_CONFIG.hero, ...raw?.hero },
    theme: { ...FALLBACK_CONFIG.theme, ...raw?.theme },
    dream_section: { ...FALLBACK_CONFIG.dream_section, ...raw?.dream_section },
    sections: {
      ...FALLBACK_CONFIG.sections,
      ...raw?.sections,
      urgency_bar: false,
      promo_strip: false,
      social_proof: false,
    },
    urgency_bar: { enabled: false, text: "", emoji: "" },
    promo_strip: { enabled: false, text: "", highlight: "" },
    social_proof: { enabled: false, viewers_base: 0, label: "" },
  };
}

export async function cmsAdminChat(
  token: string,
  message: string,
  sessionId = "default",
  history: { role: "user" | "assistant"; content: string }[] = [],
) {
  const res = await fetch(`${API_BASE}/api/cms/admin/chat`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message, session_id: sessionId, history }),
  });
  if (!res.ok) throw new Error("CMS command failed");
  return res.json() as Promise<{
    reply: string;
    changes: string[];
    config: SiteConfig;
    suggestions: string[];
    image_options: { url: string; label: string }[];
    has_draft_changes: boolean;
    published: boolean;
    ai_mode: string;
    llm_enabled: boolean;
  }>;
}

export async function cmsAdminPublish(token: string) {
  const res = await fetch(`${API_BASE}/api/cms/admin/publish`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Publish failed");
  return res.json();
}

export async function cmsAdminDiscard(token: string) {
  const res = await fetch(`${API_BASE}/api/cms/admin/discard`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Discard failed");
  return res.json();
}

export async function cmsAdminStatus(token: string) {
  const res = await fetch(`${API_BASE}/api/cms/admin/status`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Status failed");
  return res.json() as Promise<{ config: SiteConfig; has_draft_changes?: boolean }>;
}

export async function cmsAdminChatLegacy(token: string, message: string) {
  return cmsAdminChat(token, message);
}

export async function cmsAdminReset(token: string) {
  const res = await fetch(`${API_BASE}/api/cms/admin/reset`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Reset failed");
  return res.json();
}
