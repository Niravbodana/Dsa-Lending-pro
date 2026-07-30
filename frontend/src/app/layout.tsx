import type { Metadata } from "next";
import { Poppins, Geist } from "next/font/google";
import "./globals.css";
import { BRAND } from "@/lib/brand";
import { CookieConsent } from "@/components/CookieConsent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
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
      <body className={`${geistSans.variable} ${poppins.variable} antialiased`}>
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
