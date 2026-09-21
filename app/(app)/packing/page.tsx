import type { Metadata } from "next";

import { EmptyBoard, Screen } from "@/components/app/screen";
import { PackingIcon } from "@/components/nav/nav-icons";
import { requireUser } from "@/lib/auth/require-user";

export const metadata: Metadata = {
  title: "Packing · Packly",
};

export default async function PackingPage() {
  await requireUser("/packing");

  return (
    <Screen
      title="Packing"
      subtitle="Everything to bring, checked off as it goes in the bag."
    >
      <EmptyBoard icon={<PackingIcon className="h-16 w-16" />}>
        Nothing on the list yet. Items you add here become the wardrobe the
        outfit planner draws from.
      </EmptyBoard>
    </Screen>
  );
}
