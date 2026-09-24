"use client";

import { useOptimistic, useState, useTransition } from "react";

import { addPackingItem, setPackingItemPacked } from "@/app/actions/packing";
import { EmptyState } from "@/components/app/screen";
import { CheckIcon, PackingIcon, PlusIcon } from "@/components/nav/nav-icons";
import { MAX_ITEM_NAME_LENGTH, type PackingItem } from "@/lib/packing/types";

type Change =
  | { type: "add"; item: PackingItem }
  | { type: "toggle"; id: string; packed: boolean };

function applyChange(items: PackingItem[], change: Change): PackingItem[] {
  switch (change.type) {
    case "add":
      return [...items, change.item];
    case "toggle":
      return items.map((item) =>
        item.id === change.id ? { ...item, packed: change.packed } : item,
      );
  }
}

/** Ids for items the server hasn't confirmed yet. They can't be toggled. */
const PENDING_PREFIX = "pending-";

/**
 * The packing checklist: an add field, then every item with a checkbox.
 * Adds and ticks show instantly and settle when the server re-renders the page
 * with the saved list; a failure rolls back and says so.
 */
export function PackingList({ items }: { items: PackingItem[] }) {
  const [optimisticItems, applyOptimistic] = useOptimistic(items, applyChange);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const packedCount = optimisticItems.filter((item) => item.packed).length;

  async function add() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Give the item a name.");
      return;
    }

    setError(null);
    setName("");
    applyOptimistic({
      type: "add",
      item: {
        id: `${PENDING_PREFIX}${Date.now()}`,
        name: trimmed,
        packed: false,
      },
    });

    const result = await addPackingItem(trimmed);
    if (result.error) {
      setError(result.error);
      setName(trimmed);
    }
  }

  function toggle(id: string, packed: boolean) {
    setError(null);
    startTransition(async () => {
      applyOptimistic({ type: "toggle", id, packed });
      const result = await setPackingItemPacked(id, packed);
      if (result.error) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <form action={add} className="flex gap-2.5">
        <label htmlFor="packing-item-name" className="sr-only">
          Item name
        </label>
        <input
          id="packing-item-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={MAX_ITEM_NAME_LENGTH}
          autoComplete="off"
          enterKeyHint="done"
          placeholder="Add something to bring"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "packing-error" : undefined}
          className="min-w-0 flex-1 rounded-2xl border border-field-edge bg-surface px-4 py-3 text-base text-ink shadow-card outline-none transition-[border-color,box-shadow] duration-200 ease-out placeholder:text-muted focus-visible:border-brand focus-visible:ring-4 focus-visible:ring-brand/20"
        />
        <button
          type="submit"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-brand pl-4.5 w-25 text-base font-bold text-brand-ink shadow-hero transition-[background-color,scale] duration-200 ease-out-quint hover:bg-brand-deep active:scale-95 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-ground focus-visible:outline-none"
        >
          <PlusIcon className="h-5 w-5" />
          Add
        </button>
      </form>

      {error ? (
        <p
          id="packing-error"
          role="alert"
          className="rounded-2xl bg-danger-soft px-4 py-3 text-sm font-medium text-danger"
        >
          {error}
        </p>
      ) : null}

      {optimisticItems.length === 0 ? (
        <EmptyState
          icon={<PackingIcon className="h-10 w-10" />}
          title="Your packing list is empty"
        >
          Add the first thing you need to bring, then tick it off as it goes in
          the bag.
        </EmptyState>
      ) : (
        <section aria-labelledby="packing-list-heading">
          <div className="flex items-baseline justify-between px-1">
            <h2
              id="packing-list-heading"
              className="text-lg font-bold tracking-[-0.01em]"
            >
              To bring
            </h2>
            <p className="tabular text-sm font-medium text-muted">
              {packedCount} of {optimisticItems.length} packed
            </p>
          </div>

          <ul className="mt-3 divide-y divide-hair overflow-hidden rounded-3xl bg-surface shadow-card">
            {optimisticItems.map((item) => (
              <li key={item.id}>
                <PackingRow item={item} onToggle={toggle} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

/**
 * One item. The whole row is the label, so the tap target is full width; the
 * native checkbox stays in the DOM for keyboard and screen readers and the
 * round check is drawn beside it.
 */
function PackingRow({
  item,
  onToggle,
}: {
  item: PackingItem;
  onToggle: (id: string, packed: boolean) => void;
}) {
  const pending = item.id.startsWith(PENDING_PREFIX);

  return (
    <label
      className={[
        "flex items-center gap-3.5 px-4 py-3.5 transition-[background-color,opacity] duration-200 ease-out-quint",
        pending
          ? "opacity-60"
          : "cursor-pointer active:bg-surface-sunk has-focus-visible:bg-surface-sunk",
      ].join(" ")}
    >
      <input
        type="checkbox"
        checked={item.packed}
        disabled={pending}
        onChange={(event) => onToggle(item.id, event.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-field-edge text-transparent transition-[background-color,border-color,color,scale] duration-200 ease-out-quint peer-checked:border-brand peer-checked:bg-brand peer-checked:text-brand-ink peer-focus-visible:ring-4 peer-focus-visible:ring-brand/25 peer-active:scale-90"
      >
        <CheckIcon className="h-4 w-4" />
      </span>
      <span
        className={[
          "min-w-0 flex-1 text-base leading-snug font-semibold break-words transition-colors duration-200",
          item.packed ? "text-muted line-through" : "text-ink",
        ].join(" ")}
      >
        {item.name}
      </span>
    </label>
  );
}
