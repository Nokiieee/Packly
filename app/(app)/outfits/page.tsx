import type { Metadata } from "next";

import { Screen } from "@/components/app/screen";
import { OutfitIcon } from "@/components/nav/nav-icons";
import { OutfitDays } from "@/components/outfits/outfit-days";
import { PlanTripPrompt } from "@/components/trips/plan-trip-prompt";
import { requireUser } from "@/lib/auth/require-user";
import type { Outfit, OutfitItem } from "@/lib/outfits/types";
import { createClient } from "@/lib/supabase/server";
import { getActiveTrip } from "@/lib/trips/active-trip";
import { currentTripDay, tripDays } from "@/lib/trips/dates";

export const metadata: Metadata = {
  title: "Outfits · Packly",
};

const TITLE = "Outfits";

export default async function OutfitsPage() {
  await requireUser("/outfits");

  const trip = await getActiveTrip();
  if (!trip) {
    return (
      <Screen title={TITLE} titleHidden>
        <PlanTripPrompt
          icon={<OutfitIcon className="h-10 w-10" />}
          title="Plan a trip to plan outfits"
          from="/outfits"
        >
          Outfits are planned day by day, so the trip&apos;s dates come first.
        </PlanTripPrompt>
      </Screen>
    );
  }

  // RLS limits this to the signed-in user's rows.
  const supabase = await createClient();
  const [outfitRows, itemRows] = await Promise.all([
    supabase
      .from("outfits")
      .select("id, day, name")
      .eq("trip_id", trip.id)
      .order("seq", { ascending: true }),
    supabase
      .from("outfit_items")
      .select("id, outfit_id, name")
      .eq("trip_id", trip.id)
      .order("created_at", { ascending: true }),
  ]);

  const error = outfitRows.error ?? itemRows.error;
  if (error) throw new Error(`Couldn't load your outfits: ${error.message}`);

  const outfits: Outfit[] = (outfitRows.data ?? []).map((row) => ({
    id: row.id,
    day: row.day,
    name: row.name,
  }));
  const items: OutfitItem[] = (itemRows.data ?? []).map((row) => ({
    id: row.id,
    outfitId: row.outfit_id,
    name: row.name,
  }));

  const today = currentTripDay(trip);

  return (
    <Screen title={TITLE} titleHidden>
      {/*
        Keyed by trip so a different trip starts with fresh list state. It
        draws the day strip too, since the strip picks which day's outfits show.
      */}
      <OutfitDays
        key={trip.id}
        tripId={trip.id}
        outfits={outfits}
        items={items}
        days={tripDays(trip)}
        today={today ?? undefined}
      />
    </Screen>
  );
}
