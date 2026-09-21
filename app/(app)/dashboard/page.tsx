import type { Metadata } from "next";

import { ComingSoon, Screen } from "@/components/app/screen";
import { requireUser } from "@/lib/auth/require-user";

export const metadata: Metadata = {
  title: "Today · Packly",
};

export default async function DashboardPage() {
  const user = await requireUser("/dashboard");

  return (
    <Screen
      title="Today"
      subtitle={`Signed in as ${user.email}. Your day at a glance will live here.`}
    >
      <ComingSoon>
        Today&apos;s outfit, meals and packing reminders will gather on this
        screen once a trip exists.
      </ComingSoon>
    </Screen>
  );
}
