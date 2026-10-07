import { createClient } from "@/lib/supabase/server";

import { earliestLiveEndDate, pickActiveTrip } from "./dates";
import { TRIP_COLUMNS, toTrip, type Trip } from "./types";

/**
 * The signed-in user's current trip, or the next one if none is on today, or
 * null. Every tab renders from this, and the dock prefetches every tab, so it
 * is one small query: only trips that could still be live.
 */
export async function getActiveTrip(): Promise<Trip | null> {
  // RLS limits it to the signed-in user's trips.
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trips")
    .select(TRIP_COLUMNS)
    .gte("end_date", earliestLiveEndDate())
    .order("start_date", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw new Error(`Couldn't load your trips: ${error.message}`);

  return pickActiveTrip((data ?? []).map(toTrip));
}
