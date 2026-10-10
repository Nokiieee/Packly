"use client";

import { useId, useOptimistic, useRef, useState, useTransition } from "react";

import { addOutfit, deleteOutfit, updateOutfit } from "@/app/actions/outfits";
import {
  cancelClass,
  errorClass,
  fieldClass,
  saveClass,
  submitClass,
} from "@/components/app/form-styles";
import { ItemMenu } from "@/components/app/item-menu";
import { PlusIcon } from "@/components/nav/nav-icons";
import { DayPicker } from "@/components/trips/day-picker";
import { MAX_OUTFIT_NAME_LENGTH, type Outfit } from "@/lib/outfits/types";
import type { TripDay } from "@/lib/trips/dates";

/** Ids for rows the server hasn't confirmed yet. */
const PENDING_PREFIX = "pending-";

let pendingCount = 0;
function pendingId() {
  pendingCount += 1;
  return `${PENDING_PREFIX}${pendingCount}`;
}

type Change =
  | { type: "add"; outfit: Outfit }
  | { type: "edit"; id: string; name: string }
  | { type: "delete"; id: string };

function applyChange(outfits: Outfit[], change: Change): Outfit[] {
  switch (change.type) {
    case "add":
      return [...outfits, change.outfit];
    case "edit":
      return outfits.map((outfit) =>
        outfit.id === change.id ? { ...outfit, name: change.name } : outfit,
      );
    case "delete":
      return outfits.filter((outfit) => outfit.id !== change.id);
  }
}

/**
 * A trip's outfits, day by day: the day strip, then the selected day's
 * outfits in one card, with the field to add another at the bottom. Each day
 * starts with a Day and a Night outfit (the database adds them), which the ⋮
 * menu renames or deletes like any other.
 *
 * The strip starts on today during the trip and on Day 1 before it, as on
 * Food. Changes show at once and settle when the server re-renders the page
 * with the saved list; a failure rolls back and says so.
 */
export function OutfitDays({
  tripId,
  outfits,
  days,
  today,
}: {
  tripId: string;
  outfits: Outfit[];
  days: TripDay[];
  /** Today's day number during the trip; omit before it. */
  today?: number;
}) {
  const [optimistic, applyOptimistic] = useOptimistic(outfits, applyChange);
  const [selectedDay, setSelectedDay] = useState(today ?? 1);
  const [editingId, setEditingId] = useState<string | null>(null);
  // The row whose ⋮ button takes focus back once its edit closes.
  const [returnFocusId, setReturnFocusId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const headingId = useId();

  const selected = days[selectedDay - 1];
  const onSelectedDay = optimistic.filter(
    (outfit) => outfit.day === selectedDay,
  );

  /** Runs inside the add form's action, so the optimistic row is allowed. */
  async function add(name: string) {
    setError(null);
    const day = selectedDay;
    applyOptimistic({ type: "add", outfit: { id: pendingId(), day, name } });
    const result = await addOutfit(tripId, day, name);
    return result.error;
  }

  function startEdit(id: string) {
    setError(null);
    setReturnFocusId(null);
    setEditingId(id);
  }

  function cancelEdit(id: string, restoreFocus: boolean) {
    setEditingId((current) => (current === id ? null : current));
    if (restoreFocus) setReturnFocusId(id);
  }

  /** The edit field closes at once; a failed save rolls back and says so. */
  function edit(id: string, name: string) {
    setError(null);
    cancelEdit(id, true);
    startTransition(async () => {
      applyOptimistic({ type: "edit", id, name });
      const result = await updateOutfit(id, name);
      if (result.error) setError(result.error);
    });
  }

  function remove(id: string) {
    setError(null);
    cancelEdit(id, false);
    startTransition(async () => {
      applyOptimistic({ type: "delete", id });
      const result = await deleteOutfit(id);
      if (result.error) setError(result.error);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <DayPicker
        days={days}
        defaultDay={selectedDay}
        today={today}
        onChange={setSelectedDay}
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
              {onSelectedDay.map((outfit) => (
                <li key={outfit.id}>
                  {editingId === outfit.id ? (
                    <EditOutfitForm
                      outfit={outfit}
                      onSave={(name) => edit(outfit.id, name)}
                      onCancel={(restoreFocus) =>
                        cancelEdit(outfit.id, restoreFocus)
                      }
                    />
                  ) : (
                    <OutfitRow
                      outfit={outfit}
                      returnFocus={returnFocusId === outfit.id}
                      onEdit={() => startEdit(outfit.id)}
                      onDelete={() => remove(outfit.id)}
                    />
                  )}
                </li>
              ))}
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
          <AddOutfitForm key={selectedDay} onAdd={add} />
        </div>
      </section>
    </div>
  );
}

/**
 * One outfit of the day: a dashed tile with a plus while it has nothing in
 * it, its name, and the ⋮ menu. An outfit the server hasn't confirmed yet
 * can't be edited or deleted.
 */
function OutfitRow({
  outfit,
  returnFocus,
  onEdit,
  onDelete,
}: {
  outfit: Outfit;
  returnFocus: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const pending = outfit.id.startsWith(PENDING_PREFIX);

  return (
    <div
      className={[
        "flex items-center gap-3 py-3.5 pl-3.5 transition-opacity duration-200 ease-out-quint",
        pending ? "opacity-60" : "",
      ].join(" ")}
    >
      <span
        aria-hidden="true"
        className="flex h-13 w-13 shrink-0 items-center justify-center rounded-[1.1rem] border-2 border-dashed border-field-edge text-muted"
      >
        <PlusIcon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1 pl-1">
        <span className="block text-base leading-tight font-bold break-words">
          {outfit.name}
        </span>
        <span className="mt-1 block text-sm text-muted">Not planned yet</span>
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

/**
 * An outfit's edit field, in place of its row: the name, with Cancel and
 * Save, as on Packing and Food. Saving closes it straight away; the list
 * shows the new name while the server catches up. Escape cancels.
 */
function EditOutfitForm({
  outfit,
  onSave,
  onCancel,
}: {
  outfit: Outfit;
  onSave: (name: string) => void;
  onCancel: (restoreFocus: boolean) => void;
}) {
  const id = useId();
  const [name, setName] = useState(outfit.name);
  const [error, setError] = useState<string | null>(null);

  function submit() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Give the outfit a name.");
      return;
    }
    if (trimmed === outfit.name) {
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
      aria-label={`Edit ${outfit.name}`}
      className="flex flex-col gap-2.5 bg-surface-sunk p-3"
    >
      <label htmlFor={`${id}-name`} className="sr-only">
        Outfit name
      </label>
      <input
        id={`${id}-name`}
        value={name}
        onChange={(event) => setName(event.target.value)}
        maxLength={MAX_OUTFIT_NAME_LENGTH}
        autoFocus
        autoComplete="off"
        enterKeyHint="done"
        placeholder="Beach day, dinner out…"
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
 * The add field: a name and Add, for the day the strip shows. It clears and
 * keeps focus after adding, so several outfits can go in a row.
 */
function AddOutfitForm({
  onAdd,
}: {
  onAdd: (name: string) => Promise<string | undefined>;
}) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Give the outfit a name.");
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
    <form action={submit} className="flex flex-col gap-2.5 p-3">
      <div className="flex gap-2.5">
        <label htmlFor={`${id}-name`} className="sr-only">
          New outfit name
        </label>
        <input
          ref={inputRef}
          id={`${id}-name`}
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={MAX_OUTFIT_NAME_LENGTH}
          autoComplete="off"
          enterKeyHint="done"
          placeholder="Add an outfit"
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
