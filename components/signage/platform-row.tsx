import Link from "next/link";
import type { ReactNode } from "react";

import { Arrow } from "./arrow";

/**
 * A platform row: pictogram bullet, destination, its current state, and a solid
 * arrow at the right edge. Every navigable list in Packly is built from these,
 * the way a concourse board is built from departure lines.
 *
 * The bullet is a square plate rather than a roundel: it carries a pictogram,
 * which a bar-and-circle cannot, and the plate is the world's primitive. It
 * takes the same inset white rule as every other bounded plate.
 */
export function PlatformRow({
  href,
  icon,
  name,
  status,
  tally,
  attention = false,
}: {
  href: string;
  icon: ReactNode;
  name: string;
  /** Prose. Set in the reading face. */
  status?: string;
  /** A count. Set in the condensed departure-board register, tabular. */
  tally?: string;
  /** Marks the row "not done". The only thing that may turn anything red. */
  attention?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-4 border-b-2 border-hair py-4 transition-colors duration-200 ease-out hover:bg-plate/[0.04] focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-ground focus-visible:outline-none"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[3px] bg-plate text-plate-ink shadow-[inset_0_0_0_2px_var(--plate-rule)]">
        {icon}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block font-condensed text-2xl leading-none font-semibold tracking-[0.04em] uppercase">
          {name}
        </span>
        {tally ? (
          <span className="tabular mt-1.5 block font-condensed text-base leading-none font-semibold tracking-[0.08em] text-muted uppercase">
            {tally}
          </span>
        ) : (
          <span className="mt-1.5 block truncate text-sm text-muted">
            {status}
          </span>
        )}
      </span>

      {attention ? (
        <span className="shrink-0 rounded-[2px] bg-signal px-2 py-1 text-[11px] leading-none font-semibold tracking-[0.12em] text-signal-ink uppercase">
          Not done
        </span>
      ) : null}

      <Arrow className="h-5 w-5 shrink-0 transition-transform duration-200 ease-out group-hover:translate-x-1" />
    </Link>
  );
}
