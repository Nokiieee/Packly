"use client";

import {
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
  useEffect,
  useId,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from "react";

import {
  addPackingCategory,
  addPackingItem,
  deletePackingCategory,
  deletePackingItem,
  setPackedCount,
  updatePackingItem,
} from "@/app/actions/packing";
import { EmptyState } from "@/components/app/screen";
import {
  CheckIcon,
  MinusIcon,
  MoreIcon,
  PackingIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from "@/components/nav/nav-icons";
import {
  MAX_CATEGORY_NAME_LENGTH,
  MAX_ITEM_NAME_LENGTH,
  MAX_ITEM_QUANTITY,
  isPacked,
  type PackingCategory,
  type PackingItem,
} from "@/lib/packing/types";

type ListState = { items: PackingItem[]; categories: PackingCategory[] };

type Change =
  | { type: "add"; item: PackingItem }
  | { type: "count"; id: string; packedCount: number }
  | { type: "edit"; id: string; name: string; quantity: number }
  | { type: "delete"; id: string }
  | { type: "add-category"; category: PackingCategory }
  | { type: "delete-category"; id: string };

function applyChange(state: ListState, change: Change): ListState {
  switch (change.type) {
    case "add":
      return { ...state, items: [...state.items, change.item] };
    case "count":
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === change.id
            ? { ...item, packedCount: change.packedCount }
            : item,
        ),
      };
    case "edit":
      // Mirrors the server: a lower quantity pulls the packed count down.
      return {
        ...state,
        items: state.items.map((item) =>
          item.id === change.id
            ? {
                ...item,
                name: change.name,
                quantity: change.quantity,
                packedCount: Math.min(item.packedCount, change.quantity),
              }
            : item,
        ),
      };
    case "delete":
      return {
        ...state,
        items: state.items.filter((item) => item.id !== change.id),
      };
    case "add-category":
      return { ...state, categories: [...state.categories, change.category] };
    case "delete-category":
      // Mirrors the foreign key: the items fall back to the ungrouped section.
      return {
        categories: state.categories.filter(
          (category) => category.id !== change.id,
        ),
        items: state.items.map((item) =>
          item.categoryId === change.id ? { ...item, categoryId: null } : item,
        ),
      };
  }
}

/** Ids for rows the server hasn't confirmed yet. They can't be changed. */
const PENDING_PREFIX = "pending-";

let pendingCount = 0;
function pendingId() {
  pendingCount += 1;
  return `${PENDING_PREFIX}${pendingCount}`;
}

/**
 * Which field is open. Only one is at a time: the ungrouped section's add
 * field, a category's (keyed by its id), the new-category field, or an item
 * being edited.
 */
const UNGROUPED = "ungrouped";
const NEW_CATEGORY = "new-category";
const editKey = (itemId: string) => `edit-${itemId}`;

type FormError = { message: string; field?: "name" | "quantity" };

/**
 * Reads the name and quantity fields. A blank quantity means one; the field
 * only accepts digits, so the range check is just "not 0".
 */
function parseItem(
  name: string,
  quantity: string,
): { name: string; quantity: number } | FormError {
  const trimmed = name.trim();
  if (!trimmed) return { message: "Give the item a name.", field: "name" };

  const count = quantity ? Number(quantity) : 1;
  if (count < 1) {
    return {
      message: `Quantity is a whole number from 1 to ${MAX_ITEM_QUANTITY}.`,
      field: "quantity",
    };
  }
  return { name: trimmed, quantity: count };
}

const fieldClass =
  "rounded-2xl border border-field-edge bg-surface py-3 text-base text-ink outline-none transition-[border-color,box-shadow] duration-200 ease-out placeholder:text-muted focus-visible:border-brand focus-visible:ring-4 focus-visible:ring-brand/20 aria-invalid:border-danger aria-invalid:ring-4 aria-invalid:ring-danger/20";

const submitClass =
  "inline-flex shrink-0 items-center gap-1 rounded-full bg-brand px-5 text-base font-bold text-brand-ink shadow-hero transition-[background-color,scale] duration-200 ease-out-quint hover:bg-brand-deep active:scale-95 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none max-sm:rounded-[14px]";

const errorClass =
  "rounded-2xl bg-danger-soft px-4 py-3 text-sm font-medium text-danger";

/**
 * Splits items into the ungrouped section and one list per category. An item
 * whose category isn't in the list is shown ungrouped rather than dropped.
 */
function groupItems({ items, categories }: ListState) {
  const byCategory = new Map<string | null, PackingItem[]>(
    categories.map((category) => [category.id, []]),
  );
  byCategory.set(null, []);
  for (const item of items) {
    const key =
      item.categoryId !== null && byCategory.has(item.categoryId)
        ? item.categoryId
        : null;
    byCategory.get(key)!.push(item);
  }
  return (categoryId: string | null) => byCategory.get(categoryId) ?? [];
}

function packedSummary(items: PackingItem[]) {
  return `${items.filter(isPacked).length} of ${items.length} packed`;
}

/**
 * The packing checklist. Items sit in the ungrouped section by default, which
 * always comes first; named categories ("Electronics") are opt-in and follow
 * it. Every section has its own add row, so an item goes straight into the
 * group it belongs to. Deleting a category keeps its items, back in the
 * ungrouped section.
 *
 * Single items tick on and off; bulk items ("T-shirt ×5") also step up and
 * down one at a time. Changes show instantly and settle when the server
 * re-renders the page with the saved list; a failure rolls back and says so.
 */
export function PackingList({ items, categories }: ListState) {
  const [optimistic, applyOptimistic] = useOptimistic<ListState, Change>(
    { items, categories },
    applyChange,
  );
  const empty =
    optimistic.items.length === 0 && optimistic.categories.length === 0;

  // A new list opens on its add field, so the first item is one tap away.
  const [openField, setOpenField] = useState<string | null>(
    empty ? UNGROUPED : null,
  );
  // Focus moves into a field the user opened, never into one open on load.
  const [focusField, setFocusField] = useState(false);
  // The control to refocus after its field closes: an add row, or an item's
  // menu button once its edit is saved or cancelled.
  const [returnFocusTo, setReturnFocusTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const itemsIn = groupItems(optimistic);

  function open(key: string) {
    setError(null);
    setReturnFocusTo(null);
    setFocusField(true);
    setOpenField(key);
  }

  function close(key: string, restoreFocus: boolean) {
    setOpenField((current) => (current === key ? null : current));
    if (restoreFocus) setReturnFocusTo(key);
  }

  /** Runs inside the add form's action, so the optimistic row is allowed. */
  async function addItem(
    name: string,
    quantity: number,
    categoryId: string | null,
  ) {
    setError(null);
    applyOptimistic({
      type: "add",
      item: {
        id: pendingId(),
        name,
        quantity,
        packedCount: 0,
        categoryId,
      },
    });
    const result = await addPackingItem(name, quantity, categoryId);
    return result.error;
  }

  async function addCategory(name: string) {
    setError(null);
    applyOptimistic({
      type: "add-category",
      category: { id: pendingId(), name },
    });
    const result = await addPackingCategory(name);
    if (result.error) return result.error;

    // Straight on to filling it, unless another field was opened meanwhile.
    const id = result.id;
    if (id) setOpenField((current) => (current === NEW_CATEGORY ? id : current));
  }

  function setCount(id: string, next: number) {
    setError(null);
    startTransition(async () => {
      applyOptimistic({ type: "count", id, packedCount: next });
      const result = await setPackedCount(id, next);
      if (result.error) setError(result.error);
    });
  }

  /** The edit field closes at once; a failed save rolls back and says so. */
  function editItem(id: string, name: string, quantity: number) {
    setError(null);
    close(editKey(id), true);
    startTransition(async () => {
      applyOptimistic({ type: "edit", id, name, quantity });
      const result = await updatePackingItem(id, name, quantity);
      if (result.error) setError(result.error);
    });
  }

  function deleteItem(id: string) {
    setError(null);
    close(editKey(id), false);
    startTransition(async () => {
      applyOptimistic({ type: "delete", id });
      const result = await deletePackingItem(id);
      if (result.error) setError(result.error);
    });
  }

  function deleteCategory(id: string) {
    setError(null);
    close(id, false);
    startTransition(async () => {
      applyOptimistic({ type: "delete-category", id });
      const result = await deletePackingCategory(id);
      if (result.error) setError(result.error);
    });
  }

  function rowProps(item: PackingItem): RowProps {
    const key = editKey(item.id);
    return {
      item,
      editing: openField === key,
      returnFocus: returnFocusTo === key,
      onSetCount: setCount,
      onEdit: () => open(key),
      onCancelEdit: (restoreFocus) => close(key, restoreFocus),
      onSave: (name, quantity) => editItem(item.id, name, quantity),
      onDelete: () => deleteItem(item.id),
    };
  }

  function sectionProps(key: string, categoryId: string | null) {
    return {
      items: itemsIn(categoryId),
      adding: openField === key,
      focusField,
      returnFocus: returnFocusTo === key,
      onOpen: () => open(key),
      onClose: (restoreFocus: boolean) => close(key, restoreFocus),
      onAdd: (name: string, quantity: number) =>
        addItem(name, quantity, categoryId),
      rowProps,
    };
  }

  const ungrouped = sectionProps(UNGROUPED, null);

  return (
    <div className="flex flex-col gap-6">
      {error ? (
        <p role="alert" className={errorClass}>
          {error}
        </p>
      ) : null}

      {empty ? (
        <EmptyState
          icon={<PackingIcon className="h-10 w-10" />}
          title="Your packing list is empty"
        >
          Add the first thing you need to bring, then tick it off as it goes in
          the bag. Bringing several? Set a quantity and pack them one at a time.
        </EmptyState>
      ) : null}

      <section
        aria-labelledby="packing-list-heading"
        className="flex flex-col gap-3"
      >
        <div className="flex items-baseline justify-between px-1">
          <h2
            id="packing-list-heading"
            className="text-lg font-bold tracking-[-0.01em]"
          >
            To bring
          </h2>
          {optimistic.items.length > 0 ? (
            <p className="tabular text-sm font-medium text-muted">
              {packedSummary(optimistic.items)}
            </p>
          ) : null}
        </div>

        <SectionCard {...ungrouped} addLabel="Add item" />
      </section>

      {optimistic.categories.map((category) => (
        <CategorySection
          key={category.id}
          category={category}
          onDelete={() => deleteCategory(category.id)}
          {...sectionProps(category.id, category.id)}
        />
      ))}

      {openField === NEW_CATEGORY ? (
        <AddCategoryForm
          existingNames={optimistic.categories.map((category) => category.name)}
          onAdd={addCategory}
          onClose={(restoreFocus) => close(NEW_CATEGORY, restoreFocus)}
        />
      ) : (
        <button
          type="button"
          autoFocus={returnFocusTo === NEW_CATEGORY}
          onClick={() => open(NEW_CATEGORY)}
          className="inline-flex items-center gap-2 self-start rounded-full bg-brand-soft py-3 pr-5 pl-4 text-base font-bold text-brand-text transition-[scale] duration-200 ease-out-quint active:scale-95 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-ground focus-visible:outline-none"
        >
          <PlusIcon className="h-5 w-5" />
          Add category
        </button>
      )}
    </div>
  );
}

type SectionProps = {
  items: PackingItem[];
  adding: boolean;
  focusField: boolean;
  returnFocus: boolean;
  onOpen: () => void;
  onClose: (restoreFocus: boolean) => void;
  onAdd: (name: string, quantity: number) => Promise<string | undefined>;
  rowProps: (item: PackingItem) => RowProps;
};

/**
 * A named group: its heading with a packed count and a remove button, then
 * its card. Until the server confirms it, it can't take items or be removed.
 */
function CategorySection({
  category,
  onDelete,
  ...section
}: SectionProps & { category: PackingCategory; onDelete: () => void }) {
  const headingId = useId();
  const pending = category.id.startsWith(PENDING_PREFIX);

  return (
    <section
      aria-labelledby={headingId}
      className={[
        "flex flex-col gap-3 transition-opacity duration-200 ease-out-quint",
        pending ? "opacity-60" : "",
      ].join(" ")}
    >
      <div className="flex items-center gap-3 pl-1">
        <h3
          id={headingId}
          className="min-w-0 flex-1 text-base font-bold tracking-[-0.01em] break-words"
        >
          {category.name}
        </h3>
        {section.items.length > 0 ? (
          <p className="tabular shrink-0 text-sm font-medium text-muted">
            {packedSummary(section.items)}
          </p>
        ) : null}
        <button
          type="button"
          aria-label={`Remove the ${category.name} category. Its items move to To bring.`}
          disabled={pending}
          onClick={onDelete}
          className="-my-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted transition-[background-color,color,scale] duration-200 ease-out-quint active:scale-90 active:bg-surface active:text-danger disabled:opacity-40 disabled:active:scale-100 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-ground focus-visible:outline-none"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>

      <SectionCard
        {...section}
        disabled={pending}
        addLabel={`Add item to ${category.name}`}
      />
    </section>
  );
}

/** A section's items, then its add row, which opens into the add field. */
function SectionCard({
  items,
  adding,
  focusField,
  returnFocus,
  disabled = false,
  addLabel,
  onOpen,
  onClose,
  onAdd,
  rowProps,
}: SectionProps & { disabled?: boolean; addLabel: string }) {
  return (
    <div className="divide-y divide-hair overflow-hidden rounded-3xl bg-surface shadow-card">
      {items.length > 0 ? (
        <ul className="divide-y divide-hair">
          {items.map((item) => (
            <li key={item.id}>
              <PackingRow {...rowProps(item)} />
            </li>
          ))}
        </ul>
      ) : null}

      {adding && !disabled ? (
        <AddItemForm autoFocus={focusField} onAdd={onAdd} onClose={onClose} />
      ) : (
        <button
          type="button"
          aria-label={addLabel}
          autoFocus={returnFocus}
          disabled={disabled}
          onClick={onOpen}
          className="group flex w-full items-center gap-3.5 px-4 py-3.5 text-base font-semibold text-brand-text transition-[background-color] duration-200 ease-out-quint active:bg-surface-sunk focus-visible:bg-surface-sunk focus-visible:outline-none"
        >
          <span
            aria-hidden="true"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-soft transition-[scale] duration-200 ease-out-quint group-focus-visible:ring-4 group-focus-visible:ring-brand/25 group-active:scale-90"
          >
            <PlusIcon className="h-4 w-4" />
          </span>
          Add item
        </button>
      )}
    </div>
  );
}

/**
 * Escape closes an add field, and so does leaving it empty — tapping away
 * from a field you never typed in shouldn't leave it hanging open.
 */
function dismissHandlers(
  isBlank: () => boolean,
  onClose: (restoreFocus: boolean) => void,
) {
  return {
    onKeyDown(event: KeyboardEvent<HTMLFormElement>) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onClose(true);
    },
    onBlur(event: FocusEvent<HTMLFormElement>) {
      if (event.currentTarget.contains(event.relatedTarget)) return;
      if (isBlank()) onClose(false);
    },
  };
}

/**
 * The add field for one section: a name, an optional quantity, and Add. It
 * stays open after adding so several things can go in a row.
 */
function AddItemForm({
  autoFocus,
  onAdd,
  onClose,
}: {
  autoFocus: boolean;
  onAdd: (name: string, quantity: number) => Promise<string | undefined>;
  onClose: (restoreFocus: boolean) => void;
}) {
  const id = useId();
  const nameRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [error, setError] = useState<FormError | null>(null);
  const dismiss = dismissHandlers(() => !name.trim() && !quantity && !error, onClose);

  async function submit() {
    const parsed = parseItem(name, quantity);
    if ("message" in parsed) {
      setError(parsed);
      return;
    }

    setError(null);
    setName("");
    setQuantity("");
    nameRef.current?.focus();

    const message = await onAdd(parsed.name, parsed.quantity);
    if (message) {
      setError({ message });
      setName(name);
      setQuantity(quantity);
    }
  }

  return (
    <form action={submit} {...dismiss} className="flex flex-col gap-2.5 p-3">
      <div className="flex gap-2.5">
        <ItemFields
          id={id}
          nameRef={nameRef}
          name={name}
          quantity={quantity}
          error={error}
          autoFocus={autoFocus}
          onNameChange={setName}
          onQuantityChange={setQuantity}
        />
        <button type="submit" className={submitClass}>
          <PlusIcon className="h-5 w-5" />
          <span className="pr-2 max-sm:sr-only">Add</span>
        </button>
      </div>

      {error ? (
        <p id={`${id}-error`} role="alert" className={errorClass}>
          {error.message}
        </p>
      ) : null}
    </form>
  );
}

/**
 * An item's edit field, in place of its row: the same name and quantity as
 * adding, with Cancel and Save. Saving closes it straight away; the list
 * shows the change while the server catches up.
 */
function EditItemForm({
  item,
  onSave,
  onCancel,
}: {
  item: PackingItem;
  onSave: (name: string, quantity: number) => void;
  onCancel: (restoreFocus: boolean) => void;
}) {
  const id = useId();
  const [name, setName] = useState(item.name);
  // A single item shows the blank "1" placeholder, as it did when added.
  const [quantity, setQuantity] = useState(
    item.quantity > 1 ? String(item.quantity) : "",
  );
  const [error, setError] = useState<FormError | null>(null);

  function submit() {
    const parsed = parseItem(name, quantity);
    if ("message" in parsed) {
      setError(parsed);
      return;
    }
    if (parsed.name === item.name && parsed.quantity === item.quantity) {
      onCancel(true);
      return;
    }
    onSave(parsed.name, parsed.quantity);
  }

  return (
    <form
      action={submit}
      onKeyDown={(event) => {
        if (event.key !== "Escape") return;
        event.preventDefault();
        onCancel(true);
      }}
      aria-label={`Edit ${item.name}`}
      className="flex flex-col gap-2.5 bg-surface-sunk p-3"
    >
      <div className="flex gap-2.5">
        <ItemFields
          id={id}
          name={name}
          quantity={quantity}
          error={error}
          autoFocus
          onNameChange={setName}
          onQuantityChange={setQuantity}
        />
      </div>

      {error ? (
        <p id={`${id}-error`} role="alert" className={errorClass}>
          {error.message}
        </p>
      ) : null}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => onCancel(true)}
          className="rounded-full px-5 py-2.5 text-base font-bold text-muted transition-[background-color,scale] duration-200 ease-out-quint active:scale-95 active:bg-hair focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-full bg-brand px-6 py-2.5 text-base font-bold text-brand-ink shadow-hero transition-[background-color,scale] duration-200 ease-out-quint hover:bg-brand-deep active:scale-95 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-sunk focus-visible:outline-none"
        >
          Save
        </button>
      </div>
    </form>
  );
}

/**
 * The name and optional quantity inputs, shared by adding and editing. The
 * error they point at is rendered by the form as `${id}-error`.
 */
function ItemFields({
  id,
  nameRef,
  name,
  quantity,
  error,
  autoFocus,
  onNameChange,
  onQuantityChange,
}: {
  id: string;
  nameRef?: RefObject<HTMLInputElement | null>;
  name: string;
  quantity: string;
  error: FormError | null;
  autoFocus: boolean;
  onNameChange: (name: string) => void;
  onQuantityChange: (quantity: string) => void;
}) {
  return (
    <>
      <label htmlFor={`${id}-name`} className="sr-only">
        Item name
      </label>
      <input
        ref={nameRef}
        id={`${id}-name`}
        value={name}
        onChange={(event) => onNameChange(event.target.value)}
        maxLength={MAX_ITEM_NAME_LENGTH}
        autoFocus={autoFocus}
        autoComplete="off"
        enterKeyHint="done"
        placeholder="What to bring"
        aria-invalid={error?.field === "name" ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`min-w-0 flex-1 px-4 ${fieldClass}`}
      />

      <label htmlFor={`${id}-quantity`} className="sr-only">
        Quantity (optional)
      </label>
      <input
        id={`${id}-quantity`}
        value={quantity}
        // Digits only, at most two: the range check is then just "not 0".
        onChange={(event) =>
          onQuantityChange(event.target.value.replace(/\D/g, "").slice(0, 2))
        }
        inputMode="numeric"
        autoComplete="off"
        enterKeyHint="done"
        placeholder="1"
        aria-invalid={error?.field === "quantity" ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`tabular w-13 shrink-0 text-center ${fieldClass}`}
      />
    </>
  );
}

/**
 * Names a new category. Stays open until the server confirms, then hands over
 * to the new category's own add field.
 */
function AddCategoryForm({
  existingNames,
  onAdd,
  onClose,
}: {
  existingNames: string[];
  onAdd: (name: string) => Promise<string | undefined>;
  onClose: (restoreFocus: boolean) => void;
}) {
  const id = useId();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const dismiss = dismissHandlers(() => !name.trim() && !error, onClose);

  async function submit() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Give the category a name.");
      return;
    }
    const lower = trimmed.toLowerCase();
    if (existingNames.some((existing) => existing.toLowerCase() === lower)) {
      setError(`You already have a category called “${trimmed}”.`);
      return;
    }

    setError(null);
    setName("");

    const message = await onAdd(trimmed);
    if (message) {
      setError(message);
      setName(trimmed);
    }
  }

  return (
    <form
      action={submit}
      {...dismiss}
      className="flex flex-col gap-2.5 rounded-3xl bg-surface p-3 shadow-card"
    >
      <div className="flex gap-2.5">
        <label htmlFor={`${id}-name`} className="sr-only">
          Category name
        </label>
        <input
          id={`${id}-name`}
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={MAX_CATEGORY_NAME_LENGTH}
          autoFocus
          autoComplete="off"
          enterKeyHint="done"
          placeholder="Category, like Electronics"
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

type RowProps = {
  item: PackingItem;
  editing: boolean;
  returnFocus: boolean;
  onSetCount: (id: string, packedCount: number) => void;
  onEdit: () => void;
  onCancelEdit: (restoreFocus: boolean) => void;
  onSave: (name: string, quantity: number) => void;
  onDelete: () => void;
};

/**
 * One item: its row, or its edit field while it's being edited. Kept as two
 * components so the row mounts fresh afterwards and re-applies its checkbox's
 * mixed state.
 */
function PackingRow({ editing, ...row }: RowProps) {
  return editing ? (
    <EditItemForm
      item={row.item}
      onSave={row.onSave}
      onCancel={row.onCancelEdit}
    />
  ) : (
    <ItemRow {...row} />
  );
}

/**
 * An item's row. The label (check and name) is the tap target for "all in /
 * all out"; the native checkbox stays in the DOM for keyboard and screen
 * readers and the round check is drawn beside it. A bulk item's checkbox reads
 * as mixed while partly packed, and a −/+ stepper sits outside the label so
 * its taps don't also toggle the checkbox. Edit and delete live behind the
 * trailing ⋮ menu.
 */
function ItemRow({
  item,
  returnFocus,
  onSetCount,
  onEdit,
  onDelete,
}: Omit<RowProps, "editing" | "onCancelEdit" | "onSave">) {
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
          "flex min-w-0 flex-1 items-center gap-3.5 py-3.5 pr-2 pl-4 transition-[background-color,opacity] duration-200 ease-out-quint",
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
        <div className="flex shrink-0 items-center gap-1.5 pr-1">
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

/**
 * Room the menu needs below its button before it opens upwards instead: its
 * own height plus the dock, which floats over the bottom of the screen.
 */
const MENU_ROOM_BELOW = 220;

/**
 * Pins the open menu to its button's right edge, below it or above it. The
 * menu is a popover in the top layer — outside the card's rounded clip and
 * over the dock — so it's placed in viewport coordinates.
 */
function placeMenu(menu: HTMLElement, button: HTMLElement) {
  const rect = button.getBoundingClientRect();
  const gap = 6;
  menu.style.left = "auto";
  menu.style.right = `${document.documentElement.clientWidth - rect.right}px`;
  if (window.innerHeight - rect.bottom >= MENU_ROOM_BELOW) {
    menu.style.top = `${rect.bottom + gap}px`;
    menu.style.bottom = "auto";
  } else {
    menu.style.top = "auto";
    menu.style.bottom = `${window.innerHeight - rect.top + gap}px`;
  }
}

/**
 * The ⋮ button at the end of a row and the Edit / Delete menu it opens. A
 * native popover, so a tap outside or Escape closes it and focus goes back
 * to the button. It's placed as it opens and closes if the page scrolls,
 * rather than drifting away from its row.
 */
function ItemMenu({
  itemName,
  disabled,
  autoFocus,
  onEdit,
  onDelete,
}: {
  itemName: string;
  disabled: boolean;
  autoFocus: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const menuId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const menu = menuRef.current;
    const button = buttonRef.current;
    if (!menu || !button) return;

    const hide = () => menu.hidePopover();

    function onBeforeToggle(event: Event) {
      if ((event as ToggleEvent).newState === "open") placeMenu(menu!, button!);
    }
    function onToggle(event: Event) {
      if ((event as ToggleEvent).newState === "open") {
        document.addEventListener("scroll", hide, { capture: true, passive: true });
        window.addEventListener("resize", hide);
      } else {
        document.removeEventListener("scroll", hide, { capture: true });
        window.removeEventListener("resize", hide);
      }
    }

    menu.addEventListener("beforetoggle", onBeforeToggle);
    menu.addEventListener("toggle", onToggle);
    return () => {
      menu.removeEventListener("beforetoggle", onBeforeToggle);
      menu.removeEventListener("toggle", onToggle);
      document.removeEventListener("scroll", hide, { capture: true });
      window.removeEventListener("resize", hide);
    };
  }, []);

  function choose(action: () => void) {
    menuRef.current?.hidePopover();
    action();
  }

  return (
    <div className="shrink-0 pr-2">
      <button
        ref={buttonRef}
        type="button"
        popoverTarget={menuId}
        aria-label={`Options for ${itemName}`}
        disabled={disabled}
        autoFocus={autoFocus}
        className="flex h-10 w-9 items-center justify-center rounded-full text-muted transition-[background-color,color,scale] duration-200 ease-out-quint active:scale-90 active:bg-surface-sunk disabled:opacity-40 disabled:active:scale-100 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
      >
        <MoreIcon className="h-5 w-5" />
      </button>

      <div
        ref={menuRef}
        id={menuId}
        popover="auto"
        className="inset-auto m-0 w-44 rounded-2xl bg-surface p-2 text-ink shadow-lift"
      >
        <button
          type="button"
          onClick={() => choose(onEdit)}
          className={`${menuItemClass} text-ink`}
        >
          <PencilIcon className="h-5 w-5 text-muted" />
          Edit
        </button>
        <button
          type="button"
          onClick={() => choose(onDelete)}
          className={`${menuItemClass} text-danger`}
        >
          <TrashIcon className="h-5 w-5" />
          Delete
        </button>
      </div>
    </div>
  );
}

const menuItemClass =
  "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-base font-semibold transition-colors duration-200 ease-out hover:bg-surface-sunk active:bg-surface-sunk focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none";

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
