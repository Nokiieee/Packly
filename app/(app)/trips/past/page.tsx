import type { Metadata } from "next";

import { EmptyState, Screen } from "@/components/app/screen";
import { CalendarIcon, HistoryIcon } from "@/components/nav/nav-icons";
import { requireUser } from "@/lib/auth/require-user";
import { formatTripDatesWithYear, tripLength } from "@/lib/trips/dates";
import { getPastTrips } from "@/lib/trips/past-trips";

export const metadata: Metadata = {
  title: "Past trips · Packly",
};

export default async function PastTripsPage() {
  await requireUser("/trips/past");

  const trips = await getPastTrips();

  return (
    <Screen
      title="Past trips"
      subtitle="Trips you've finished, the most recent first."
    >
      {trips.length === 0 ? (
        <EmptyState
          icon={<HistoryIcon className="h-10 w-10" />}
          title="No past trips yet"
        >
          When a trip&apos;s last day is over, it moves here.
        </EmptyState>
      ) : (
        <ul className="flex flex-col gap-3">
          {trips.map((trip) => {
            const days = tripLength(trip);
            return (
              <li
                key={trip.id}
                className="flex items-center gap-4 rounded-3xl bg-surface p-3.5 pr-4 shadow-card"
              >
                <span className="flex h-13 w-13 shrink-0 items-center justify-center rounded-[1.1rem] bg-brand-soft text-brand-text">
                  <CalendarIcon className="h-6 w-6" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-base leading-tight font-bold">
                    {trip.name}
                  </span>
                  <span className="tabular mt-1 block text-sm text-muted">
                    {formatTripDatesWithYear(trip)} · {days}{" "}
                    {days === 1 ? "day" : "days"}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Screen>
  );
}
