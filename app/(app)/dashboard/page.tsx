import type { Metadata } from "next";

import { Screen } from "@/components/app/screen";
import { buildTodayTrip } from "@/components/app/today-trip";
import { TodayView } from "@/components/app/today-view";
import { TodayIcon } from "@/components/nav/nav-icons";
import { PlanTripPrompt } from "@/components/trips/plan-trip-prompt";
import { requireUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";
import { getActiveTrip } from "@/lib/trips/active-trip";

export const metadata: Metadata = {
  title: "Today · Packly",
};

export default async function DashboardPage() {
  await requireUser("/dashboard");

  const trip = await getActiveTrip();
  if (!trip) {
    return (
      <Screen title="Today" subtitle="Your trip, one day at a time.">
        <PlanTripPrompt
          icon={<TodayIcon className="h-10 w-10" />}
          title="No trip coming up"
          from="/dashboard"
        >
          Plan one and this screen shows each day as it comes: what you&apos;re
          wearing, where you&apos;re eating and what&apos;s left to pack.
        </PlanTripPrompt>
      </Screen>
    );
  }

  // Only what the rows need: packing counts, each place's name and day, and
  // each outfit's name and day with how many items it holds. RLS limits all
  // of them to the user's own rows.
  const supabase = await createClient();
  const [itemsResult, placesResult, outfitsResult, outfitItemsResult] =
    await Promise.all([
    supabase
      .from("packing_items")
      .select("quantity, packed_count")
      .eq("trip_id", trip.id),
    supabase
      .from("food_places")
      .select("name, day")
      .eq("trip_id", trip.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("outfits")
      .select("id, name, day")
      .eq("trip_id", trip.id)
      .order("seq", { ascending: true }),
    supabase.from("outfit_items").select("outfit_id").eq("trip_id", trip.id),
  ]);

  if (itemsResult.error) {
    throw new Error(
      `Couldn't load the packing list: ${itemsResult.error.message}`,
    );
  }
  if (placesResult.error) {
    throw new Error(
      `Couldn't load your food places: ${placesResult.error.message}`,
    );
  }
  const outfitsError = outfitsResult.error ?? outfitItemsResult.error;
  if (outfitsError) {
    throw new Error(`Couldn't load your outfits: ${outfitsError.message}`);
  }

  const items = (itemsResult.data ?? []).map((row) => ({
    quantity: row.quantity,
    packedCount: row.packed_count,
  }));
  const places = (placesResult.data ?? []).map((row) => ({
    name: row.name,
    day: row.day,
  }));

  const itemCounts = new Map<string, number>();
  for (const row of outfitItemsResult.data ?? []) {
    itemCounts.set(row.outfit_id, (itemCounts.get(row.outfit_id) ?? 0) + 1);
  }
  const outfits = (outfitsResult.data ?? []).map((row) => ({
    name: row.name,
    day: row.day,
    itemCount: itemCounts.get(row.id) ?? 0,
  }));

  return <TodayView trip={buildTodayTrip(trip, items, places, outfits)} />;
}
