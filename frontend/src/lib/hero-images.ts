/** Single homepage hero image + reference copy */
export const HERO_IMAGE = {
  src: "https://images.unsplash.com/photo-1600880292203-4edc55e4f5c6?auto=format&w=960&h=1100&fit=crop&q=85",
  alt: "Indian couple smiling and checking loan offers on smartphone at home",
};

export const HERO_PRIMARY_IMAGE = HERO_IMAGE.src;

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
