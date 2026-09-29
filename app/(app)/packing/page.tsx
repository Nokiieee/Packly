import type { Metadata } from "next";

import { Screen } from "@/components/app/screen";
import { PackingList } from "@/components/packing/packing-list";
import { requireUser } from "@/lib/auth/require-user";
import type { PackingCategory, PackingItem } from "@/lib/packing/types";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Packing · Packly",
};

export default async function PackingPage() {
  await requireUser("/packing");

  // RLS limits both to the signed-in user's rows.
  const supabase = await createClient();
  const [itemsResult, categoriesResult] = await Promise.all([
    supabase
      .from("packing_items")
      .select("id, name, quantity, packed_count, category_id")
      .order("created_at", { ascending: true }),
    supabase
      .from("packing_categories")
      .select("id, name")
      .order("created_at", { ascending: true }),
  ]);

  const error = itemsResult.error ?? categoriesResult.error;
  if (error)
    throw new Error(`Couldn't load the packing list: ${error.message}`);

  const items: PackingItem[] = (itemsResult.data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    quantity: row.quantity,
    packedCount: row.packed_count,
    categoryId: row.category_id,
  }));

  const categories: PackingCategory[] = (categoriesResult.data ?? []).map(
    (row) => ({ id: row.id, name: row.name }),
  );

  return (
    <Screen
      title="Packing"
      subtitle="Everything to bring, checked off as it goes in the bag."
    >
      <PackingList items={items} categories={categories} />
    </Screen>
  );
}
