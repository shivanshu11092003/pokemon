"use client";

import { type KeyboardEvent, useCallback } from "react";

/**
 * Arrow-key navigation across the card grid. Cards stay in the tab order as a
 * single stop-per-card (they are links), but arrows let a keyboard user cross the
 * grid the way a pointer user crosses it — including Home/End to jump to the ends.
 */
export function useGridKeyboardNav(columns: number) {
  return useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      const target = (event.target as HTMLElement).closest<HTMLElement>("[data-card-index]");
      if (!target) return;

      const container = event.currentTarget;
      const cards = Array.from(container.querySelectorAll<HTMLElement>("[data-card-index]"));
      const current = cards.indexOf(target);
      if (current === -1) return;

      const delta = ((): number | null => {
        switch (event.key) {
          case "ArrowRight":
            return 1;
          case "ArrowLeft":
            return -1;
          case "ArrowDown":
            return columns;
          case "ArrowUp":
            return -columns;
          default:
            return null;
        }
      })();

      let nextIndex: number | null = null;
      if (delta !== null) nextIndex = current + delta;
      else if (event.key === "Home") nextIndex = 0;
      else if (event.key === "End") nextIndex = cards.length - 1;

      if (nextIndex === null) return;

      const next = cards[Math.max(0, Math.min(nextIndex, cards.length - 1))];
      if (!next) return;

      event.preventDefault();
      next.focus();
      next.scrollIntoView({ block: "nearest" });
    },
    [columns],
  );
}
