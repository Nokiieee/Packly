import type { Metadata } from "next";

import { EmptyState, Screen } from "@/components/app/screen";
import { FoodIcon } from "@/components/nav/nav-icons";
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
      <EmptyState
        icon={<FoodIcon className="h-10 w-10" />}
        title="No places saved yet"
      >
        Add somewhere you want to eat and pin it to a day when you decide.
      </EmptyState>
    </Screen>
  );
}
