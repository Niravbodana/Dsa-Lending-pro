import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BRAND } from "@/lib/brand";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconFile } from "@/components/icons";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-teal-50/30">
      <Header />
      <div className="mx-auto max-w-lg px-4 py-20">
        <EmptyState
          icon={<IconFile size={28} className="text-neercred-teal" />}
          title="This page doesn't exist"
          description={`The link may be outdated or mistyped. ${BRAND.appName} is here to help you with loans — let's get you back on track.`}
          action={{ label: "Go to homepage", href: "/" }}
          secondaryAction={{ label: "Apply for a loan", href: "/apply" }}
        />
        <p className="mt-6 text-center">
          <Link href="/help" className="text-sm font-medium text-neercred-teal hover:underline">
            Visit help center →
          </Link>
        </p>
      </div>
      <Footer />
    </main>
  );
}
