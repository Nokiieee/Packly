"use client";

import { useId, useOptimistic, useRef, useState, useTransition } from "react";

import {
  addOutfit,
  addOutfitItem,
  deleteOutfit,
  deleteOutfitItem,
  updateOutfit,
  updateOutfitItem,
} from "@/app/actions/outfits";
import {
  cancelClass,
  errorClass,
  fieldClass,
  saveClass,
  submitClass,
} from "@/components/app/form-styles";
import { ItemMenu } from "@/components/app/item-menu";
import { OutfitIcon, PlusIcon } from "@/components/nav/nav-icons";
import { DayPicker } from "@/components/trips/day-picker";
import {
  MAX_OUTFIT_ITEM_NAME_LENGTH,
  MAX_OUTFIT_NAME_LENGTH,
  type Outfit,
  type OutfitActionResult,
  type OutfitItem,
} from "@/lib/outfits/types";
import type { TripDay } from "@/lib/trips/dates";

/** Ids for rows the server hasn't confirmed yet. */
const PENDING_PREFIX = "pending-";

let pendingCount = 0;
function pendingId() {
  pendingCount += 1;
  return `${PENDING_PREFIX}${pendingCount}`;
}

function isPending(row: { id: string }) {
  return row.id.startsWith(PENDING_PREFIX);
}

/** Keys for the one field open at a time. Outfit and item ids never clash. */
const addItemKey = (outfitId: string) => `add-item:${outfitId}`;
const editKey = (id: string) => `edit:${id}`;

type ListState = { outfits: Outfit[]; items: OutfitItem[] };

type Change =
  | { type: "add-outfit"; outfit: Outfit }
  | { type: "edit-outfit"; id: string; name: string }
  | { type: "delete-outfit"; id: string }
  | { type: "add-item"; item: OutfitItem }
  | { type: "edit-item"; id: string; name: string }
  | { type: "delete-item"; id: string };

function rename<T extends { id: string; name: string }>(
  rows: T[],
  id: string,
  name: string,
): T[] {
  return rows.map((row) => (row.id === id ? { ...row, name } : row));
}

function applyChange(state: ListState, change: Change): ListState {
  switch (change.type) {
    case "add-outfit":
      return { ...state, outfits: [...state.outfits, change.outfit] };
    case "edit-outfit":
      return { ...state, outfits: rename(state.outfits, change.id, change.name) };
    case "delete-outfit":
      return {
        outfits: state.outfits.filter((outfit) => outfit.id !== change.id),
        // The database deletes its items along with it.
        items: state.items.filter((item) => item.outfitId !== change.id),
      };
    case "add-item":
      return { ...state, items: [...state.items, change.item] };
    case "edit-item":
      return { ...state, items: rename(state.items, change.id, change.name) };
    case "delete-item":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== change.id),
      };
  }
}

function itemCount(count: number) {
  return `${count} ${count === 1 ? "item" : "items"}`;
}

/**
 * A trip's outfits, day by day: the day strip, then the selected day's
 * outfits in one card, with the field to add another at the bottom. Each day
 * starts with a Day and a Night outfit (the database adds them), which the ⋮
 * menu renames or deletes like any other. Under each outfit are its items,
 * typed in freely, and an Add item row that opens a field, as on Packing.
 *
 * The strip starts on today during the trip and on Day 1 before it, as on
 * Food. Changes show at once and settle when the server re-renders the page
 * with the saved list; a failure rolls back and says so.
 */
export function OutfitDays({
  tripId,
  outfits,
  items,
  days,
  today,
}: {
  tripId: string;
  outfits: Outfit[];
  items: OutfitItem[];
  days: TripDay[];
  /** Today's day number during the trip; omit before it. */
  today?: number;
}) {
  const [optimistic, applyOptimistic] = useOptimistic<ListState, Change>(
    { outfits, items },
    applyChange,
  );
  const [selectedDay, setSelectedDay] = useState(today ?? 1);
  // The one add-item or edit field open at a time.
  const [openField, setOpenField] = useState<string | null>(null);
  // The control to refocus after its field closes: an outfit's Add item row,
  // or a ⋮ button once its edit is saved or cancelled.
  const [returnFocusTo, setReturnFocusTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const headingId = useId();

  const selected = days[selectedDay - 1];
  const onSelectedDay = optimistic.outfits.filter(
    (outfit) => outfit.day === selectedDay,
  );
  const itemsOf = (outfitId: string) =>
    optimistic.items.filter((item) => item.outfitId === outfitId);

  /** A field open on one day shouldn't wait for you on another. */
  function selectDay(day: number) {
    setSelectedDay(day);
    setOpenField(null);
    setReturnFocusTo(null);
  }

  function open(key: string) {
    setError(null);
    setReturnFocusTo(null);
    setOpenField(key);
  }

  function close(key: string, restoreFocus: boolean) {
    setOpenField((current) => (current === key ? null : current));
    if (restoreFocus) setReturnFocusTo(key);
  }

  /** Runs inside the add form's action, so the optimistic row is allowed. */
  async function addToDay(name: string) {
    setError(null);
    const day = selectedDay;
    applyOptimistic({
      type: "add-outfit",
      outfit: { id: pendingId(), day, name },
    });
    const result = await addOutfit(tripId, day, name);
    return result.error;
  }

  /** As above, from an outfit's add-item field. */
  async function addItem(outfitId: string, name: string) {
    setError(null);
    applyOptimistic({
      type: "add-item",
      item: { id: pendingId(), outfitId, name },
    });
    const result = await addOutfitItem(tripId, outfitId, name);
    return result.error;
  }

  /** Shows a change at once and saves it; a failure rolls back and says so. */
  function save(change: Change, action: () => Promise<OutfitActionResult>) {
    setError(null);
    startTransition(async () => {
      applyOptimistic(change);
      const result = await action();
      if (result.error) setError(result.error);
    });
  }

  function editOutfit(id: string, name: string) {
    close(editKey(id), true);
    save({ type: "edit-outfit", id, name }, () => updateOutfit(id, name));
  }

  function removeOutfit(id: string) {
    close(editKey(id), false);
    save({ type: "delete-outfit", id }, () => deleteOutfit(id));
  }

  function editItem(id: string, name: string) {
    close(editKey(id), true);
    save({ type: "edit-item", id, name }, () => updateOutfitItem(id, name));
  }

  function removeItem(id: string) {
    close(editKey(id), false);
    save({ type: "delete-item", id }, () => deleteOutfitItem(id));
  }

  return (
    <div className="flex flex-col gap-6">
      <DayPicker
        days={days}
        defaultDay={selectedDay}
        today={today}
        onChange={selectDay}
      />

      {error ? (
        <p role="alert" className={errorClass}>
          {error}
        </p>
      ) : null}

      <section aria-labelledby={headingId} className="flex flex-col gap-3">
        <h2
          id={headingId}
          className="px-1 text-lg font-bold tracking-[-0.01em]"
        >
          {selectedDay === today ? "Today" : `Day ${selectedDay}`}
          <span className="font-semibold text-muted"> · {selected.label}</span>
        </h2>
        <div className="divide-y divide-hair overflow-hidden rounded-3xl bg-surface shadow-card">
          {onSelectedDay.length > 0 ? (
            <ul className="divide-y divide-hair">
              {onSelectedDay.map((outfit) => {
                const outfitItems = itemsOf(outfit.id);
                const addKey = addItemKey(outfit.id);
                return (
                  <li key={outfit.id}>
                    {openField === editKey(outfit.id) ? (
                      <EditNameForm
                        label="Outfit name"
                        what="outfit"
                        initialName={outfit.name}
                        maxLength={MAX_OUTFIT_NAME_LENGTH}
                        placeholder="Beach day, dinner out…"
                        onSave={(name) => editOutfit(outfit.id, name)}
                        onCancel={(restoreFocus) =>
                          close(editKey(outfit.id), restoreFocus)
                        }
                      />
                    ) : (
                      <OutfitRow
                        outfit={outfit}
                        itemCount={outfitItems.length}
                        returnFocus={returnFocusTo === editKey(outfit.id)}
                        onEdit={() => open(editKey(outfit.id))}
                        onDelete={() => removeOutfit(outfit.id)}
                      />
                    )}

                    {/*
                      Inset to line up with the outfit's name, so the items
                      read as belonging to it; the dividers start there too.
                    */}
                    <div className="ml-20.5 divide-y divide-hair border-t border-hair">
                      {outfitItems.length > 0 ? (
                        <ul
                          aria-label={`In ${outfit.name}`}
                          className="divide-y divide-hair"
                        >
                          {outfitItems.map((item) => (
                            <li key={item.id}>
                              {openField === editKey(item.id) ? (
                                <EditNameForm
                                  label="Item name"
                                  what="item"
                                  initialName={item.name}
                                  maxLength={MAX_OUTFIT_ITEM_NAME_LENGTH}
                                  placeholder="White t-shirt, sunglasses…"
                                  onSave={(name) => editItem(item.id, name)}
                                  onCancel={(restoreFocus) =>
                                    close(editKey(item.id), restoreFocus)
                                  }
                                />
                              ) : (
                                <ItemRow
                                  item={item}
                                  returnFocus={
                                    returnFocusTo === editKey(item.id)
                                  }
                                  onEdit={() => open(editKey(item.id))}
                                  onDelete={() => removeItem(item.id)}
                                />
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : null}

                      {openField === addKey ? (
                        <AddNameForm
                          label={`New item for ${outfit.name}`}
                          what="item"
                          maxLength={MAX_OUTFIT_ITEM_NAME_LENGTH}
                          placeholder="White t-shirt, sunglasses…"
                          autoFocus
                          className="py-3 pr-3"
                          onAdd={(name) => addItem(outfit.id, name)}
                          onClose={(restoreFocus) => close(addKey, restoreFocus)}
                        />
                      ) : (
                        <AddItemButton
                          label={`Add item to ${outfit.name}`}
                          disabled={isPending(outfit)}
                          autoFocus={returnFocusTo === addKey}
                          onClick={() => open(addKey)}
                        />
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="px-4 py-4">
              <p className="text-base font-bold">No outfits for this day</p>
              <p className="mt-0.5 text-[15px] leading-snug text-muted">
                Add one and list what you&apos;ll wear in it.
              </p>
            </div>
          )}
          {/* Keyed by day so a half-typed name doesn't follow you to another day. */}
          <AddNameForm
            key={selectedDay}
            label="New outfit name"
            what="outfit"
            maxLength={MAX_OUTFIT_NAME_LENGTH}
            placeholder="Add an outfit"
            className="p-3"
            onAdd={addToDay}
          />
        </div>
      </section>
    </div>
  );
}

/**
 * An outfit's own row: its tile, name and item count, and the ⋮ menu. The
 * tile is a dashed plus while the outfit is empty and the tee once it has
 * something in it. An outfit the server hasn't confirmed yet can't be edited
 * or deleted.
 */
function OutfitRow({
  outfit,
  itemCount: count,
  returnFocus,
  onEdit,
  onDelete,
}: {
  outfit: Outfit;
  itemCount: number;
  returnFocus: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const pending = isPending(outfit);

  return (
    <div
      className={[
        "flex items-center gap-3 py-3.5 pl-3.5 transition-opacity duration-200 ease-out-quint",
        pending ? "opacity-60" : "",
      ].join(" ")}
    >
      {count > 0 ? (
        <span
          aria-hidden="true"
          className="flex h-13 w-13 shrink-0 items-center justify-center rounded-[1.1rem] bg-brand-soft text-brand-text"
        >
          <OutfitIcon className="h-6 w-6" />
        </span>
      ) : (
        <span
          aria-hidden="true"
          className="flex h-13 w-13 shrink-0 items-center justify-center rounded-[1.1rem] border-2 border-dashed border-field-edge text-muted"
        >
          <PlusIcon className="h-5 w-5" />
        </span>
      )}
      <span className="min-w-0 flex-1 pl-1">
        <span className="block text-base leading-tight font-bold break-words">
          {outfit.name}
        </span>
        <span className="tabular mt-1 block text-sm text-muted">
          {count > 0 ? itemCount(count) : "Not planned yet"}
        </span>
      </span>
      <ItemMenu
        itemName={outfit.name}
        disabled={pending}
        autoFocus={returnFocus}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}

/** Something in an outfit: its name and the ⋮ menu, with no icon. */
function ItemRow({
  item,
  returnFocus,
  onEdit,
  onDelete,
}: {
  item: OutfitItem;
  returnFocus: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const pending = isPending(item);

  return (
    <div
      className={[
        "flex items-center gap-2 py-1 transition-opacity duration-200 ease-out-quint",
        pending ? "opacity-60" : "",
      ].join(" ")}
    >
      <span className="min-w-0 flex-1 py-2 text-base leading-snug break-words text-ink">
        {item.name}
      </span>
      <ItemMenu
        itemName={item.name}
        disabled={pending}
        autoFocus={returnFocus}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}

/** The row under an outfit's items that opens its add field. */
function AddItemButton({
  label,
  disabled,
  autoFocus,
  onClick,
}: {
  label: string;
  disabled: boolean;
  autoFocus: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      autoFocus={autoFocus}
      onClick={onClick}
      className="group flex w-full items-center gap-2.5 py-3 pr-4 text-[15px] font-semibold text-brand-text transition-[background-color,opacity] duration-200 ease-out-quint active:bg-surface-sunk disabled:opacity-40 focus-visible:bg-surface-sunk focus-visible:outline-none"
    >
      <span
        aria-hidden="true"
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-soft transition-[scale] duration-200 ease-out-quint group-focus-visible:ring-4 group-focus-visible:ring-brand/25 group-active:scale-90"
      >
        <PlusIcon className="h-3.5 w-3.5" />
      </span>
      Add item
    </button>
  );
}

/**
 * An edit field, in place of an outfit's or an item's row: the name, with
 * Cancel and Save, as on Packing and Food. Saving closes it straight away;
 * the list shows the new name while the server catches up. Escape cancels.
 */
function EditNameForm({
  label,
  what,
  initialName,
  maxLength,
  placeholder,
  onSave,
  onCancel,
}: {
  label: string;
  what: "outfit" | "item";
  initialName: string;
  maxLength: number;
  placeholder: string;
  onSave: (name: string) => void;
  onCancel: (restoreFocus: boolean) => void;
}) {
  const id = useId();
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);

  function submit() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError(`Give the ${what} a name.`);
      return;
    }
    if (trimmed === initialName) {
      onCancel(true);
      return;
    }
    onSave(trimmed);
  }

  return (
    <form
      action={submit}
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        event.preventDefault();
        onCancel(true);
      }}
      aria-label={`Edit ${initialName}`}
      className="flex flex-col gap-2.5 bg-surface-sunk p-3"
    >
      <label htmlFor={`${id}-name`} className="sr-only">
        {label}
      </label>
      <input
        id={`${id}-name`}
        value={name}
        onChange={(event) => setName(event.target.value)}
        maxLength={maxLength}
        autoFocus
        autoComplete="off"
        enterKeyHint="done"
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`w-full px-4 ${fieldClass}`}
      />

      {error ? (
        <p id={`${id}-error`} role="alert" className={errorClass}>
          {error}
        </p>
      ) : null}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => onCancel(true)}
          className={cancelClass}
        >
          Cancel
        </button>
        <button type="submit" className={saveClass}>
          Save
        </button>
      </div>
    </form>
  );
}

/**
 * An add field: a name and Add. It clears and keeps focus after adding, so
 * several can go in a row. Given `onClose` (an outfit's add-item field), it
 * also closes on Escape, or when you tap away from it empty, as on Packing.
 */
function AddNameForm({
  label,
  what,
  maxLength,
  placeholder,
  autoFocus = false,
  className,
  onAdd,
  onClose,
}: {
  label: string;
  what: "outfit" | "item";
  maxLength: number;
  placeholder: string;
  autoFocus?: boolean;
  className: string;
  onAdd: (name: string) => Promise<string | undefined>;
  onClose?: (restoreFocus: boolean) => void;
}) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError(`Give the ${what} a name.`);
      return;
    }

    setError(null);
    setName("");
    inputRef.current?.focus();

    const message = await onAdd(trimmed);
    if (message) {
      setError(message);
      setName(trimmed);
    }
  }

  return (
    <form
      action={submit}
      onKeyDown={
        onClose
          ? (event) => {
              if (event.key !== "Escape") return;
              event.preventDefault();
              onClose(true);
            }
          : undefined
      }
      onBlur={
        onClose
          ? (event) => {
              if (event.currentTarget.contains(event.relatedTarget)) return;
              if (!name.trim() && !error) onClose(false);
            }
          : undefined
      }
      className={`flex flex-col gap-2.5 ${className}`}
    >
      <div className="flex gap-2.5">
        <label htmlFor={`${id}-name`} className="sr-only">
          {label}
        </label>
        <input
          ref={inputRef}
          id={`${id}-name`}
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={maxLength}
          autoFocus={autoFocus}
          autoComplete="off"
          enterKeyHint="done"
          placeholder={placeholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`min-w-0 flex-1 px-4 ${fieldClass}`}
        />
        <button type="submit" className={submitClass}>
          <PlusIcon className="h-5 w-5" />
          <span className="pr-2 max-sm:sr-only">Add</span>
        </button>
      </div>

      {error ? (
        <p id={`${id}-error`} role="alert" className={errorClass}>
          {error}
        </p>
      ) : null}
    </form>
  );
}
