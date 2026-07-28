import Link from "next/link";

export function FloatingCTA() {
  return (
    <Link
      href="/apply"
      className="fixed bottom-6 right-6 z-40 hidden items-center gap-2 rounded-full border border-neercred-gold/30 bg-neercred-navy px-6 py-3.5 text-sm font-bold text-white shadow-xl transition hover:bg-neercred-teal lg:hidden"
    >
      Apply Now
    </Link>
  );
}
