import type { SVGProps } from "react";

import { RoundelMark } from "@/components/signage/roundel";

/**
 * Pictograms in the AIGA/DOT register: filled silhouettes on a 24px grid, no
 * strokes, high contrast, legible small and in sun. A new pictogram is drawn as
 * a solid shape or the set breaks — a thin-stroke icon among these reads as a
 * mistake.
 */
function Glyph({ children, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

/** Today is the station itself: the bar-and-circle. */
export function TodayIcon(props: SVGProps<SVGSVGElement>) {
  return <RoundelMark className={props.className} />;
}

/** Baggage, drawn the way a concourse draws it. */
export function PackingIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="M9.4 3.4h5.2a2 2 0 0 1 2 2v2.1h-2.1V6a.6.6 0 0 0-.6-.6H10.1a.6.6 0 0 0-.6.6v1.5H7.4V5.4a2 2 0 0 1 2-2Z" />
      <path d="M3.5 8.7h17a1 1 0 0 1 1 1v9.4a1.5 1.5 0 0 1-1.5 1.5H4a1.5 1.5 0 0 1-1.5-1.5V9.7a1 1 0 0 1 1-1Z" />
    </Glyph>
  );
}

/** The garment, as a solid tee. */
export function OutfitIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="M8.9 3.4 4.2 6a1 1 0 0 0-.44 1.25l1.3 3.3a1 1 0 0 0 1.25.58l1.29-.45v9.02a.9.9 0 0 0 .9.9h7.2a.9.9 0 0 0 .9-.9v-9.02l1.29.45a1 1 0 0 0 1.25-.58l1.3-3.3A1 1 0 0 0 19.8 6l-4.7-2.6a3.3 3.3 0 0 1-6.2 0Z" />
    </Glyph>
  );
}

/** Restaurant: fork and knife, filled. */
export function FoodIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="M6.3 2.7h1.5v4.4h.9V2.7h1.5v4.4h.9V2.7h1.5v5.2a2.5 2.5 0 0 1-1.75 2.38V20.5a1.15 1.15 0 0 1-2.3 0V10.28A2.5 2.5 0 0 1 6.3 7.9Z" />
      <path d="M16.4 2.7c2.2 1.9 3.15 4.9 2.5 7.6-.2.82-.95 1.4-1.8 1.4h-.3v8.8a1.15 1.15 0 0 1-2.3 0V3.6c0-.86 1.05-1.3 1.68-.72Z" />
    </Glyph>
  );
}
