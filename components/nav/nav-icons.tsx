import type { SVGProps } from "react";

/**
 * Rounded outline icons on a 24px grid, 1.75px stroke, each with a soft duotone
 * body. The body sits at low opacity by default and fills solid when an
 * ancestor carries `data-active` — the iOS convention of an outlined tab that
 * turns filled when selected. A new icon keeps the same stroke, caps and body,
 * or the set breaks.
 */
function Glyph({ children, ...props }: SVGProps<SVGSVGElement>) {
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

/** The duotone body. Opacity is driven from CSS so the active state can fill it. */
function Body(props: SVGProps<SVGPathElement>) {
  return (
    <path
      {...props}
      fill="currentColor"
      stroke="none"
      className="opacity-[0.16] transition-opacity duration-200 ease-out in-data-active:opacity-100"
    />
  );
}

/** Today: a sun just clearing the horizon. */
export function TodayIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <Body d="M6.5 16.5a5.5 5.5 0 0 1 11 0Z" />
      <path d="M6.5 16.5a5.5 5.5 0 0 1 11 0" />
      <path d="M3 16.5h18M12 4.5v2M5.3 7.8l1.4 1.4M18.7 7.8l-1.4 1.4M7 20h10" />
    </Glyph>
  );
}

/** Packing: a carry-on with its handle up. */
export function PackingIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <Body d="M7 8.5h10a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7.5a2 2 0 0 1 2-2Z" />
      <rect x="5" y="8.5" width="14" height="11.5" rx="2" />
      <path d="M9.5 8.5V5.5a1.5 1.5 0 0 1 1.5-1.5h2a1.5 1.5 0 0 1 1.5 1.5v3M9 12v4.5M15 12v4.5" />
    </Glyph>
  );
}

/** Outfits: a tee. */
export function OutfitIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <Body d="M9 4 4.5 6.5 6 10.5l2-.8V19a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V9.7l2 .8 1.5-4L15 4a3 3 0 0 1-6 0Z" />
      <path d="M9 4 4.5 6.5 6 10.5l2-.8V19a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V9.7l2 .8 1.5-4L15 4a3 3 0 0 1-6 0Z" />
    </Glyph>
  );
}

/** Food: a bowl with steam. */
export function FoodIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <Body d="M4 12.5h16a8 8 0 0 1-16 0Z" />
      <path d="M4 12.5h16a8 8 0 0 1-16 0ZM9 20.2h6" />
      <path d="M9 9c-.8-1 .8-2 0-3.5M12.5 9c-.8-1 .8-2 0-3.5M16 9c-.8-1 .8-2 0-3.5" />
    </Glyph>
  );
}

export function ChevronRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph strokeWidth={2} {...props}>
      <path d="m9.5 6 6 6-6 6" />
    </Glyph>
  );
}

export function ArrowRightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph strokeWidth={2} {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Glyph>
  );
}

export function PlusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph strokeWidth={2} {...props}>
      <path d="M12 5v14M5 12h14" />
    </Glyph>
  );
}

export function MinusIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph strokeWidth={2} {...props}>
      <path d="M5 12h14" />
    </Glyph>
  );
}

export function CheckIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph strokeWidth={2.5} {...props}>
      <path d="m5.5 12.5 4 4 9-9" />
    </Glyph>
  );
}

export function SignOutIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Glyph {...props}>
      <path d="M10 4H6.5A1.5 1.5 0 0 0 5 5.5v13A1.5 1.5 0 0 0 6.5 20H10M15 16l4-4-4-4M19 12H9" />
    </Glyph>
  );
}
