"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { HomePage } from "@/components/HomePage";
import { fetchPreviewConfig, type SiteConfig } from "@/lib/cms";

export default function PreviewClient() {
  const params = useSearchParams();
  const token = params.get("token") || "";
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Missing preview token");
      return;
    }
    void fetchPreviewConfig(token)
      .then(setConfig)
      .catch(() => setError("Could not load preview"));
    const interval = setInterval(() => {
      void fetchPreviewConfig(token).then(setConfig).catch(() => undefined);
    }, 3000);
    return () => clearInterval(interval);
  }, [token]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 p-8 text-center">
        <p className="text-slate-600">{error}</p>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <p className="animate-pulse text-slate-500">Loading preview...</p>
      </div>
    );
  }

  return <HomePage previewConfig={config} isPreview />;
}
