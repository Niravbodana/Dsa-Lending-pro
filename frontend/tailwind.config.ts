import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        neercred: {
          navy: "#004B4D",
          teal: "#004B4D",
          mint: "#2DB2A2",
          cyan: "#2DB2A2",
          gold: "#D4A017",
          "gold-light": "#FDE68A",
        },
      },
      boxShadow: {
        neercred: "0 20px 50px -12px rgba(11, 18, 32, 0.18)",
        "neercred-glow": "0 0 40px -8px rgba(15, 118, 110, 0.35)",
      },
      backgroundImage: {
        "neercred-hero": "linear-gradient(135deg, #0B1220 0%, #0F766E 45%, #0891B2 100%)",
        "neercred-cta": "linear-gradient(135deg, #0B1220 0%, #134e4a 50%, #0F766E 100%)",
        "neercred-card": "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
        "neercred-page": "linear-gradient(180deg, #f8fafc 0%, #f0fdfa 40%, #f8fafc 100%)",
      },
    },
  },
  plugins: [],
} satisfies Config;
