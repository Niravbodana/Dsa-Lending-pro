/** RBI LSP disclosure — NeerCred is marketplace, RE is the lender */
export function LspDisclosure({
  lenderName,
  compact = false,
  className = "",
}: {
  lenderName?: string;
  compact?: boolean;
  className?: string;
}) {
  if (compact) {
    return (
      <p className={`text-[11px] leading-relaxed text-slate-500 ${className}`}>
        <span className="font-semibold text-slate-600">NeerCred</span> is an RBI-registered LSP (marketplace).
        {lenderName ? (
          <>
            {" "}
            Loan by <span className="font-semibold text-neercred-navy">{lenderName}</span> (Regulated Entity).
          </>
        ) : (
          " Loans are sanctioned by partner banks/NBFCs, not by NeerCred."
        )}
      </p>
    );
  }

  return (
    <div className={`rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 ${className}`}>
      <p className="text-xs font-bold uppercase tracking-wide text-neercred-teal">LSP disclosure</p>
      <p className="mt-1 text-sm leading-relaxed text-slate-600">
        NeerCred is an RBI-registered Loan Service Provider. We compare offers from regulated lenders — we do not
        lend money ourselves.
        {lenderName && (
          <>
            {" "}
            This offer is from <strong className="text-neercred-navy">{lenderName}</strong>, who will sanction and
            disburse the loan.
          </>
        )}
      </p>
    </div>
  );
}
