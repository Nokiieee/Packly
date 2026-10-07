import type { Metadata } from "next";

import { EmptyState, Screen } from "@/components/app/screen";
import { FoodIcon } from "@/components/nav/nav-icons";
import { PlanTripPrompt } from "@/components/trips/plan-trip-prompt";
import { TripChip } from "@/components/trips/trip-chip";
import { requireUser } from "@/lib/auth/require-user";
import { getActiveTrip } from "@/lib/trips/active-trip";

export const metadata: Metadata = {
  title: "Food · Packly",
};

export default async function FoodPage() {
  await requireUser("/food");
  const trip = await getActiveTrip();

  return (
    <Screen
      title="Food"
      subtitle="Meals, restaurants and dishes worth tracking down."
      eyebrow={trip ? <TripChip trip={trip} from="/food" /> : undefined}
    >
      {trip ? (
        <EmptyState
          icon={<FoodIcon className="h-10 w-10" />}
          title="No places saved yet"
        >
          Add somewhere you want to eat and pin it to a day when you decide.
        </EmptyState>
      ) : (
        <PlanTripPrompt
          icon={<FoodIcon className="h-10 w-10" />}
          title="Plan a trip to save places"
          from="/food"
        >
          Places to eat are pinned to the days of a trip, so plan the trip
          first.
        </PlanTripPrompt>
      )}
    </Screen>
  );
}
