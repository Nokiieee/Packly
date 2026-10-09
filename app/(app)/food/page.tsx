import type { Metadata } from "next";

import { Screen } from "@/components/app/screen";
import { FoodPlaces } from "@/components/food/food-places";
import { FoodIcon } from "@/components/nav/nav-icons";
import { PlanTripPrompt } from "@/components/trips/plan-trip-prompt";
import { requireUser } from "@/lib/auth/require-user";
import type { FoodPlace } from "@/lib/food/types";
import { createClient } from "@/lib/supabase/server";
import { getActiveTrip } from "@/lib/trips/active-trip";
import { currentTripDay, tripDays } from "@/lib/trips/dates";

export const metadata: Metadata = {
  title: "Food · Packly",
};

const TITLE = "Food";

export default async function FoodPage() {
  await requireUser("/food");

  const trip = await getActiveTrip();
  if (!trip) {
    return (
      <Screen title={TITLE} titleHidden>
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
    <Screen title={TITLE} titleHidden>
      {/*
        Keyed by trip so a different trip starts with fresh list state. It
        draws the day strip too, since the strip picks which day's places show.
      */}
      <FoodPlaces
        key={trip.id}
        tripId={trip.id}
        places={places}
        days={days}
        today={today ?? undefined}
      />
    </Screen>
  );
}
