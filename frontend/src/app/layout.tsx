import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { BRAND } from "@/lib/brand";
import { CookieConsent } from "@/components/CookieConsent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${BRAND.name} | Personal Loan in Minutes`,
  description:
    "Compare personal loan offers from top partner banks & NBFCs. Get up to ₹5,00,000 with instant eligibility check. Fully digital, RBI LSP compliant.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased`}>
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
