/**
 * Homepage hero carousel — Indian professional & lifestyle photography.
 */
export type HeroSlide = {
  id: string;
  alt: string;
  src: string;
};

export const HERO_CAROUSEL: HeroSlide[] = [
  {
    id: "couple-festive",
    alt: "Indian couple in festive attire planning their dream loan together",
    src: "https://images.unsplash.com/photo-1609220136736-443aae489eca?w=720&h=860&fit=crop",
  },
  {
    id: "couple-home",
    alt: "Indian couple reviewing finances comfortably at home",
    src: "https://images.unsplash.com/photo-1600880292203-4edc55e4f5c6?w=720&h=860&fit=crop",
  },
  {
    id: "family-celebration",
    alt: "Indian family celebrating a milestone together",
    src: "https://images.unsplash.com/photo-1511763508683-99dc7949e97f?w=720&h=860&fit=crop",
  },
  {
    id: "professional-woman",
    alt: "Indian professional woman managing her personal loan digitally",
    src: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=720&h=860&fit=crop&crop=faces",
  },
  {
    id: "professional-man",
    alt: "Indian business professional comparing loan offers on mobile",
    src: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=720&h=860&fit=crop&crop=faces",
  },
];

export const HERO_PRIMARY_IMAGE = HERO_CAROUSEL[0].src;
