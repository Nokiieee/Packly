import type { ReactNode } from "react";

/**
 * The bar-and-circle: a ring crossed by a horizontal bar, with the name set on
 * the bar. The identity device of the whole system — used as the app's mark on
 * the header plate and as the "Today" tab pictogram.
 */
export function Roundel({
  children,
  className = "",
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <RoundelMark className="h-[1.15em] w-[1.15em] shrink-0" />
      {children ? (
        <span className="text-[0.78em] leading-none font-semibold tracking-[0.22em] uppercase">
          {children}
        </span>
      ) : null}
    </span>
  );
}

/** The mark alone, as a filled annulus crossed by a bar. */
export function RoundelMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M12 2.6a9.4 9.4 0 1 0 0 18.8 9.4 9.4 0 0 0 0-18.8Zm0 3.5a5.9 5.9 0 1 1 0 11.8 5.9 5.9 0 0 1 0-11.8Z"
      />
      <rect x="1.4" y="10.15" width="21.2" height="3.7" />
    </svg>
  );
}
