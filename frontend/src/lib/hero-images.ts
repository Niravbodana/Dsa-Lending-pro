/**
 * Reference homepage hero — Indian couple / lifestyle (Unsplash).
 * First slide matches reference: couple at home with phone.
 */
export type HeroSlide = {
  id: string;
  alt: string;
  src: string;
};

export const HERO_CAROUSEL: HeroSlide[] = [
  {
    id: "couple-couch",
    alt: "Indian couple smiling and checking loan offers on smartphone at home",
    src: "https://images.unsplash.com/photo-1600880292203-4edc55e4f5c6?auto=format&w=960&h=1100&fit=crop&q=85",
  },
  {
    id: "couple-festive",
    alt: "Indian couple in traditional attire planning their dream loan",
    src: "https://images.unsplash.com/photo-1609220136736-443aae489eca?auto=format&w=960&h=1100&fit=crop&q=85",
  },
  {
    id: "couple-wedding",
    alt: "Indian couple celebrating wedding plans together",
    src: "https://images.unsplash.com/photo-1589562075704-900aab769b3f?auto=format&w=960&h=1100&fit=crop&q=85",
  },
  {
    id: "family-indian",
    alt: "Indian family achieving financial goals together",
    src: "https://images.unsplash.com/photo-1511763508683-99dc7949e97f?auto=format&w=960&h=1100&fit=crop&q=85",
  },
  {
    id: "mobile-india",
    alt: "Indian customers using digital loan services on mobile",
    src: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&w=960&h=1100&fit=crop&q=85",
  },
];

export const HERO_PRIMARY_IMAGE = HERO_CAROUSEL[0].src;

/** Exact copy from reference mockup */
export const REFERENCE_HERO = {
  badge: "RBI REGISTERED LSP PARTNER",
  headlineLine1: "Dream Big.",
  headlineHighlight: "Borrow Smart.",
  description:
    "Get instant personal loans up to ₹10,00,000 from trusted RBI-partnered lenders at the best rates.",
  features: [
    { text: "Instant Offers from Top Lenders", icon: "bolt" as const },
    { text: "100% Secure & Digital Process", icon: "shield" as const },
    { text: "Quick Approval in 5 Minutes*", icon: "clock" as const },
  ],
  ctaPrimary: "Check My Eligibility",
  ctaSecondary: "How It Works",
  roiLabel: "Starting Interest Rate",
  roiRate: "9.99%",
  roiFooter: "Lowest ROI Guaranteed",
};
