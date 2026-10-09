import Link from "next/link";

import { PencilIcon } from "@/components/nav/nav-icons";
import { formatTripDates } from "@/lib/trips/dates";
import type { Trip } from "@/lib/trips/types";

/**
 * The trip a tab is showing, beside its title: "Lisbon · 12–18 Oct". Tapping
 * it edits the trip and comes back to the tab it was opened from. A long trip
 * name truncates; the dates always show in full.
 */
export function TripChip({ trip, from }: { trip: Trip; from: string }) {
  const dates = formatTripDates(trip);

  return (
    <Link
      href={`/trips/${trip.id}/edit?from=${encodeURIComponent(from)}`}
      aria-label={`Edit trip: ${trip.name}, ${dates}`}
      className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-surface py-1.5 pr-3 pl-3.5 text-sm font-semibold shadow-card transition-[scale] duration-200 ease-out-quint active:scale-95 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
    >
      <span className="truncate">{trip.name}</span>
      <span aria-hidden="true" className="text-muted">
        ·
      </span>
      <span className="tabular shrink-0 text-muted">{dates}</span>
      <PencilIcon className="ml-0.5 h-4 w-4 shrink-0 text-muted" />
    </Link>
  );
}
