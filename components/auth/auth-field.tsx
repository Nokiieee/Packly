import type { ComponentPropsWithoutRef } from "react";

type AuthFieldProps = {
  label: string;
  name: string;
  error?: string;
  hint?: string;
} & Omit<ComponentPropsWithoutRef<"input">, "id" | "name" | "className">;

/**
 * One labelled input for the auth forms, including its error and hint text.
 *
 * Errors are wired through `aria-describedby` / `aria-invalid` so a screen
 * reader announces them with the field instead of leaving them as loose text.
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
        className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
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
          "w-full rounded-lg border bg-white px-3 py-2 text-sm text-zinc-900 shadow-xs outline-none transition",
          "placeholder:text-zinc-400",
          "focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-white",
          "dark:bg-zinc-950 dark:text-zinc-50 dark:focus-visible:ring-offset-zinc-950",
          error
            ? "border-red-400 focus-visible:ring-red-500 dark:border-red-500/70"
            : "border-zinc-300 focus-visible:ring-zinc-900 dark:border-zinc-700 dark:focus-visible:ring-zinc-300",
        ].join(" ")}
      />

      {hint ? (
        <p id={hintId} className="text-xs text-zinc-500 dark:text-zinc-400">
          {hint}
        </p>
      ) : null}

      {error ? (
        <p id={errorId} className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}
