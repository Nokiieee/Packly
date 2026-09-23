import type { Metadata } from "next";

import { EmptyState, Screen } from "@/components/app/screen";
import { OutfitIcon } from "@/components/nav/nav-icons";
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
      <EmptyState
        icon={<OutfitIcon className="h-10 w-10" />}
        title="No outfits planned yet"
      >
        Each day gets its own, built from items already on your packing list.
      </EmptyState>
    </Screen>
  );
}
