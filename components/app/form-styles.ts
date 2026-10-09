/**
 * Class strings for the inline add and edit forms inside the tabs' cards, so
 * a field on Food looks and behaves exactly like one on Packing. The ⋮ menu
 * that opens an edit is shared too: `components/app/item-menu.tsx`.
 */

export const fieldClass =
  "rounded-2xl border border-field-edge bg-surface py-3 text-base text-ink outline-none transition-[border-color,box-shadow] duration-200 ease-out placeholder:text-muted focus-visible:border-brand focus-visible:ring-4 focus-visible:ring-brand/20 aria-invalid:border-danger aria-invalid:ring-4 aria-invalid:ring-danger/20";

/** The round "+ Add" button beside a field; just the + on a phone. */
export const submitClass =
  "inline-flex shrink-0 items-center gap-1 rounded-full bg-brand px-5 text-base font-bold text-brand-ink shadow-hero transition-[background-color,scale] duration-200 ease-out-quint hover:bg-brand-deep active:scale-95 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none max-sm:rounded-[14px]";

/** An edit form's Cancel, beside Save; the form sits on `bg-surface-sunk`. */
export const cancelClass =
  "rounded-full px-5 py-2.5 text-base font-bold text-muted transition-[background-color,scale] duration-200 ease-out-quint active:scale-95 active:bg-hair focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none";

export const saveClass =
  "rounded-full bg-brand px-6 py-2.5 text-base font-bold text-brand-ink shadow-hero transition-[background-color,scale] duration-200 ease-out-quint hover:bg-brand-deep active:scale-95 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-sunk focus-visible:outline-none";

export const errorClass =
  "rounded-2xl bg-danger-soft px-4 py-3 text-sm font-medium text-danger";
