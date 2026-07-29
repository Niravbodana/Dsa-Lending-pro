/**
 * Reference homepage hero — Indian lifestyle photography (Unsplash).
 */
export type HeroSlide = {
  id: string;
  alt: string;
  src: string;
};

export const HERO_CAROUSEL: HeroSlide[] = [
  {
    id: "couple-festive",
    alt: "Indian couple in traditional attire reviewing loan options together",
    src: "https://images.unsplash.com/photo-1609220136736-443aae489eca?auto=format&w=900&h=1050&fit=crop&q=80",
  },
  {
    id: "couple-wedding",
    alt: "Indian couple celebrating their dream wedding plans",
    src: "https://images.unsplash.com/photo-1589562075704-900aab769b3f?auto=format&w=900&h=1050&fit=crop&q=80",
  },
  {
    id: "couple-home",
    alt: "Indian couple comfortably planning finances at home",
    src: "https://images.unsplash.com/photo-1600880292203-4edc55e4f5c6?auto=format&w=900&h=1050&fit=crop&q=80",
  },
  {
    id: "family-indian",
    alt: "Indian family achieving their financial goals together",
    src: "https://images.unsplash.com/photo-1511763508683-99dc7949e97f?auto=format&w=900&h=1050&fit=crop&q=80",
  },
  {
    id: "professional-woman",
    alt: "Indian professional woman using digital loan services",
    src: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&w=900&h=1050&fit=crop&crop=faces&q=80",
  },
];

export const HERO_PRIMARY_IMAGE = HERO_CAROUSEL[0].src;

/** Reference homepage copy — matches mockup text exactly */
export const REFERENCE_HERO = {
  badge: "RBI REGISTERED LSP PARTNER",
  headlineLine1: "Dream Big.",
  headlineHighlight: "Borrow Smart.",
  description:
    "Get instant personal loans up to ₹10,00,000 from trusted RBI-partnered lenders at the best rates.",
  features: [
    { bold: "Instant Offers", rest: " from Top Lenders", icon: "bolt" as const },
    { bold: "100% Secure", rest: " & Digital Process", icon: "shield" as const },
    { bold: "Quick Approval", rest: " in 5 Minutes*", icon: "clock" as const },
  ],
  ctaPrimary: "Check My Eligibility",
  ctaSecondary: "How It Works",
  roiLabel: "Starting Interest Rate",
  roiRate: "9.99%",
  roiFooter: "Lowest ROI Guaranteed",
};
