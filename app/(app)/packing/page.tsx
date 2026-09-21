import type { Metadata } from "next";

import { ComingSoon, Screen } from "@/components/app/screen";
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
      <ComingSoon>
        The packing checklist will live here, with optional categories and
        photos for the items worth recognising at a glance.
      </ComingSoon>
    </Screen>
  );
}
