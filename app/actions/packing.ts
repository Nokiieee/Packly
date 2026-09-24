"use server";

import { revalidatePath } from "next/cache";

import {
  MAX_ITEM_NAME_LENGTH,
  type PackingActionResult,
} from "@/lib/packing/types";
import { createClient } from "@/lib/supabase/server";

export async function addPackingItem(
  rawName: string,
): Promise<PackingActionResult> {
  const name = typeof rawName === "string" ? rawName.trim() : "";

  if (!name) return { error: "Give the item a name." };
  if (name.length > MAX_ITEM_NAME_LENGTH) {
    return { error: `Keep it under ${MAX_ITEM_NAME_LENGTH} characters.` };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Your session ended. Sign in again." };

  const { error } = await supabase
    .from("packing_items")
    .insert({ name, user_id: user.id });

  if (error) return { error: "Couldn't add that item. Try again." };

  revalidatePath("/packing");
  return {};
}

export async function setPackingItemPacked(
  id: string,
  packed: boolean,
): Promise<PackingActionResult> {
  if (typeof id !== "string" || typeof packed !== "boolean") {
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
    .update({ packed })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: "Couldn't update that item. Try again." };

  revalidatePath("/packing");
  return {};
}
