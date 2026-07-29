import { premiumTheme } from "@/lib/premium/theme";

export const premiumContent = {
  brand: {
    name: "NeerCred",
    tagline: "Dream Big. Borrow Smart.",
    subtagline: "India's premium digital lending marketplace",
  },
  nav: [
    { href: "/", label: "Home" },
    { href: "/loans", label: "Loans" },
    { href: "/partners", label: "Partners" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ],
  hero: {
    badge: "RBI-registered LSP · Instant eligibility",
    headline: ["Dream Big.", "Borrow Smart."],
    description:
      "Compare curated personal loans up to ₹10,00,000 from regulated Indian lenders — transparent rates, digital KYC, and disbursal in as little as 48 hours.",
    ctaPrimary: { label: "Check My Eligibility", href: "/apply" },
    ctaSecondary: { label: "How It Works", href: "#process" },
    trust: [
      { label: "Instant Offers", icon: "bolt" },
      { label: "100% Secure", icon: "shield" },
      { label: "Quick Approval", icon: "check" },
    ],
    stats: [
      { value: 100, suffix: "+ Cr", prefix: "₹", label: "Loans facilitated" },
      { value: 50000, suffix: "+", prefix: "", label: "Happy customers" },
      { value: 25, suffix: "+", prefix: "", label: "Lender partners" },
      { value: 4.8, suffix: " ★", prefix: "", label: "Average rating", decimals: 1 },
    ],
    rateCard: {
      label: "Starting interest rate",
      rate: "9.99%",
      note: "Lowest EMI plans available",
    },
    heroImage:
      "https://images.unsplash.com/photo-1600880292203-4edc55e4f5c6?auto=format&w=900&h=1100&fit=crop&q=85",
    heroAlt: "Indian professionals reviewing digital loan options together",
  },
  trustStrip: {
    title: "Trusted by ambitious Indians nationwide",
    logos: ["HDFC", "ICICI", "BAJAJ", "TATA", "KOTAK", "AXIS", "SBI"],
  },
  loanCategories: [
    {
      title: "Personal Loan",
      desc: "Weddings, travel, medical — flexible tenures up to 60 months.",
      rate: "From 9.99% p.a.",
      href: "/loans",
      image:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&w=600&h=400&fit=crop&crop=faces",
    },
    {
      title: "Business Loan",
      desc: "Working capital, inventory, and expansion for MSMEs.",
      rate: "From 11.49% p.a.",
      href: "/loans",
      image:
        "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&w=600&h=400&fit=crop",
    },
    {
      title: "Home Renovation",
      desc: "Upgrade interiors, modular kitchens, and smart home setups.",
      rate: "From 10.25% p.a.",
      href: "/loans",
      image:
        "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&w=600&h=400&fit=crop",
    },
    {
      title: "Education Loan",
      desc: "Domestic and overseas courses with moratorium options.",
      rate: "From 10.99% p.a.",
      href: "/loans",
      image:
        "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&w=600&h=400&fit=crop",
    },
  ],
  whyChoose: [
    {
      title: "Regulated marketplace",
      desc: "Every lender on NeerCred is RBI-partnered or registered NBFC with audited compliance.",
      icon: "shield",
    },
    {
      title: "Smart offer engine",
      desc: "Our AI ranks offers by EMI, total cost, and approval probability — not paid placement.",
      icon: "cpu",
    },
    {
      title: "Zero branch visits",
      desc: "OTP login, eKYC, eSign, and disbursal tracking — entirely on your phone.",
      icon: "phone",
    },
    {
      title: "Transparent pricing",
      desc: "Processing fees, foreclosure charges, and APR shown upfront before you commit.",
      icon: "chart",
    },
  ],
  benefits: [
    "No hidden charges or surprise deductions",
    "Flexible tenure from 6 to 60 months",
    "Minimal documentation for salaried profiles",
    "End-to-end encrypted data pipeline",
    "Dedicated relationship manager above ₹5L",
    "24×7 WhatsApp & in-app support",
  ],
  process: [
    { step: "01", title: "Check eligibility", desc: "Share mobile, PAN, and income — get offers in 5 minutes." },
    { step: "02", title: "Compare & choose", desc: "Side-by-side EMI, rate, and lender reputation scores." },
    { step: "03", title: "Complete KYC", desc: "Aadhaar OTP, bank verification, and digital agreement." },
    { step: "04", title: "Get disbursed", desc: "Funds credited directly to your bank account." },
  ],
  features: [
    { title: "EMI calculator", desc: "Plan repayments with live rate scenarios.", href: "#emi" },
    { title: "Track application", desc: "Real-time status from submission to disbursal.", href: "/track" },
    { title: "Partner APIs", desc: "Enterprise-grade integrations for DSAs.", href: "/partner-with-us" },
    { title: "Admin insights", desc: "Commission tracking and consent audit for teams.", href: "/admin" },
  ],
  testimonials: [
    {
      name: "Ananya Mehta",
      role: "CA · Mumbai",
      quote:
        "Three NBFC offers compared in one screen. Chose the lowest APR — entire journey on my phone during lunch break.",
      image:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&w=200&h=200&fit=crop&crop=faces",
    },
    {
      name: "Rohit Khanna",
      role: "Operations Lead · Gurugram",
      quote:
        "Medical emergency funding approved same day. Rates were exactly as quoted — no last-minute surprises.",
      image:
        "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&w=200&h=200&fit=crop&crop=faces",
    },
    {
      name: "Kavita Nair",
      role: "HR Director · Bengaluru",
      quote:
        "Home renovation loan with ICICI — digital KYC was seamless. Disbursal in 48 hours as promised.",
      image:
        "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&w=200&h=200&fit=crop&crop=faces",
    },
  ],
  faq: [
    {
      q: "Is NeerCred a bank?",
      a: "NeerCred is an RBI-registered Loan Service Provider (LSP). We connect you with partner banks and NBFCs — we do not lend directly.",
    },
    {
      q: "How fast can I get funds?",
      a: "Eligible salaried applicants often receive approval within 5 minutes and disbursal within 24–48 hours after KYC.",
    },
    {
      q: "Will checking eligibility affect my credit score?",
      a: "Soft eligibility checks do not impact your CIBIL score. A hard pull occurs only after you select a lender offer.",
    },
    {
      q: "What documents are required?",
      a: "Typically PAN, Aadhaar, salary slips or ITR, and bank statements. Requirements vary by lender and loan amount.",
    },
  ],
  cta: {
    title: "Ready to borrow smarter?",
    desc: "Join 50,000+ Indians who found their best loan rate on NeerCred.",
    primary: { label: "Apply Now", href: "/apply" },
    secondary: { label: "Talk to us", href: "/contact" },
  },
  footer: {
    columns: [
      {
        title: "Product",
        links: [
          { label: "Personal Loans", href: "/loans" },
          { label: "Interest Rates", href: "/rates" },
          { label: "EMI Calculator", href: "#emi" },
          { label: "Track Loan", href: "/track" },
        ],
      },
      {
        title: "Company",
        links: [
          { label: "About", href: "/about" },
          { label: "Partners", href: "/partners" },
          { label: "Careers", href: "/contact" },
          { label: "Compliance", href: "/compliance" },
        ],
      },
      {
        title: "Support",
        links: [
          { label: "Help Center", href: "/help" },
          { label: "Contact", href: "/contact" },
          { label: "Security", href: "/security" },
          { label: "Grievance", href: "/compliance" },
        ],
      },
    ],
  },
} as const;

export { premiumTheme };
