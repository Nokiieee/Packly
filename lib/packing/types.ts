/**
 * Shapes shared by the packing Server Actions and the list. Kept out of
 * `app/actions/packing.ts` because a `"use server"` module may only export
 * async functions.
 */
export type PackingItem = {
  id: string;
  name: string;
  /** How many to bring; 1 for an ordinary item, more for "T-shirt ×5". */
  quantity: number;
  /** How many are in the bag, 0 to `quantity`. */
  packedCount: number;
};

export type PackingActionResult = { error?: string };

/** Mirrors the length check on `packing_items.name`. */
export const MAX_ITEM_NAME_LENGTH = 120;

/** Mirrors the range check on `packing_items.quantity`. */
export const MAX_ITEM_QUANTITY = 99;

export function isPacked(item: PackingItem): boolean {
  return item.packedCount >= item.quantity;
}
