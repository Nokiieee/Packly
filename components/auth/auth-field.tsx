import type { ComponentPropsWithoutRef } from "react";

type AuthFieldProps = {
  label: string;
  name: string;
  error?: string;
  hint?: string;
} & Omit<ComponentPropsWithoutRef<"input">, "id" | "name" | "className">;

/**
 * One labelled input in the signage register: a rectangular field with a hard
 * 2px rule, no soft corners. Errors are wired through `aria-describedby` /
 * `aria-invalid` so a screen reader announces them with the field.
 */
export function AuthField({
  label,
  name,
  error,
  hint,
  required = true,
  ...inputProps
}: AuthFieldProps) {
  const errorId = `${name}-error`;
  const hintId = `${name}-hint`;
  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") ||
    undefined;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={name}
        className="font-condensed text-[13px] leading-none font-semibold tracking-[0.14em] uppercase"
      >
        {label}
      </label>

      <input
        {...inputProps}
        id={name}
        name={name}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={[
          "w-full rounded-[2px] border-2 bg-transparent px-3 py-2.5 text-base text-ink outline-none",
          "transition-colors duration-200 ease-out placeholder:text-muted",
          "focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-ground",
          error
            ? "border-signal focus-visible:ring-signal"
            : "border-ink/60 focus-visible:border-ink focus-visible:ring-ink",
        ].join(" ")}
      />

      {hint ? (
        <p id={hintId} className="text-xs text-muted">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p id={errorId} className="text-xs font-medium text-signal">
          {error}
        </p>
      ) : null}
    </div>
  );
}
