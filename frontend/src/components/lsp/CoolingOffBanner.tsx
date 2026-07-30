"use client";

import { useState } from "react";
import { cancelCoolingOff } from "@/lib/api";

export function CoolingOffBanner({
  applicationId,
  sessionToken,
  coolingOffUntil,
  onCancelled,
}: {
  applicationId: number;
  sessionToken: string;
  coolingOffUntil: string;
  onCancelled?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const until = new Date(coolingOffUntil);
  const active = until > new Date();

  if (!active || done) return null;

  async function handleCancel() {
    if (!confirm("Cancel this loan within your cooling-off period? Principal + proportionate interest may apply.")) {
      return;
    }
    setLoading(true);
    try {
      await cancelCoolingOff(sessionToken, applicationId);
      setDone(true);
      onCancelled?.();
    } catch {
      alert("Could not process cancellation. Contact support.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <p className="font-semibold text-amber-900">Cooling-off period active</p>
      <p className="mt-1 text-sm text-amber-800">
        You may cancel without penalty until{" "}
        {until.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} (RBI guidelines).
      </p>
      <button
        type="button"
        onClick={() => void handleCancel()}
        disabled={loading}
        className="mt-3 rounded-xl border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-900 hover:bg-amber-100 disabled:opacity-50"
      >
        {loading ? "Processing…" : "Cancel within cooling-off"}
      </button>
    </div>
  );
}
