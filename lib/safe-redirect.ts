/**
 * Only same-origin, path-style redirects are allowed. Without this, a link like
 * `/sign-in?redirectTo=https://evil.example` turns the sign-in flow into an open
 * redirect that lands freshly authenticated users on an attacker's page.
 *
 * `//evil.example` and `/\evil.example` are rejected too — browsers read both as
 * protocol-relative absolute URLs.
 */
export function safeRedirect(
  value: string | null | undefined,
  fallback = "/dashboard",
): string {
  if (!value) return fallback;
  if (!value.startsWith("/")) return fallback;
  if (value.startsWith("//") || value.startsWith("/\\")) return fallback;

  return value;
}
