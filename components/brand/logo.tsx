import type { ReactNode } from "react";

/** The wordmark's type, shared with `PageLogo` so a tab name sits exactly where "Packly" does. */
export const WORDMARK_CLASS =
  "text-lg leading-none font-extrabold tracking-[-0.02em] text-ink";

/**
 * The Packly mark: a white carry-on on an emerald squircle, with the wordmark
 * beside it. `size` sets the tile; the wordmark scales from the parent's font
 * size.
 */
export function Logo({
  size = "h-9 w-9",
  wordmark = true,
}: {
  size?: string;
  wordmark?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark className={size} />
      {wordmark ? (
        <span className={WORDMARK_CLASS}>Packly</span>
      ) : null}
    </span>
  );
}

/**
 * The emerald squircle the mark sits on. Also holds a tab's icon when the
 * header names the tab instead of the app (`PageLogo`).
 */
export function LogoTile({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-[30%] bg-linear-to-br from-(--hero-from) to-(--hero-to) text-hero-ink shadow-[0_6px_14px_-6px_rgb(21_90_72/0.6)] ${className}`}
    >
      {children}
    </span>
  );
}

export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <LogoTile className={className}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.1}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
        className="h-[58%] w-[58%]"
      >
        <rect x="5" y="8.5" width="14" height="11.5" rx="2.5" />
        <path d="M9.5 8.5V5.5A1.5 1.5 0 0 1 11 4h2a1.5 1.5 0 0 1 1.5 1.5v3M5 13.5h14" />
      </svg>
    </LogoTile>
  );
}
