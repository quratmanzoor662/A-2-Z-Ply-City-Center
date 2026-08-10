/** True if URL points at a machine-local API. */
export function isLocalApiUrl(url: string): boolean {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/i.test(url.trim());
}

/**
 * Resolve API base URL.
 * - Local browser (localhost): talk to local FastAPI
 * - Any deployed host (Vercel production OR preview): ALWAYS same-origin
 *   `/api-backend` proxy — avoids CORS and never uses localhost
 */
export function getApiBaseUrl(): string {
  const fromEnv = (process.env.NEXT_PUBLIC_API_URL || "").trim().replace(/\/$/, "");

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    const onLocalDev = host === "localhost" || host === "127.0.0.1";
    if (!onLocalDev) {
      // Critical: never call a cross-origin API from the browser on Vercel.
      // NEXT_PUBLIC_API_URL is ignored here on purpose (it causes CORS).
      return "/api-backend";
    }
    return fromEnv && !isLocalApiUrl(fromEnv) ? fromEnv : fromEnv || "http://localhost:8000";
  }

  // Server-side helpers (rare for storefront now)
  if (process.env.VERCEL === "1" || process.env.NODE_ENV === "production") {
    return "/api-backend";
  }

  return fromEnv || "http://localhost:8000";
}
