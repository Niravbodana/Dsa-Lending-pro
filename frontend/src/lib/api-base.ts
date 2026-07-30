/**
 * API base URL — browser uses same-origin `/backend` proxy (see next.config rewrites)
 * to avoid CORS/CSP issues in local dev. Set NEXT_PUBLIC_API_URL in production.
 */
export function getApiBase(): string {
  const env = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (env) return env;
  if (typeof window !== "undefined") return "/backend";
  return "http://127.0.0.1:8000";
}
