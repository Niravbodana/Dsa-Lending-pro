type Props = {
  className?: string;
};

export function Skeleton({ className = "" }: Props) {
  return <div className={`animate-pulse rounded-xl bg-slate-200/80 ${className}`} aria-hidden />;
}

export function SkeletonText({ lines = 3, className = "" }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={`h-3 ${i === lines - 1 ? "w-2/3" : "w-full"}`} />
      ))}
    </div>
  );
}

export function OfferCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-neercred">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-20 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-8 w-16" />
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3">
        <Skeleton className="h-14" />
        <Skeleton className="h-14" />
        <Skeleton className="h-14" />
      </div>
      <Skeleton className="mt-5 h-11 w-full rounded-xl" />
    </div>
  );
}

export function DashboardStatSkeleton() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <Skeleton className="mb-3 h-9 w-9 rounded-xl bg-white/20" />
      <Skeleton className="h-8 w-12 bg-white/20" />
      <Skeleton className="mt-2 h-3 w-16 bg-white/20" />
    </div>
  );
}

export function PageLoadingShell({
  title = "Loading",
  subtitle,
  dark = false,
}: {
  title?: string;
  subtitle?: string;
  dark?: boolean;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
      <div
        className={`h-10 w-10 animate-spin rounded-full border-2 border-t-transparent ${
          dark ? "border-neercred-gold" : "border-neercred-teal"
        }`}
      />
      <p className={`mt-4 text-sm font-semibold ${dark ? "text-white" : "text-neercred-navy"}`}>{title}</p>
      {subtitle && <p className={`mt-1 text-xs ${dark ? "text-white/60" : "text-slate-500"}`}>{subtitle}</p>}
    </div>
  );
}
