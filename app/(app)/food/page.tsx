import type { Metadata } from "next";

import { EmptyBoard, Screen } from "@/components/app/screen";
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
      <EmptyBoard icon={<FoodIcon className="h-16 w-16" />}>
        Nothing on the list. Add somewhere you want to eat and pin it to a day
        when you decide.
      </EmptyBoard>
    </Screen>
  );
}
