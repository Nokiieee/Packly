"use server";

import { revalidatePath } from "next/cache";

import {
  MAX_ITEM_NAME_LENGTH,
  MAX_ITEM_QUANTITY,
  type PackingActionResult,
} from "@/lib/packing/types";
import { createClient } from "@/lib/supabase/server";

function isCount(value: unknown, min: number): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= min &&
    value <= MAX_ITEM_QUANTITY
  );
}

export async function addPackingItem(
  rawName: string,
  quantity: number,
): Promise<PackingActionResult> {
  const name = typeof rawName === "string" ? rawName.trim() : "";

  if (!name) return { error: "Give the item a name." };
  if (name.length > MAX_ITEM_NAME_LENGTH) {
    return { error: `Keep it under ${MAX_ITEM_NAME_LENGTH} characters.` };
  }
  if (!isCount(quantity, 1)) {
    return { error: `Quantity is a whole number from 1 to ${MAX_ITEM_QUANTITY}.` };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session ended. Sign in again." };

  const { error } = await supabase
    .from("packing_items")
    .insert({ name, quantity, user_id: user.id });

  if (error) return { error: "Couldn't add that item. Try again." };

  revalidatePath("/packing");
  return {};
}

/**
 * Sets how many of an item are in the bag. Takes the absolute count rather
 * than a +1/−1 so a retried or reordered request can't drift the total; the
 * table's check constraint keeps it within the item's quantity.
 */
export async function setPackedCount(
  id: string,
  packedCount: number,
): Promise<PackingActionResult> {
  if (typeof id !== "string" || !isCount(packedCount, 0)) {
    return { error: "Couldn't update that item." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session ended. Sign in again." };

  // RLS already scopes the update to the owner; the user_id filter keeps the
  // intent readable and turns someone else's id into a silent no-op.
  const { error } = await supabase
    .from("packing_items")
    .update({ packed_count: packedCount })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: "Couldn't update that item. Try again." };

  revalidatePath("/packing");
  return {};
}
