"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * `false` during SSR and the first client render, `true` afterwards.
 *
 * Anything read from localStorage (favourites, comparison slate) must be gated on
 * this, otherwise the server HTML and the first client render disagree and React
 * throws a hydration mismatch.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
