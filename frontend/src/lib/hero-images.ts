/** Hi-res wedding couple hero — faces stay clear, overlays sit at bottom edge */
export const HERO_WEDDING_SRC =
  "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&w=2400&q=95&fit=crop";

/** Single homepage hero image + reference copy */
export const HERO_IMAGE = {
  src: HERO_WEDDING_SRC,
  alt: "Indian wedding couple celebrating their special day",
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
