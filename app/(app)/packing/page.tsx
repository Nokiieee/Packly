import type { Metadata } from "next";

import { Screen } from "@/components/app/screen";
import { PackingList } from "@/components/packing/packing-list";
import { requireUser } from "@/lib/auth/require-user";
import type { PackingItem } from "@/lib/packing/types";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Packing · Packly",
};

export default async function PackingPage() {
  await requireUser("/packing");

  // RLS limits this to the signed-in user's rows.
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("packing_items")
    .select("id, name, packed")
    .order("created_at", { ascending: true });

  if (error)
    throw new Error(`Couldn't load the packing list: ${error.message}`);

  const items: PackingItem[] = data ?? [];

  return (
    <Screen
      title="Packing"
      subtitle="Everything to bring, checked off as it goes in the bag."
    >
      <PackingList items={items} />
    </Screen>
  );
}
