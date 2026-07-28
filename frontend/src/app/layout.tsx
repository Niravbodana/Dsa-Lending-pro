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
  title: `${BRAND.appName} | ${BRAND.legalName} — Personal Loan in Minutes`,
  description:
    "NeerCred by Neer Loan Solutions — compare personal loan offers from top partner banks & NBFCs. Up to ₹5,00,000, instant eligibility, RBI LSP compliant.",
  icons: {
    icon: "/neercred-icon.svg",
    apple: "/neercred-icon.svg",
  },
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
