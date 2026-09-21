import type { Metadata } from "next";

import { ComingSoon, Screen } from "@/components/app/screen";
import { requireUser } from "@/lib/auth/require-user";

export const metadata: Metadata = {
  title: "Food · Packly",
};

export default async function FoodPage() {
  await requireUser("/food");

  return (
    <Screen
      title="Food"
      subtitle="Meals, restaurants and dishes worth tracking down."
    >
      <ComingSoon>
        A running list of what to eat will live here — kept as a wishlist until
        you pin something to a particular day.
      </ComingSoon>
    </Screen>
  );
}
