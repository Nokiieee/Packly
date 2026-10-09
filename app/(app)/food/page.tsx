import type { Metadata } from "next";

import { Screen } from "@/components/app/screen";
import { FoodPlaces } from "@/components/food/food-places";
import { FoodIcon } from "@/components/nav/nav-icons";
import { DayPicker } from "@/components/trips/day-picker";
import { PlanTripPrompt } from "@/components/trips/plan-trip-prompt";
import { TripChip } from "@/components/trips/trip-chip";
import { requireUser } from "@/lib/auth/require-user";
import type { FoodPlace } from "@/lib/food/types";
import { createClient } from "@/lib/supabase/server";
import { getActiveTrip } from "@/lib/trips/active-trip";
import { currentTripDay, tripDays } from "@/lib/trips/dates";

export const metadata: Metadata = {
  title: "Food · Packly",
};

const TITLE = "Food";
const SUBTITLE = "Meals, restaurants and dishes worth tracking down.";

export default async function FoodPage() {
  await requireUser("/food");

  const trip = await getActiveTrip();
  if (!trip) {
    return (
      <Screen title={TITLE} subtitle={SUBTITLE}>
        <PlanTripPrompt
          icon={<FoodIcon className="h-10 w-10" />}
          title="Plan a trip to save places"
          from="/food"
        >
          Places to eat are pinned to the days of a trip, so plan the trip
          first.
        </PlanTripPrompt>
      </Screen>
    );
  }

  // RLS limits this to the signed-in user's rows.
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("food_places")
    .select("id, name, day")
    .eq("trip_id", trip.id)
    .order("created_at", { ascending: true });

  if (error) throw new Error(`Couldn't load your food places: ${error.message}`);

  const places: FoodPlace[] = (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    day: row.day,
  }));

  const days = tripDays(trip);
  const today = currentTripDay(trip);

  return (
    <Screen
      title={TITLE}
      subtitle={SUBTITLE}
      aside={<TripChip trip={trip} from="/food" />}
    >
      {/*
        The day this tab is looking at; once places can be planned it picks
        which day's list shows. Today's day starts selected during the trip;
        none before it.
      */}
      <DayPicker
        days={days}
        defaultDay={today ?? undefined}
        today={today ?? undefined}
      />

      {/* Keyed by trip so a different trip starts with fresh list state. */}
      <FoodPlaces
        key={trip.id}
        tripId={trip.id}
        places={places}
        dayCount={days.length}
      />
    </Screen>
  );
}
