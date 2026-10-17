import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Screen } from "@/components/app/screen";
import { PastTripView } from "@/components/trips/past-trip-view";
import { requireUser } from "@/lib/auth/require-user";
import { formatTripDatesWithYear, tripLength } from "@/lib/trips/dates";
import { getPastTrip } from "@/lib/trips/past-trip";

export const metadata: Metadata = {
  title: "Past trip · Packly",
};

export default async function PastTripPage({
  params,
}: PageProps<"/trips/past/[id]">) {
  const { id } = await params;
  await requireUser(`/trips/past/${id}`);

  // Null for a trip that's missing, someone else's, or not over yet.
  const pastTrip = await getPastTrip(id);
  if (!pastTrip) notFound();

  const { trip } = pastTrip;
  const days = tripLength(trip);

  return (
    <Screen
      title={trip.name}
      subtitle={`${formatTripDatesWithYear(trip)} · ${days} ${days === 1 ? "day" : "days"}`}
      back={{ href: "/trips/past", label: "Past trips" }}
    >
      <PastTripView {...pastTrip} />
    </Screen>
  );
}
