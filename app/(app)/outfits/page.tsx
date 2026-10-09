import type { Metadata } from "next";

import { EmptyState, Screen } from "@/components/app/screen";
import { OutfitIcon } from "@/components/nav/nav-icons";
import { PlanTripPrompt } from "@/components/trips/plan-trip-prompt";
import { TripChip } from "@/components/trips/trip-chip";
import { requireUser } from "@/lib/auth/require-user";
import { getActiveTrip } from "@/lib/trips/active-trip";

export const metadata: Metadata = {
  title: "Outfits · Packly",
};

export default async function OutfitsPage() {
  await requireUser("/outfits");
  const trip = await getActiveTrip();

  return (
    <Screen
      title="Outfits"
      subtitle="What you're wearing on each day of the trip."
      aside={trip ? <TripChip trip={trip} from="/outfits" /> : undefined}
    >
      {trip ? (
        <EmptyState
          icon={<OutfitIcon className="h-10 w-10" />}
          title="No outfits planned yet"
        >
          Each day gets its own, built from items already on your packing list.
        </EmptyState>
      ) : (
        <PlanTripPrompt
          icon={<OutfitIcon className="h-10 w-10" />}
          title="Plan a trip to plan outfits"
          from="/outfits"
        >
          Outfits are planned day by day, so the trip&apos;s dates come first.
        </PlanTripPrompt>
      )}
    </Screen>
  );
}
