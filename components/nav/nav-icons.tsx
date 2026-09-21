import type { SVGProps } from "react";

/**
 * Authored icon set for the bottom tab bar. Drawn on one 24px grid with a
 * single 1.75 stroke, round caps and round joins, so the four read as one
 * family. Any icon added later has to match those values or the set breaks.
 */
function Icon({ children, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

/** A day of the trip: sun over a horizon, not a generic house. */
export function TodayIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="10.2" r="3.6" />
      <path d="M12 3v1.5M19.5 10.2H18M6 10.2H4.5M17.3 4.9l-1 1M6.7 4.9l1 1" />
      {/* One horizon line, not two — a second reads as a slider track at 20px. */}
      <path d="M3.2 18.2h17.6" />
    </Icon>
  );
}

/** Packing: a case with a handle and a centre clasp. */
export function PackingIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <rect x="3.2" y="7.6" width="17.6" height="12.6" rx="2.6" />
      <path d="M8.6 7.6V5.7a1.7 1.7 0 0 1 1.7-1.7h3.4a1.7 1.7 0 0 1 1.7 1.7v1.9" />
      <path d="M12 11.6v4.6" />
    </Icon>
  );
}

/** Outfits: a tee, the one garment that reads at 20px. */
export function OutfitIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M8.9 3.6 4.5 6a.9.9 0 0 0-.4 1.1l1.2 3a.9.9 0 0 0 1.1.5l1.3-.4v9.5a.8.8 0 0 0 .8.8h7a.8.8 0 0 0 .8-.8v-9.5l1.3.4a.9.9 0 0 0 1.1-.5l1.2-3a.9.9 0 0 0-.4-1.1l-4.4-2.4a3.2 3.2 0 0 1-6.2 0Z" />
    </Icon>
  );
}

/** Food: fork and knife, the least ambiguous meal mark at this size. */
export function FoodIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M6.2 3.4v4.2a2.6 2.6 0 0 0 5.2 0V3.4" />
      <path d="M8.8 3.4v4.2" />
      <path d="M8.8 10.2v10.4" />
      <path d="M16.9 3.4v17.2" />
      <path d="M16.9 3.4c2.3 2.2 3 5.6 1.7 8-.3.5-.9.9-1.7.9" />
    </Icon>
  );
}
