/**
 * Hero + homepage business professional reviews — verified Unsplash portraits.
 */
export type HeroReview = {
  id: string;
  name: string;
  role: string;
  city: string;
  loan: string;
  quote: string;
  image: string;
};

export const HERO_REVIEWS: HeroReview[] = [
  {
    id: "ananya",
    name: "Ananya Mehta",
    role: "CA · Boutique owner",
    city: "Mumbai",
    loan: "₹4,80,000",
    quote:
      "Business expansion ke liye loan liya. Teen NBFC offers compare karke best EMI choose ki — poora process office se phone par ho gaya.",
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=750&fit=crop&crop=faces",
  },
  {
    id: "rohit",
    name: "Rohit Khanna",
    role: "Operations Manager",
    city: "Gurugram",
    loan: "₹3,10,000",
    quote:
      "Medical family emergency thi. HDFC offer same day approve hua. Rates transparent the, koi last-minute surprise charge nahi.",
    image:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&h=750&fit=crop&crop=faces",
  },
  {
    id: "kavita",
    name: "Kavita Nair",
    role: "HR Director",
    city: "Bengaluru",
    loan: "₹5,25,000",
    quote:
      "Home renovation funding ke liye ICICI select kiya. Digital KYC smooth thi — branch visit zero, disbursal 48 hours mein.",
    image:
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&h=750&fit=crop&crop=faces",
  },
  {
    id: "vikram",
    name: "Vikram Patel",
    role: "Startup Founder",
    city: "Ahmedabad",
    loan: "₹6,00,000",
    quote:
      "Working capital ke liye Bajaj aur Axis dono ke offers mile. Side-by-side compare karke tenure choose ki — professional experience.",
    image:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&h=750&fit=crop&crop=faces",
  },
  {
    id: "meera",
    name: "Meera Shah",
    role: "Finance Lead",
    city: "Pune",
    loan: "₹2,90,000",
    quote:
      "Personal loan for education fees. Eligibility 5 minute mein clear hui, documentation minimal thi. Highly recommend for salaried professionals.",
    image:
      "https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?w=600&h=750&fit=crop&crop=faces",
  },
];

export const HERO_PRIMARY_IMAGE = HERO_REVIEWS[0].image;
