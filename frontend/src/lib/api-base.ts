/**
 * API base URL for frontend → backend calls.
 *
 * Local dev (browser): always use same-origin `/backend` proxy (next.config rewrites)
 * so OTP/login work without CORS or wrong localhost vs 127.0.0.1 issues.
 *
 * Production: set NEXT_PUBLIC_API_URL to your API host.
 */
export function getApiBase(): string {
  const env = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

  if (typeof window !== "undefined") {
    if (process.env.NODE_ENV === "development") {
      return "/backend";
    }
    return env || "/backend";
  }

  return env || "http://127.0.0.1:8000";
}
