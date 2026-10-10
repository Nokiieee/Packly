import type { Metadata } from "next";

import { Screen } from "@/components/app/screen";
import { OutfitIcon } from "@/components/nav/nav-icons";
import { OutfitDays } from "@/components/outfits/outfit-days";
import { PlanTripPrompt } from "@/components/trips/plan-trip-prompt";
import { requireUser } from "@/lib/auth/require-user";
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

  const today = currentTripDay(trip);

  return (
    <Screen title={TITLE} titleHidden>
      {/* Keyed by trip so a different trip starts on its own first day. */}
      <OutfitDays
        key={trip.id}
        days={tripDays(trip)}
        today={today ?? undefined}
      />
    </Screen>
  );
}
