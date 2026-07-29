import { HERO_PRIMARY_IMAGE, HERO_REVIEWS } from "@/lib/hero-reviews";

/**
 * Curated Indian lifestyle imagery — natural portraits, families, cities, celebrations.
 * All URLs verified against images.unsplash.com (200 OK).
 */
export const INDIAN_IMAGES = {
  hero: {
    /** Business professional — homepage hero default */
    customer: HERO_PRIMARY_IMAGE,
    skyline:
      "https://images.unsplash.com/photo-1619895862022-09114b41f16f?w=1920&h=1080&fit=crop",
  },
  lifestyle: {
    familyHome:
      "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=900&h=600&fit=crop",
    mobileIndia:
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=900&h=600&fit=crop",
    celebration:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1920&h=600&fit=crop",
    family:
      "https://images.unsplash.com/photo-1511763508683-99dc7949e97f?w=900&h=600&fit=crop",
  },
  loans: {
    personal:
      "https://images.unsplash.com/photo-1463335361701-e90f4c5045d0?w=600&h=400&fit=crop&crop=faces",
    medical:
      "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600&h=400&fit=crop",
    wedding:
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop",
    business:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&h=400&fit=crop",
    education:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop",
    travel:
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=400&fit=crop",
  },
  dream: {
    wedding:
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop",
    home: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=400&fit=crop",
    business:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&h=400&fit=crop",
  },
  testimonials: {
    priya: HERO_REVIEWS[0].image.replace("600&h=750", "200&h=200"),
    arjun: HERO_REVIEWS[1].image.replace("600&h=750", "200&h=200"),
    kavita: HERO_REVIEWS[2].image.replace("600&h=750", "200&h=200"),
    rahul: HERO_REVIEWS[3].image.replace("600&h=750", "200&h=200"),
    meera: HERO_REVIEWS[4].image.replace("600&h=750", "200&h=200"),
    vikram:
      "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=200&h=200&fit=crop&crop=faces",
  },
  trust: [
    "https://images.unsplash.com/photo-1511763508683-99dc7949e97f?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=400&h=300&fit=crop",
  ],
  howItWorks: {
    mobile:
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=260&fit=crop",
    form: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=260&fit=crop",
    compare:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=260&fit=crop",
    disbursal:
      "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=260&fit=crop",
  },
  pages: {
    loansBanner:
      "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=1920&h=600&fit=crop",
    about:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1920&h=600&fit=crop",
    platform:
      "https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=1920&h=600&fit=crop",
    security:
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1920&h=600&fit=crop",
    refer:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1920&h=600&fit=crop",
    help: "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1920&h=600&fit=crop",
    contact:
      "https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1920&h=600&fit=crop",
    trustBg:
      "https://images.unsplash.com/photo-1619895862022-09114b41f16f?w=1920&h=600&fit=crop",
    dashboard:
      "https://images.unsplash.com/photo-1619895862022-09114b41f16f?w=1920&h=1080&fit=crop",
    rates:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&h=600&fit=crop",
    partner:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1920&h=600&fit=crop",
    app: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1920&h=600&fit=crop",
    compliance:
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1920&h=600&fit=crop",
    track:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1920&h=600&fit=crop",
  },
  misc: {
    referThumb:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=200&h=200&fit=crop",
    appBanner:
      "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=400&fit=crop",
    legacyHero: HERO_PRIMARY_IMAGE,
  },
} as const;
