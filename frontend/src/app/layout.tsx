import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist } from "next/font/google";
import "./globals.css";
import { BRAND } from "@/lib/brand";
import { CookieConsent } from "@/components/CookieConsent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: `${BRAND.appName} | Premium Digital Lending Marketplace`,
  description:
    "NeerCred — compare curated personal loans from RBI-partnered lenders. Instant eligibility, digital KYC, transparent rates up to ₹10,00,000.",
  icons: {
    icon: "/brand/neercred-icon.svg",
    apple: "/brand/neercred-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${plusJakarta.variable} antialiased`}>
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
