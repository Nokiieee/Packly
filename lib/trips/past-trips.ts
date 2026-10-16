import { createClient } from "@/lib/supabase/server";

import { isTripOver, latestPastEndDate } from "./dates";
import { TRIP_COLUMNS, toTrip, type Trip } from "./types";

/**
 * The signed-in user's finished trips, the most recently ended first. A trip
 * is over once its last day has ended in its own time zone, the same clock
 * `getActiveTrip` uses, so every trip is either live or here, never both.
 */
export async function getPastTrips(): Promise<Trip[]> {
  // RLS limits it to the signed-in user's trips.
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trips")
    .select(TRIP_COLUMNS)
    .lte("end_date", latestPastEndDate())
    .order("end_date", { ascending: false })
    .order("start_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Couldn't load your past trips: ${error.message}`);

  // The query can include a trip whose last day is still going on somewhere
  // behind UTC; this drops it.
  return (data ?? []).map(toTrip).filter((trip) => isTripOver(trip));
}
