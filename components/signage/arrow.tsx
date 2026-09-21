/** A solid geometric direction arrow, the way signage draws one. */
export function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <path d="M13.1 3.9 11 6.05l4.35 4.35H2.7v3.2h12.65L11 17.95l2.1 2.15 8.2-8.1z" />
    </svg>
  );
}
