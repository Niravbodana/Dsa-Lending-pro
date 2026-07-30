import { Suspense } from "react";
import PreviewClient from "./PreviewClient";

export default function PreviewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-100">
          <p className="animate-pulse text-slate-500">Loading preview...</p>
        </div>
      }
    >
      <PreviewClient />
    </Suspense>
  );
}
