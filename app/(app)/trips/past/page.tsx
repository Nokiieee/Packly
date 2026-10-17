import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState, Screen } from "@/components/app/screen";
import {
  CalendarIcon,
  ChevronRightIcon,
  HistoryIcon,
} from "@/components/nav/nav-icons";
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
              <li key={trip.id}>
                <Link
                  href={`/trips/past/${trip.id}`}
                  className="group flex items-center gap-4 rounded-3xl bg-surface p-3.5 pr-4 shadow-card transition-[scale,box-shadow] duration-200 ease-out-quint hover:shadow-lift active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
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
                  <ChevronRightIcon className="h-5 w-5 shrink-0 text-muted transition-transform duration-200 ease-out-quint group-hover:translate-x-0.5" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Screen>
  );
}
