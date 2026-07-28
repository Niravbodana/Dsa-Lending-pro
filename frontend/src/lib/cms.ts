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
  theme: { accent: string; hero_style: string };
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
    image_url:
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&h=750&fit=crop&crop=faces",
    testimonial_quote: "The process was seamless — offer selected, KYC done, and funds credited within 48 hours.",
    testimonial_author: "Rahul Mehta, Bengaluru",
    approval_card_label: "Loan Disbursed",
    approval_card_amount: "₹4,80,000",
    roi_badge: "10.99%",
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
        image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop",
        cta: "Wedding Loan",
      },
      {
        title: "Dream Home",
        desc: "Renovation, deposit, interiors made easy",
        image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop",
        cta: "Home Loan",
      },
      {
        title: "Dream Business",
        desc: "Inventory, equipment, working capital",
        image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&h=400&fit=crop",
        cta: "Business Loan",
      },
    ],
  },
  theme: { accent: "teal", hero_style: "premium" },
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
    const merged: SiteConfig = {
      ...FALLBACK_CONFIG,
      ...data.config,
      hero: { ...FALLBACK_CONFIG.hero, ...data.config?.hero },
      sections: {
        ...FALLBACK_CONFIG.sections,
        ...data.config?.sections,
        urgency_bar: false,
        promo_strip: false,
        social_proof: false,
      },
      urgency_bar: { enabled: false, text: "", emoji: "" },
      promo_strip: { enabled: false, text: "", highlight: "" },
      social_proof: { enabled: false, viewers_base: 0, label: "" },
    };
    return merged;
  } catch {
    return FALLBACK_CONFIG;
  }
}

export async function cmsAdminChat(token: string, message: string) {
  const res = await fetch(`${API_BASE}/api/cms/admin/chat`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error("CMS command failed");
  return res.json() as Promise<{ reply: string; changes: string[]; config: SiteConfig }>;
}

export async function cmsAdminReset(token: string) {
  const res = await fetch(`${API_BASE}/api/cms/admin/reset`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Reset failed");
  return res.json();
}
