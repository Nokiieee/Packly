import type { Metadata } from "next";

import { EmptyState, Screen } from "@/components/app/screen";
import { FoodIcon } from "@/components/nav/nav-icons";
import { DayPicker } from "@/components/trips/day-picker";
import { PlanTripPrompt } from "@/components/trips/plan-trip-prompt";
import { TripChip } from "@/components/trips/trip-chip";
import { requireUser } from "@/lib/auth/require-user";
import { getActiveTrip } from "@/lib/trips/active-trip";
import { currentTripDay, tripDays } from "@/lib/trips/dates";

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
        <>
          {/*
            Stands alone for now; it moves into the add-a-place form when
            saving places lands, and its chosen day goes with the place.
          */}
          <div className="rounded-3xl bg-surface p-4 shadow-card sm:p-5">
            {/* Today's day starts selected during the trip; none before it. */}
            <DayPicker
              days={tripDays(trip)}
              defaultDay={currentTripDay(trip) ?? undefined}
            />
          </div>

          <EmptyState
            icon={<FoodIcon className="h-10 w-10" />}
            title="No places saved yet"
          >
            Add somewhere you want to eat and pin it to a day when you decide.
          </EmptyState>
        </>
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
