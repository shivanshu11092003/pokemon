"use client";

import { type RefObject, useEffect, useState } from "react";

/**
 * Column count for the virtualised grid.
 *
 * The virtualiser needs a number, not a media query, so the breakpoints live here
 * and are measured off the container rather than the viewport — that keeps the
 * grid correct inside any layout it is dropped into.
 */
const BREAKPOINTS: Array<{ minWidth: number; columns: number }> = [
  { minWidth: 1520, columns: 5 },
  { minWidth: 1180, columns: 4 },
  { minWidth: 860, columns: 3 },
  { minWidth: 540, columns: 2 },
  { minWidth: 0, columns: 1 },
];

export function useColumnCount(ref: RefObject<HTMLElement | null>, fallback = 4): number {
  const [columns, setColumns] = useState(fallback);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const measure = (width: number) => {
      const next = BREAKPOINTS.find((bp) => width >= bp.minWidth)?.columns ?? 1;
      setColumns((previous) => (previous === next ? previous : next));
    };

    measure(element.getBoundingClientRect().width);

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) measure(entry.contentRect.width);
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);

  return columns;
}
