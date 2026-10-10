"use server";

import { revalidatePath } from "next/cache";

import {
  MAX_OUTFIT_ITEM_NAME_LENGTH,
  MAX_OUTFIT_NAME_LENGTH,
  type OutfitActionResult,
} from "@/lib/outfits/types";
import { createClient } from "@/lib/supabase/server";

/** The highest value `outfits.day` (a smallint) can hold. */
const MAX_DAY = 32767;

/** The name checks shared by adding and renaming an outfit or an item. */
function checkName(
  rawName: unknown,
  what: "outfit" | "item",
  maxLength: number,
): { name: string; error?: undefined } | { error: string } {
  const name = typeof rawName === "string" ? rawName.trim() : "";

  if (!name) return { error: `Give the ${what} a name.` };
  if (name.length > maxLength) {
    return { error: `Keep it under ${maxLength} characters.` };
  }
  return { name };
}

/**
 * Adds an outfit to a day of a trip. The composite foreign key rejects a trip
 * the user doesn't own.
 */
export async function addOutfit(
  tripId: string,
  day: number,
  rawName: string,
): Promise<OutfitActionResult> {
  const checked = checkName(rawName, "outfit", MAX_OUTFIT_NAME_LENGTH);
  if (checked.error !== undefined) return { error: checked.error };
  const { name } = checked;

  if (
    typeof tripId !== "string" ||
    !(Number.isInteger(day) && day >= 1 && day <= MAX_DAY)
  ) {
    return { error: "Couldn't add that outfit. Try again." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session ended. Sign in again." };

  const { error } = await supabase
    .from("outfits")
    .insert({ name, day, trip_id: tripId, user_id: user.id });

  if (error) return { error: "Couldn't add that outfit. Try again." };

  revalidatePath("/outfits");
  return {};
}

/** Renames an outfit. Its day stays as it is. */
export async function updateOutfit(
  id: string,
  rawName: string,
): Promise<OutfitActionResult> {
  const checked = checkName(rawName, "outfit", MAX_OUTFIT_NAME_LENGTH);
  if (checked.error !== undefined) return { error: checked.error };
  const { name } = checked;

  if (typeof id !== "string") return { error: "Couldn't save that outfit." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session ended. Sign in again." };

  const { error } = await supabase
    .from("outfits")
    .update({ name })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: "Couldn't save that outfit. Try again." };

  revalidatePath("/outfits");
  return {};
}

/** Deletes an outfit; the foreign key deletes its items with it. */
export async function deleteOutfit(id: string): Promise<OutfitActionResult> {
  if (typeof id !== "string") return { error: "Couldn't delete that outfit." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session ended. Sign in again." };

  const { error } = await supabase
    .from("outfits")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: "Couldn't delete that outfit. Try again." };

  revalidatePath("/outfits");
  return {};
}

/**
 * Adds an item to an outfit. The composite foreign keys reject a trip the
 * user doesn't own and an outfit from another trip.
 */
export async function addOutfitItem(
  tripId: string,
  outfitId: string,
  rawName: string,
): Promise<OutfitActionResult> {
  const checked = checkName(rawName, "item", MAX_OUTFIT_ITEM_NAME_LENGTH);
  if (checked.error !== undefined) return { error: checked.error };
  const { name } = checked;

  if (typeof tripId !== "string" || typeof outfitId !== "string") {
    return { error: "Couldn't add that item. Try again." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session ended. Sign in again." };

  const { error } = await supabase.from("outfit_items").insert({
    name,
    trip_id: tripId,
    outfit_id: outfitId,
    user_id: user.id,
  });

  if (error) return { error: "Couldn't add that item. Try again." };

  revalidatePath("/outfits");
  return {};
}

export async function updateOutfitItem(
  id: string,
  rawName: string,
): Promise<OutfitActionResult> {
  const checked = checkName(rawName, "item", MAX_OUTFIT_ITEM_NAME_LENGTH);
  if (checked.error !== undefined) return { error: checked.error };
  const { name } = checked;

  if (typeof id !== "string") return { error: "Couldn't save that item." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session ended. Sign in again." };

  const { error } = await supabase
    .from("outfit_items")
    .update({ name })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: "Couldn't save that item. Try again." };

  revalidatePath("/outfits");
  return {};
}

export async function deleteOutfitItem(
  id: string,
): Promise<OutfitActionResult> {
  if (typeof id !== "string") return { error: "Couldn't delete that item." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session ended. Sign in again." };

  const { error } = await supabase
    .from("outfit_items")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: "Couldn't delete that item. Try again." };

  revalidatePath("/outfits");
  return {};
}
