import type { Metadata } from "next";

import { ComingSoon, Screen } from "@/components/app/screen";
import { requireUser } from "@/lib/auth/require-user";

export const metadata: Metadata = {
  title: "Outfits · Packly",
};

export default async function OutfitsPage() {
  await requireUser("/outfits");

  return (
    <Screen
      title="Outfits"
      subtitle="What you're wearing on each day of the trip."
    >
      <ComingSoon>
        Day-by-day outfit planning will live here, built from the items already
        on your packing list.
      </ComingSoon>
    </Screen>
  );
}
