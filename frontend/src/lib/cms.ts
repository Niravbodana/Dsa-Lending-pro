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
    headline_sub: "Up to ₹10,00,000 — approved in 5 minutes.",
    description:
      "Neer Loan Solutions brings you personalized offers from HDFC, ICICI, Bajaj & 15+ trusted lenders.",
    bullet_points: [
      "Wedding, home, medical, travel — every dream funded",
      "Lowest ROI from 10.99% — compare & choose",
      "100% digital — OTP to disbursal on your phone",
    ],
    cta_primary: "Get My Loan Offer — Free",
    cta_secondary: "Check Eligibility",
    image_url:
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&h=750&fit=crop&crop=faces",
    testimonial_quote: "₹5 lakh approved while I was having chai!",
    testimonial_author: "Rahul Mehta, Bangalore",
    approval_card_label: "Just Approved",
    approval_card_amount: "₹4,80,000",
    roi_badge: "10.99%",
    roi_badge_label: "Starting ROI",
  },
  stats: [
    { value: "₹10L+", label: "Max Loan" },
    { value: "10.99%", label: "Lowest ROI" },
    { value: "5 Min", label: "Fast Approval" },
    { value: "50K+", label: "Happy Customers" },
  ],
  urgency_bar: {
    enabled: true,
    text: "847 people applied for a loan today",
    emoji: "🔥",
  },
  promo_strip: {
    enabled: true,
    text: "ZERO processing fee on first loan — Offer ends soon",
    highlight: "ZERO processing fee",
  },
  social_proof: { enabled: true, viewers_base: 142, label: "people comparing loan offers right now" },
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
    urgency_bar: true,
    promo_strip: true,
    social_proof: true,
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
    return { ...FALLBACK_CONFIG, ...data.config };
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
