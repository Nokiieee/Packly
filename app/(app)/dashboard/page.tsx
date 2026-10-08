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

  // Only the counts are needed here. RLS limits it to the user's own rows.
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("packing_items")
    .select("quantity, packed_count")
    .eq("trip_id", trip.id);

  if (error) throw new Error(`Couldn't load the packing list: ${error.message}`);

  const items = (data ?? []).map((row) => ({
    quantity: row.quantity,
    packedCount: row.packed_count,
  }));

  return <TodayView trip={buildTodayTrip(trip, items)} />;
}
