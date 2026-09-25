"use client";

import {
  type ReactNode,
  useEffect,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from "react";

import { addPackingItem, setPackedCount } from "@/app/actions/packing";
import { EmptyState } from "@/components/app/screen";
import {
  CheckIcon,
  MinusIcon,
  PackingIcon,
  PlusIcon,
} from "@/components/nav/nav-icons";
import {
  MAX_ITEM_NAME_LENGTH,
  MAX_ITEM_QUANTITY,
  isPacked,
  type PackingItem,
} from "@/lib/packing/types";

type Change =
  | { type: "add"; item: PackingItem }
  | { type: "count"; id: string; packedCount: number };

function applyChange(items: PackingItem[], change: Change): PackingItem[] {
  switch (change.type) {
    case "add":
      return [...items, change.item];
    case "count":
      return items.map((item) =>
        item.id === change.id
          ? { ...item, packedCount: change.packedCount }
          : item,
      );
  }
}

/** Ids for items the server hasn't confirmed yet. They can't be changed. */
const PENDING_PREFIX = "pending-";

type FormError = { message: string; field?: "name" | "quantity" };

const fieldClass =
  "rounded-2xl border border-field-edge bg-surface py-3 text-base text-ink shadow-card outline-none transition-[border-color,box-shadow] duration-200 ease-out placeholder:text-muted focus-visible:border-brand focus-visible:ring-4 focus-visible:ring-brand/20 aria-invalid:border-danger aria-invalid:ring-4 aria-invalid:ring-danger/20";

/**
 * The packing checklist: an add field with an optional quantity, then every
 * item. Single items tick on and off; bulk items ("T-shirt ×5") also step up
 * and down one at a time and show how many are in. Changes show instantly and
 * settle when the server re-renders the page with the saved list; a failure
 * rolls back and says so.
 */
export function PackingList({ items }: { items: PackingItem[] }) {
  const [optimisticItems, applyOptimistic] = useOptimistic(items, applyChange);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [error, setError] = useState<FormError | null>(null);
  const [, startTransition] = useTransition();

  const packedCount = optimisticItems.filter(isPacked).length;

  async function add() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError({ message: "Give the item a name.", field: "name" });
      return;
    }

    // Blank means one; the field only accepts digits, so this is 0–99.
    const count = quantity ? Number(quantity) : 1;
    if (count < 1) {
      setError({
        message: `Quantity is a whole number from 1 to ${MAX_ITEM_QUANTITY}.`,
        field: "quantity",
      });
      return;
    }

    setError(null);
    setName("");
    setQuantity("");
    applyOptimistic({
      type: "add",
      item: {
        id: `${PENDING_PREFIX}${Date.now()}`,
        name: trimmed,
        quantity: count,
        packedCount: 0,
      },
    });

    const result = await addPackingItem(trimmed, count);
    if (result.error) {
      setError({ message: result.error });
      setName(trimmed);
      setQuantity(quantity);
    }
  }

  function setCount(id: string, next: number) {
    setError(null);
    startTransition(async () => {
      applyOptimistic({ type: "count", id, packedCount: next });
      const result = await setPackedCount(id, next);
      if (result.error) setError({ message: result.error });
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
          placeholder="What to bring"
          aria-invalid={error?.field === "name" ? true : undefined}
          aria-describedby={error ? "packing-error" : undefined}
          className={`min-w-0 flex-1 px-4 ${fieldClass}`}
        />

        <label htmlFor="packing-item-quantity" className="sr-only">
          Quantity (optional)
        </label>
        <div className="relative w-13 shrink-0">
          {/* <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-base font-semibold text-muted"
          >
            ×
          </span> */}
          <input
            id="packing-item-quantity"
            value={quantity}
            // Digits only, at most two: the range check is then just "not 0".
            onChange={(event) =>
              setQuantity(event.target.value.replace(/\D/g, "").slice(0, 2))
            }
            inputMode="numeric"
            autoComplete="off"
            enterKeyHint="done"
            placeholder="1"
            aria-invalid={error?.field === "quantity" ? true : undefined}
            aria-describedby={error ? "packing-error" : undefined}
            className={`tabular w-full ${fieldClass} text-center`}
          />
        </div>

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
          {error.message}
        </p>
      ) : null}

      {optimisticItems.length === 0 ? (
        <EmptyState
          icon={<PackingIcon className="h-10 w-10" />}
          title="Your packing list is empty"
        >
          Add the first thing you need to bring, then tick it off as it goes in
          the bag. Bringing several? Set a quantity and pack them one at a time.
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
                <PackingRow item={item} onSetCount={setCount} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

/**
 * One item. The label (check and name) is the tap target for "all in / all
 * out"; the native checkbox stays in the DOM for keyboard and screen readers
 * and the round check is drawn beside it. A bulk item's checkbox reads as
 * mixed while partly packed, and a −/+ stepper sits outside the label so its
 * taps don't also toggle the checkbox.
 */
function PackingRow({
  item,
  onSetCount,
}: {
  item: PackingItem;
  onSetCount: (id: string, packedCount: number) => void;
}) {
  const pending = item.id.startsWith(PENDING_PREFIX);
  const bulk = item.quantity > 1;
  const packed = isPacked(item);
  const partial = item.packedCount > 0 && !packed;

  // `indeterminate` is a DOM property with no attribute, so React can't set it.
  const checkboxRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (checkboxRef.current) checkboxRef.current.indeterminate = partial;
  }, [partial]);

  return (
    <div className="flex items-center">
      <label
        className={[
          "flex min-w-0 flex-1 items-center gap-3.5 py-3.5 pl-4 transition-[background-color,opacity] duration-200 ease-out-quint",
          bulk ? "pr-2" : "pr-4",
          pending
            ? "opacity-60"
            : "cursor-pointer active:bg-surface-sunk has-focus-visible:bg-surface-sunk",
        ].join(" ")}
      >
        <input
          ref={checkboxRef}
          type="checkbox"
          checked={packed}
          disabled={pending}
          onChange={(event) =>
            onSetCount(item.id, event.target.checked ? item.quantity : 0)
          }
          className="peer sr-only"
        />
        {bulk ? (
          <ProgressCheck
            packedCount={item.packedCount}
            quantity={item.quantity}
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-field-edge text-transparent transition-[background-color,border-color,color,scale] duration-200 ease-out-quint peer-checked:border-brand peer-checked:bg-brand peer-checked:text-brand-ink peer-focus-visible:ring-4 peer-focus-visible:ring-brand/25 peer-active:scale-90"
          >
            <CheckIcon className="h-4 w-4" />
          </span>
        )}
        <span className="flex min-w-0 flex-1 flex-col">
          <span
            className={[
              "text-base leading-snug font-semibold break-words transition-colors duration-200",
              packed ? "text-muted line-through" : "text-ink",
            ].join(" ")}
          >
            {item.name}
          </span>
          {bulk ? (
            <span className="tabular text-sm leading-snug font-medium text-muted">
              {item.packedCount} of {item.quantity} packed
            </span>
          ) : null}
        </span>
      </label>

      {bulk ? (
        <div className="flex shrink-0 items-center gap-1.5 pr-3">
          <StepButton
            label={`Unpack one ${item.name}`}
            disabled={pending || item.packedCount === 0}
            onClick={() => onSetCount(item.id, item.packedCount - 1)}
          >
            <MinusIcon className="h-5 w-5" />
          </StepButton>
          <StepButton
            label={`Pack one ${item.name}`}
            disabled={pending || packed}
            onClick={() => onSetCount(item.id, item.packedCount + 1)}
          >
            <PlusIcon className="h-5 w-5" />
          </StepButton>
        </div>
      ) : null}
    </div>
  );
}

/**
 * The bulk item's check: a ring that fills clockwise as items go in, becoming
 * the same solid emerald check as a single item once they're all packed.
 * Must follow the checkbox as its `peer`.
 */
function ProgressCheck({
  packedCount,
  quantity,
}: {
  packedCount: number;
  quantity: number;
}) {
  const radius = 12.5;
  const circumference = 2 * Math.PI * radius;
  const complete = packedCount >= quantity;

  return (
    <span
      aria-hidden="true"
      className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-[scale] duration-200 ease-out-quint peer-focus-visible:ring-4 peer-focus-visible:ring-brand/25 peer-active:scale-90"
    >
      <svg viewBox="0 0 28 28" className="absolute inset-0 h-7 w-7 -rotate-90">
        <circle
          cx="14"
          cy="14"
          r={radius}
          fill="none"
          strokeWidth="2"
          className="stroke-field-edge"
        />
        <circle
          cx="14"
          cy="14"
          r={radius}
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - packedCount / quantity)}
          className={[
            "stroke-brand transition-[stroke-dashoffset,opacity] duration-200 ease-out-quint",
            packedCount === 0 ? "opacity-0" : "",
          ].join(" ")}
        />
      </svg>
      <span
        className={[
          "relative flex h-7 w-7 items-center justify-center rounded-full transition-[background-color,color] duration-200 ease-out-quint",
          complete ? "bg-brand text-brand-ink" : "text-transparent",
        ].join(" ")}
      >
        <CheckIcon className="h-4 w-4" />
      </span>
    </span>
  );
}

function StepButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-soft text-brand-text transition-[scale,opacity] duration-200 ease-out-quint active:scale-90 disabled:opacity-40 disabled:active:scale-100 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none"
    >
      {children}
    </button>
  );
}
