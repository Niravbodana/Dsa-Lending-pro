import Link from "next/link";
import { IconLock, IconShield } from "@/components/icons";

/** Above-fold institutional trust — not another loan website */
export function InstitutionalTrustRow({ className = "" }: { className?: string }) {
  const items = [
    { label: "RBI LSP Registered", sub: "Regulated marketplace" },
    { label: "256-bit Encryption", sub: "Bank-grade security", href: "/security" },
    { label: "DPDP Compliant", sub: "Your data, your control", href: "/compliance" },
    { label: "No Hidden Fees", sub: "Transparent pricing" },
  ];

  return (
    <div className={`flex flex-wrap items-center justify-center gap-3 md:gap-4 ${className}`}>
      {items.map((item) => {
        const inner = (
          <>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-50 text-neercred-teal">
              {item.label.includes("Encryption") ? <IconLock size={14} /> : <IconShield size={14} />}
            </span>
            <span className="text-left">
              <span className="block text-[11px] font-bold text-neercred-navy">{item.label}</span>
              <span className="block text-[10px] text-slate-500">{item.sub}</span>
            </span>
          </>
        );
        return item.href ? (
          <Link
            key={item.label}
            href={item.href}
            className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 backdrop-blur-sm transition hover:border-teal-200 hover:shadow-sm"
          >
            {inner}
          </Link>
        ) : (
          <div
            key={item.label}
            className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 backdrop-blur-sm"
          >
            {inner}
          </div>
        );
      })}
    </div>
  );
}
