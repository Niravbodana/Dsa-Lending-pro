import Link from "next/link";

export function FloatingCTA() {
  return (
    <Link
      href="/apply"
      className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-6 py-4 font-extrabold text-slate-900 shadow-2xl shadow-amber-500/30 transition hover:scale-105 lg:hidden"
    >
      Apply Now →
    </Link>
  );
}
