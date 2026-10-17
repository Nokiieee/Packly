import { revalidatePath } from "next/cache";

import type { createClient } from "@/lib/supabase/server";

import { isTripOver } from "./dates";

type Supabase = Awaited<ReturnType<typeof createClient>>;

/** The tables whose rows belong to a trip through `trip_id`. */
type TripTable =
  | "packing_items"
  | "packing_categories"
  | "food_places"
  | "outfits"
  | "outfit_items";

export const TRIP_OVER_ERROR = "This trip is over, so it can't be changed.";

/**
 * Why nothing on this trip may be saved, or null if it can be. A finished trip
 * is read-only: the past-trip page has no controls, but every Server Action
 * can still be called from a tab left open past the trip's last day, so each
 * one asks here before it writes.
 *
 * A trip that doesn't exist (or isn't the user's) isn't refused here; the
 * write then fails or does nothing on its own, as it always has.
 */
export async function tripLockedError(
  supabase: Supabase,
  tripId: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("trips")
    .select("end_date, time_zone")
    .eq("id", tripId)
    .maybeSingle();

  if (error) return "Couldn't check the trip. Try again.";
  if (!data || !isTripOver({ endDate: data.end_date, timeZone: data.time_zone })) {
    return null;
  }

  // The screen that sent this is showing a trip that has ended. Every tab
  // reads the active trip, so refreshing them all moves it on to the current one.
  revalidatePath("/", "layout");
  return TRIP_OVER_ERROR;
}

/**
 * `tripLockedError` for an action that only has a row's id: finds the row's
 * trip first. A row that isn't there (or isn't the user's) isn't refused.
 */
export async function rowLockedError(
  supabase: Supabase,
  table: TripTable,
  id: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from(table)
    .select("trip_id")
    .eq("id", id)
    .maybeSingle();

  if (error) return "Couldn't check the trip. Try again.";
  if (!data) return null;

  return tripLockedError(supabase, data.trip_id);
}
