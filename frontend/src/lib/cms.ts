import { INDIAN_IMAGES } from "@/lib/indian-images";

export type StatItem = { value: string; label: string };

export type TestimonialItem = {
  name: string;
  city: string;
  amount: string;
  purpose: string;
  date: string;
  quote: string;
  rating: string;
  image: string;
};

export type FaqItem = { q: string; a: string };

export type CustomBlock = {
  id: string;
  text: string;
  left: number;
  top: number;
  fontSize: string;
  color: string;
  fontWeight?: string;
  backgroundColor?: string;
};

export type ElementStyles = Record<
  string,
  {
    color?: string;
    fontSize?: string;
    fontWeight?: string;
    backgroundColor?: string;
    textAlign?: "left" | "center" | "right";
    left?: number;
    top?: number;
    zIndex?: number;
  }
>;

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
  stats: StatItem[];
  urgency_bar: { enabled: boolean; text: string; emoji: string };
  promo_strip: { enabled: boolean; text: string; highlight: string };
  social_proof: { enabled: boolean; viewers_base: number; label: string };
  dream_section: {
    title: string;
    subtitle: string;
    cards: { title: string; desc: string; image: string; cta: string }[];
  };
  trust_band: { tagline: string; features: string[] };
  metrics_ticker: StatItem[];
  testimonials_section: {
    badge: string;
    title: string;
    title_highlight: string;
    subtitle: string;
    items: TestimonialItem[];
  };
  faq_section: {
    title: string;
    title_highlight: string;
    subtitle: string;
    items: FaqItem[];
  };
  cta_band: {
    badge: string;
    title: string;
    title_highlight: string;
    subtitle: string;
    image: string;
    cta_primary: string;
    cta_secondary: string;
  };
  how_it_works: {
    title: string;
    subtitle: string;
    steps: { title: string; desc: string }[];
  };
  loan_products: {
    title: string;
    cards: { title: string; rate: string; image: string }[];
  };
  business_model: {
    badge: string;
    title: string;
    subtitle: string;
    steps: { step: string; title: string; desc: string }[];
  };
  platform: {
    badge: string;
    title: string;
    subtitle: string;
    cta: string;
    phases: { phase: string; title: string; items: string[] }[];
  };
  premium_features: {
    badge: string;
    title: string;
    items: { title: string; desc: string }[];
  };
  trust_gallery: {
    title: string;
    subtitle: string;
    images: string[];
  };
  lifestyle_showcase: {
    blocks: { title: string; desc: string; image: string; cta: string; href: string }[];
  };
  app_download: {
    badge: string;
    title: string;
    subtitle: string;
    cta: string;
    image: string;
  };
  refer_banner: {
    title: string;
    subtitle: string;
    cta: string;
    image: string;
  };
  footer: {
    description: string;
    legal_note: string;
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
  element_styles?: ElementStyles;
  custom_blocks?: CustomBlock[];
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
    roi_badge: "10.99%",
    roi_badge_label: "From",
  },
  stats: [
    { value: "₹10L+", label: "Max Loan" },
    { value: "10.99%", label: "Lowest ROI" },
    { value: "5 Min", label: "Fast Approval" },
    { value: "50K+", label: "Happy Customers" },
  ],
  urgency_bar: { enabled: false, text: "", emoji: "" },
  promo_strip: { enabled: false, text: "", highlight: "" },
  social_proof: { enabled: false, viewers_base: 0, label: "" },
  dream_section: {
    title: "Your Dreams Deserve the Best Rate",
    subtitle:
      "Whether it's a dream wedding, your child's education, or expanding your business — we make borrowing feel effortless.",
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
  trust_band: {
    tagline: "Trusted by 50,000+ customers",
    features: [
      "No Hidden Charges",
      "Flexible Tenure Options",
      "Minimal Documentation",
      "End-to-End Digital Journey",
    ],
  },
  metrics_ticker: [
    { value: "15+", label: "Partner Lenders" },
    { value: "₹250Cr+", label: "Loans Facilitated" },
    { value: "5 min", label: "Avg. Approval Time" },
    { value: "4.8/5", label: "Customer Rating" },
    { value: "100%", label: "Digital KYC" },
  ],
  testimonials_section: {
    badge: "Real Customer Stories",
    title: "Bharat Bhar Ke Vishwas",
    title_highlight: "Vishwas",
    subtitle:
      "Verified reviews from customers across India — wedding, medical, business, and everyday goals.",
    items: [
      {
        name: "Priya Sharma",
        city: "Pune, Maharashtra",
        amount: "₹3,20,000",
        purpose: "Wedding expenses",
        date: "June 2026",
        quote:
          "Meri shaadi ke liye urgent funds chahiye the. Teen lenders ka offer ek hi jagah mila — ICICI ka EMI sabse kam tha.",
        rating: "5",
        image: INDIAN_IMAGES.testimonials.priya,
      },
      {
        name: "Arjun Menon",
        city: "Kochi, Kerala",
        amount: "₹1,85,000",
        purpose: "Medical emergency",
        date: "May 2026",
        quote: "Papa ki surgery ke liye raat ko apply kiya. Subah tak HDFC se approval mil gaya.",
        rating: "5",
        image: INDIAN_IMAGES.testimonials.arjun,
      },
      {
        name: "Kavita Joshi",
        city: "Jaipur, Rajasthan",
        amount: "₹4,75,000",
        purpose: "Shop expansion",
        date: "April 2026",
        quote:
          "Apni boutique ke liye working capital chahiye tha. Paperless process tha — branch gaye bina loan mil gaya.",
        rating: "4.9",
        image: INDIAN_IMAGES.testimonials.kavita,
      },
    ],
  },
  faq_section: {
    title: "Questions? We Have Answers",
    title_highlight: "We Have Answers",
    subtitle: "Full transparency — no hidden charges",
    items: [
      {
        q: "Does Neer Loan Solutions lend money directly?",
        a: "No. We are a Loan Service Provider (LSP). We connect you with partner banks and NBFCs.",
      },
      {
        q: "How much loan can I get?",
        a: "Personal loans from ₹50,000 up to ₹5,00,000 depending on your income and credit profile.",
      },
      {
        q: "How long does approval take?",
        a: "Eligibility check takes 2–5 minutes. Final approval is usually same day or within 24 hours.",
      },
      {
        q: "What documents are required?",
        a: "Mobile number, PAN, and basic details. Full digital KYC includes Aadhaar OTP and bank verification.",
      },
      {
        q: "What are the interest rates?",
        a: "Rates start from 10.99% with partner lenders. You receive multiple offers and choose the best.",
      },
      {
        q: "Is there a prepayment penalty?",
        a: "It depends on the lender. Many partners offer zero foreclosure charges — shown in each offer.",
      },
    ],
  },
  cta_band: {
    badge: "Institutional-grade lending",
    title: "Compare offers with confidence",
    title_highlight: "confidence",
    subtitle:
      "Select from regulated partner lenders, review terms transparently, and complete your application entirely online.",
    image: INDIAN_IMAGES.lifestyle.celebration,
    cta_primary: "Start Application",
    cta_secondary: "Explore Loan Types",
  },
  how_it_works: {
    title: "How It Works",
    subtitle: "From application to disbursal — fully digital",
    steps: [
      { title: "Apply Online", desc: "Enter mobile, verify OTP, share basic details" },
      { title: "Check Eligibility", desc: "Instant eligibility across partner lenders" },
      { title: "Compare Offers", desc: "Side-by-side rates, EMI, and tenure" },
      { title: "Complete KYC", desc: "Aadhaar OTP, bank verify, eSign — from home" },
    ],
  },
  loan_products: {
    title: "Loans for Every Life Goal",
    cards: [
      { title: "Personal", rate: "10.99%", image: INDIAN_IMAGES.loans.personal },
      { title: "Medical", rate: "11.49%", image: INDIAN_IMAGES.loans.medical },
      { title: "Wedding", rate: "11.99%", image: INDIAN_IMAGES.loans.wedding },
      { title: "Business", rate: "12.49%", image: INDIAN_IMAGES.loans.business },
    ],
  },
  business_model: {
    badge: "Business Model",
    title: "Personal Loan Marketplace",
    subtitle: "Connect customers with multiple lenders. Earn commission on every disbursal.",
    steps: [
      { step: "01", title: "Customer Visits", desc: "Discovers Neer Loan Solutions" },
      { step: "02", title: "Basic Details", desc: "OTP-verified profile capture" },
      { step: "03", title: "Partner APIs", desc: "Parallel lender offer engine" },
      { step: "04", title: "Best Offers", desc: "AI-ranked comparison UI" },
      { step: "05", title: "Select & KYC", desc: "Digital verification & eSign" },
      { step: "06", title: "Disbursal", desc: "Direct to customer account" },
    ],
  },
  platform: {
    badge: "Platform",
    title: "Enterprise-Grade Architecture",
    subtitle: "Six-phase product roadmap — from lead capture to admin analytics. Built for scale.",
    cta: "View Platform Details",
    phases: [
      { phase: "Phase 1", title: "Lead Capture", items: ["OTP login", "PAN validation", "Consent & disclosure", "Lead database"] },
      { phase: "Phase 2", title: "Offer Engine", items: ["Partner API integration", "Parallel offer fetch", "Best-deal ranking", "Offer selection"] },
      { phase: "Phase 3", title: "KYC Flow", items: ["Aadhaar eKYC", "Bank penny drop", "Document upload", "Digital eSign"] },
      { phase: "Phase 4", title: "Processing", items: ["Status tracking", "Partner webhooks", "SMS notifications", "Disbursal alerts"] },
      { phase: "Phase 5", title: "Dashboard", items: ["User portal", "EMI schedule", "Neer AI assistant", "Agreement download"] },
      { phase: "Phase 6", title: "Admin & Scale", items: ["Lead funnel analytics", "Commission reports", "Fraud rules", "Role-based access"] },
    ],
  },
  premium_features: {
    badge: "Differentiators",
    title: "Built Beyond Standard Marketplaces",
    items: [
      { title: "AI Offer Recommendations", desc: "Neer AI ranks offers by your profile and repayment capacity." },
      { title: "Pre-Approved Offers", desc: "Soft-pull eligibility signals for faster decisions." },
      { title: "Instant Approval Score", desc: "Real-time probability engine before you apply." },
      { title: "Smart Lead Scoring", desc: "ML-powered lead quality for partner lenders." },
      { title: "Fraud Detection", desc: "Multi-layer verification and anomaly monitoring." },
      { title: "WhatsApp Tracking", desc: "Status updates and support on WhatsApp." },
    ],
  },
  trust_gallery: {
    title: "Trusted by Thousands Across India",
    subtitle: "From Mumbai to Delhi — professionals, families, and entrepreneurs trust Neer Loan Solutions.",
    images: [...INDIAN_IMAGES.trust],
  },
  lifestyle_showcase: {
    blocks: [
      {
        title: "Home, Wedding, Dreams — All Possible",
        desc: "Neer Loan Solutions connects you with India's trusted banks and NBFCs. Compare offers, choose the best rate, and receive funds directly in your account.",
        image: INDIAN_IMAGES.lifestyle.familyHome,
        cta: "Explore Loans",
        href: "/loans",
      },
      {
        title: "100% Digital. Zero Branch Visits.",
        desc: "OTP login, Aadhaar eKYC, bank verification, digital eSign — the entire process from your phone. Get approved from home.",
        image: INDIAN_IMAGES.lifestyle.mobileIndia,
        cta: "Start Application",
        href: "/apply",
      },
    ],
  },
  app_download: {
    badge: "Mobile App — Coming Soon",
    title: "Neer Loan App — Loans in Your Pocket",
    subtitle: "Track applications, compare offers, EMI calculator — all in one premium app. Launching Q3 2026.",
    cta: "Join Waitlist →",
    image: INDIAN_IMAGES.misc.appBanner,
  },
  refer_banner: {
    title: "Refer & Earn",
    subtitle: "Earn rewards on every successful referral disbursal",
    cta: "View Program",
    image: INDIAN_IMAGES.misc.referThumb,
  },
  footer: {
    description: "India's premium personal loan marketplace. Compare offers from 15+ regulated partner banks and NBFCs.",
    legal_note: "Licensed marketplace · Regulated partners only",
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
    cta_band: true,
    faq: true,
    how_it_works: true,
    loan_products: true,
  },
  element_styles: {},
  custom_blocks: [],
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

export function mergeConfigFromApi(raw: Partial<SiteConfig>): SiteConfig {
  return mergeConfig(raw);
}

function mergeConfig(raw: Partial<SiteConfig>): SiteConfig {
  return {
    ...FALLBACK_CONFIG,
    ...raw,
    hero: { ...FALLBACK_CONFIG.hero, ...raw?.hero },
    theme: { ...FALLBACK_CONFIG.theme, ...raw?.theme },
    dream_section: { ...FALLBACK_CONFIG.dream_section, ...raw?.dream_section },
    trust_band: { ...FALLBACK_CONFIG.trust_band, ...raw?.trust_band },
    testimonials_section: {
      ...FALLBACK_CONFIG.testimonials_section,
      ...raw?.testimonials_section,
      items: raw?.testimonials_section?.items?.length
        ? raw.testimonials_section.items
        : FALLBACK_CONFIG.testimonials_section.items,
    },
    faq_section: {
      ...FALLBACK_CONFIG.faq_section,
      ...raw?.faq_section,
      items: raw?.faq_section?.items?.length ? raw.faq_section.items : FALLBACK_CONFIG.faq_section.items,
    },
    cta_band: { ...FALLBACK_CONFIG.cta_band, ...raw?.cta_band },
    how_it_works: {
      ...FALLBACK_CONFIG.how_it_works,
      ...raw?.how_it_works,
      steps: raw?.how_it_works?.steps?.length ? raw.how_it_works.steps : FALLBACK_CONFIG.how_it_works.steps,
    },
    loan_products: {
      ...FALLBACK_CONFIG.loan_products,
      ...raw?.loan_products,
      cards: raw?.loan_products?.cards?.length ? raw.loan_products.cards : FALLBACK_CONFIG.loan_products.cards,
    },
    business_model: {
      ...FALLBACK_CONFIG.business_model,
      ...raw?.business_model,
      steps: raw?.business_model?.steps?.length ? raw.business_model.steps : FALLBACK_CONFIG.business_model.steps,
    },
    platform: {
      ...FALLBACK_CONFIG.platform,
      ...raw?.platform,
      phases: raw?.platform?.phases?.length ? raw.platform.phases : FALLBACK_CONFIG.platform.phases,
    },
    premium_features: {
      ...FALLBACK_CONFIG.premium_features,
      ...raw?.premium_features,
      items: raw?.premium_features?.items?.length ? raw.premium_features.items : FALLBACK_CONFIG.premium_features.items,
    },
    trust_gallery: {
      ...FALLBACK_CONFIG.trust_gallery,
      ...raw?.trust_gallery,
      images: raw?.trust_gallery?.images?.length ? raw.trust_gallery.images : FALLBACK_CONFIG.trust_gallery.images,
    },
    lifestyle_showcase: {
      ...FALLBACK_CONFIG.lifestyle_showcase,
      ...raw?.lifestyle_showcase,
      blocks: raw?.lifestyle_showcase?.blocks?.length
        ? raw.lifestyle_showcase.blocks
        : FALLBACK_CONFIG.lifestyle_showcase.blocks,
    },
    app_download: { ...FALLBACK_CONFIG.app_download, ...raw?.app_download },
    refer_banner: { ...FALLBACK_CONFIG.refer_banner, ...raw?.refer_banner },
    footer: { ...FALLBACK_CONFIG.footer, ...raw?.footer },
    stats: raw?.stats?.length ? raw.stats : FALLBACK_CONFIG.stats,
    metrics_ticker: raw?.metrics_ticker?.length ? raw.metrics_ticker : FALLBACK_CONFIG.metrics_ticker,
    urgency_bar: { ...FALLBACK_CONFIG.urgency_bar, ...raw?.urgency_bar },
    promo_strip: { ...FALLBACK_CONFIG.promo_strip, ...raw?.promo_strip },
    social_proof: { ...FALLBACK_CONFIG.social_proof, ...raw?.social_proof },
    sections: { ...FALLBACK_CONFIG.sections, ...raw?.sections },
    element_styles: { ...FALLBACK_CONFIG.element_styles, ...raw?.element_styles },
    custom_blocks: raw?.custom_blocks?.length ? raw.custom_blocks : FALLBACK_CONFIG.custom_blocks,
  };
}

export async function cmsAdminSaveDraft(token: string, config: SiteConfig) {
  const res = await fetch(`${API_BASE}/api/cms/admin/draft`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ config }),
  });
  if (!res.ok) throw new Error("Save draft failed");
  return res.json();
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
