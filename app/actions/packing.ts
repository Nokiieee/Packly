"use server";

import { revalidatePath } from "next/cache";

import {
  MAX_CATEGORY_NAME_LENGTH,
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

/**
 * Drops the cached copies of every page that shows the list: Packing itself,
 * and Today's packed count, which the dock has prefetched and would otherwise
 * keep for up to five minutes.
 */
function revalidatePacking() {
  revalidatePath("/packing");
  revalidatePath("/dashboard");
}

/** Postgres unique_violation. */
const UNIQUE_VIOLATION = "23505";

/** The name and quantity checks shared by adding and editing an item. */
function checkItem(
  rawName: unknown,
  quantity: unknown,
): { name: string; error?: undefined } | { error: string } {
  const name = typeof rawName === "string" ? rawName.trim() : "";

  if (!name) return { error: "Give the item a name." };
  if (name.length > MAX_ITEM_NAME_LENGTH) {
    return { error: `Keep it under ${MAX_ITEM_NAME_LENGTH} characters.` };
  }
  if (!isCount(quantity, 1)) {
    return { error: `Quantity is a whole number from 1 to ${MAX_ITEM_QUANTITY}.` };
  }
  return { name };
}

/**
 * Adds an item to a trip's list: into a category, or the ungrouped section
 * when `categoryId` is null. The composite foreign keys reject a trip the
 * user doesn't own and a category from a different trip.
 */
export async function addPackingItem(
  tripId: string,
  rawName: string,
  quantity: number,
  categoryId: string | null,
): Promise<PackingActionResult> {
  const checked = checkItem(rawName, quantity);
  if (checked.error !== undefined) return { error: checked.error };
  const { name } = checked;

  if (
    typeof tripId !== "string" ||
    (categoryId !== null && typeof categoryId !== "string")
  ) {
    return { error: "Couldn't add that item. Try again." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session ended. Sign in again." };

  const { error } = await supabase
    .from("packing_items")
    .insert({
      name,
      quantity,
      category_id: categoryId,
      trip_id: tripId,
      user_id: user.id,
    });

  if (error) return { error: "Couldn't add that item. Try again." };

  revalidatePacking();
  return {};
}

/**
 * Renames an item and sets how many to bring. If the new quantity is below
 * how many are already packed, the packed count comes down with it, so a
 * packed item stays packed rather than breaking the table's range check.
 */
export async function updatePackingItem(
  id: string,
  rawName: string,
  quantity: number,
): Promise<PackingActionResult> {
  const checked = checkItem(rawName, quantity);
  if (checked.error !== undefined) return { error: checked.error };
  const { name } = checked;

  if (typeof id !== "string") return { error: "Couldn't save that item." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session ended. Sign in again." };

  const { data: current, error: readError } = await supabase
    .from("packing_items")
    .select("packed_count")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (readError || !current) {
    return { error: "Couldn't save that item. Try again." };
  }

  const { error } = await supabase
    .from("packing_items")
    .update({
      name,
      quantity,
      packed_count: Math.min(current.packed_count, quantity),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: "Couldn't save that item. Try again." };

  revalidatePacking();
  return {};
}

export async function deletePackingItem(
  id: string,
): Promise<PackingActionResult> {
  if (typeof id !== "string") return { error: "Couldn't delete that item." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session ended. Sign in again." };

  const { error } = await supabase
    .from("packing_items")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: "Couldn't delete that item. Try again." };

  revalidatePacking();
  return {};
}

/**
 * Adds a category to a trip's list. Returns the new category's id so the list
 * can open its add field.
 */
export async function addPackingCategory(
  tripId: string,
  rawName: string,
): Promise<PackingActionResult & { id?: string }> {
  const name = typeof rawName === "string" ? rawName.trim() : "";

  if (typeof tripId !== "string") {
    return { error: "Couldn't add that category. Try again." };
  }
  if (!name) return { error: "Give the category a name." };
  if (name.length > MAX_CATEGORY_NAME_LENGTH) {
    return { error: `Keep it under ${MAX_CATEGORY_NAME_LENGTH} characters.` };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session ended. Sign in again." };

  const { data, error } = await supabase
    .from("packing_categories")
    .insert({ name, trip_id: tripId, user_id: user.id })
    .select("id")
    .single();

  if (error?.code === UNIQUE_VIOLATION) {
    return { error: `This trip already has a category called “${name}”.` };
  }
  if (error) return { error: "Couldn't add that category. Try again." };

  revalidatePacking();
  return { id: data.id };
}

/**
 * Deletes a category. Its items aren't touched here: the foreign key sets
 * their category back to null, so they return to the ungrouped section.
 */
export async function deletePackingCategory(
  id: string,
): Promise<PackingActionResult> {
  if (typeof id !== "string") return { error: "Couldn't remove that category." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session ended. Sign in again." };

  const { error } = await supabase
    .from("packing_categories")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: "Couldn't remove that category. Try again." };

  revalidatePacking();
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

  revalidatePacking();
  return {};
}
