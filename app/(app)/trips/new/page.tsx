import type { Metadata } from "next";

import { createTrip } from "@/app/actions/trips";
import { Screen } from "@/components/app/screen";
import { TripForm } from "@/components/trips/trip-form";
import { requireUser } from "@/lib/auth/require-user";
import { safeRedirect } from "@/lib/safe-redirect";

export const metadata: Metadata = {
  title: "Plan a trip · Packly",
};

export default async function NewTripPage({
  searchParams,
}: PageProps<"/trips/new">) {
  await requireUser("/trips/new");
  const from = safeRedirect(first((await searchParams).from), "/packing");

  return (
    <Screen
      title="Plan a trip"
      subtitle="Where you're going and when. You can change any of it later."
    >
      <div className="rounded-3xl bg-surface p-5 shadow-card sm:p-6">
        <TripForm
          action={createTrip}
          from={from}
          submitLabel="Save trip"
          pendingLabel="Saving"
        />
      </div>
    </Screen>
  );
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
