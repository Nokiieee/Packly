import type { Metadata } from "next";

import { Screen } from "@/components/app/screen";
import { PackingIcon } from "@/components/nav/nav-icons";
import { PackingList } from "@/components/packing/packing-list";
import { PlanTripPrompt } from "@/components/trips/plan-trip-prompt";
import { TripChip } from "@/components/trips/trip-chip";
import { requireUser } from "@/lib/auth/require-user";
import type { PackingCategory, PackingItem } from "@/lib/packing/types";
import { createClient } from "@/lib/supabase/server";
import { getActiveTrip } from "@/lib/trips/active-trip";

export const metadata: Metadata = {
  title: "Packing · Packly",
};

const TITLE = "Packing";
const SUBTITLE = "Everything to bring, checked off as it goes in the bag.";

export default async function PackingPage() {
  await requireUser("/packing");

  const trip = await getActiveTrip();
  if (!trip) {
    return (
      <Screen title={TITLE} subtitle={SUBTITLE}>
        <PlanTripPrompt
          icon={<PackingIcon className="h-10 w-10" />}
          title="Plan a trip to start packing"
          from="/packing"
        >
          Each trip has its own packing list. Say where you&apos;re going and
          when, then add what to bring.
        </PlanTripPrompt>
      </Screen>
    );
  }

  // RLS limits both to the signed-in user's rows.
  const supabase = await createClient();
  const [itemsResult, categoriesResult] = await Promise.all([
    supabase
      .from("packing_items")
      .select("id, name, quantity, packed_count, category_id")
      .eq("trip_id", trip.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("packing_categories")
      .select("id, name")
      .eq("trip_id", trip.id)
      .order("created_at", { ascending: true }),
  ]);

  const error = itemsResult.error ?? categoriesResult.error;
  if (error)
    throw new Error(`Couldn't load the packing list: ${error.message}`);

  const items: PackingItem[] = (itemsResult.data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    quantity: row.quantity,
    packedCount: row.packed_count,
    categoryId: row.category_id,
  }));

  const categories: PackingCategory[] = (categoriesResult.data ?? []).map(
    (row) => ({ id: row.id, name: row.name }),
  );

  return (
    <Screen
      title={TITLE}
      subtitle={SUBTITLE}
      aside={<TripChip trip={trip} from="/packing" />}
    >
      {/* Keyed by trip so a different trip starts with fresh list state. */}
      <PackingList
        key={trip.id}
        tripId={trip.id}
        items={items}
        categories={categories}
      />
    </Screen>
  );
}
