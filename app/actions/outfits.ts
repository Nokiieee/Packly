"use server";

import { revalidatePath } from "next/cache";

import {
  MAX_OUTFIT_NAME_LENGTH,
  type OutfitActionResult,
} from "@/lib/outfits/types";
import { createClient } from "@/lib/supabase/server";

/** The highest value `outfits.day` (a smallint) can hold. */
const MAX_DAY = 32767;

/** The name checks shared by adding and renaming an outfit. */
function checkName(
  rawName: unknown,
): { name: string; error?: undefined } | { error: string } {
  const name = typeof rawName === "string" ? rawName.trim() : "";

  if (!name) return { error: "Give the outfit a name." };
  if (name.length > MAX_OUTFIT_NAME_LENGTH) {
    return { error: `Keep it under ${MAX_OUTFIT_NAME_LENGTH} characters.` };
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
  const checked = checkName(rawName);
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
  const checked = checkName(rawName);
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
