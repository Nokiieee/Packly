import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { updateTrip } from "@/app/actions/trips";
import { Screen } from "@/components/app/screen";
import { TripForm } from "@/components/trips/trip-form";
import { requireUser } from "@/lib/auth/require-user";
import { safeRedirect } from "@/lib/safe-redirect";
import { createClient } from "@/lib/supabase/server";
import { TRIP_COLUMNS, toTrip } from "@/lib/trips/types";

export const metadata: Metadata = {
  title: "Edit trip · Packly",
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditTripPage({
  params,
  searchParams,
}: PageProps<"/trips/[id]/edit">) {
  const { id } = await params;
  await requireUser(`/trips/${id}/edit`);
  const from = safeRedirect(first((await searchParams).from), "/packing");

  // Postgres rejects a malformed uuid outright; that's a missing trip too.
  if (!UUID.test(id)) notFound();

  // RLS limits it to the signed-in user's trips, so another user's id is a 404.
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("trips")
    .select(TRIP_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(`Couldn't load the trip: ${error.message}`);
  if (!data) notFound();

  return (
    <Screen title="Edit trip" subtitle="Where you're going and when.">
      <div className="rounded-3xl bg-surface p-5 shadow-card sm:p-6">
        <TripForm
          action={updateTrip}
          trip={toTrip(data)}
          from={from}
          submitLabel="Save changes"
          pendingLabel="Saving"
        />
      </div>
    </Screen>
  );
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
