"use client";

import { useEffect, useId, useRef } from "react";

import { MoreIcon, PencilIcon, TrashIcon } from "@/components/nav/nav-icons";

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
 * The ⋮ button at the end of a list row and the Edit / Delete menu it opens,
 * shared by Packing and Food. A native popover, so a tap outside or Escape
 * closes it and focus goes back to the button. It's placed as it opens and
 * closes if the page scrolls, rather than drifting away from its row.
 */
export function ItemMenu({
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
