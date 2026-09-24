/**
 * Shapes shared by the packing Server Actions and the list. Kept out of
 * `app/actions/packing.ts` because a `"use server"` module may only export
 * async functions.
 */
export type PackingItem = {
  id: string;
  name: string;
  packed: boolean;
};

export type PackingActionResult = { error?: string };

/** Mirrors the length check on `packing_items.name`. */
export const MAX_ITEM_NAME_LENGTH = 120;
