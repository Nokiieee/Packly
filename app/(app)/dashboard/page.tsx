import type { Metadata } from "next";

import { SAMPLE_TRIP, SAMPLE_TRIP_NOTE } from "@/components/app/sample-trip";
import { TodayView } from "@/components/app/today-view";
import { requireUser } from "@/lib/auth/require-user";

export const metadata: Metadata = {
  title: "Today · Packly",
};

export default async function DashboardPage() {
  await requireUser("/dashboard");

  return <TodayView trip={SAMPLE_TRIP} note={SAMPLE_TRIP_NOTE} />;
}
