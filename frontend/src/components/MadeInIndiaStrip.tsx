export function MadeInIndiaStrip() {
  return (
    <div className="border-t border-slate-800/60 bg-gradient-to-b from-slate-950 to-[#0a0f18] py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 text-center">
        <div className="flex items-center gap-4">
          <span className="hidden h-px w-16 bg-gradient-to-r from-transparent to-neercred-gold/50 sm:block" />
          <p className="text-base font-semibold tracking-wide text-white sm:text-lg">
            Made in India with <span className="text-[#FF6B6B]">❤️</span>
          </p>
          <span className="hidden h-px w-16 bg-gradient-to-l from-transparent to-neercred-gold/50 sm:block" />
        </div>
        <p className="mt-2 text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
          Built for Bharat · RBI-regulated marketplace
        </p>
        <div
          className="mt-4 flex h-1 w-28 overflow-hidden rounded-full shadow-sm"
          aria-hidden
          title="India tricolor accent"
        >
          <span className="flex-1 bg-[#FF9933]" />
          <span className="flex-1 bg-white" />
          <span className="flex-1 bg-[#138808]" />
        </div>
      </div>
    </div>
  );
}
