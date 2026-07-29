export type ElementStyle = {
  color?: string;
  fontSize?: string;
  fontWeight?: string;
  backgroundColor?: string;
  textAlign?: "left" | "center" | "right";
  left?: number;
  top?: number;
  zIndex?: number;
};

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

export const EDITABLE_LAYERS: { path: string; label: string; group: string }[] = [
  { path: "hero.badge", label: "Hero badge", group: "Hero" },
  { path: "hero.headline_line1", label: "Headline line 1", group: "Hero" },
  { path: "hero.headline_highlight", label: "Headline highlight", group: "Hero" },
  { path: "hero.headline_sub", label: "Sub headline", group: "Hero" },
  { path: "hero.description", label: "Description", group: "Hero" },
  { path: "hero.cta_primary", label: "Primary button", group: "Hero" },
  { path: "hero.cta_secondary", label: "Secondary button", group: "Hero" },
  { path: "hero.roi_badge", label: "ROI rate", group: "Hero" },
  { path: "hero.approval_card_amount", label: "Approval amount", group: "Hero" },
  { path: "trust_band.tagline", label: "Trust tagline", group: "Trust" },
  { path: "dream_section.title", label: "Dream title", group: "Dream" },
  { path: "dream_section.subtitle", label: "Dream subtitle", group: "Dream" },
  { path: "cta_band.title", label: "CTA title", group: "CTA" },
  { path: "cta_band.subtitle", label: "CTA subtitle", group: "CTA" },
  { path: "testimonials_section.title", label: "Testimonials title", group: "Reviews" },
  { path: "faq_section.title", label: "FAQ title", group: "FAQ" },
];
