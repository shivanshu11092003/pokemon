"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const MAX_COMPARE = 2;

/**
 * Client-only state. Note what is *not* here: search text, type filters, sort and
 * the selected Pokémon all live in the URL, and every Pokémon record lives in the
 * React Query cache. This store owns preferences and nothing else.
 */
interface UiState {
  favorites: number[];
  compare: number[];
  toggleFavorite: (id: number) => void;
  toggleCompare: (id: number) => void;
  clearCompare: () => void;
}

/** The slice that actually reaches localStorage — see `partialize` below. */
type PersistedUiState = Pick<UiState, "favorites" | "compare">;

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      favorites: [],
      compare: [],

      toggleFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.includes(id)
            ? state.favorites.filter((entry) => entry !== id)
            : [...state.favorites, id],
        })),

      toggleCompare: (id) =>
        set((state) => {
          if (state.compare.includes(id)) {
            return { compare: state.compare.filter((entry) => entry !== id) };
          }
          // A full slate replaces its oldest member so the button never dead-ends.
          const next = [...state.compare, id];
          return { compare: next.slice(-MAX_COMPARE) };
        }),

      clearCompare: () => set({ compare: [] }),
    }),
    {
      name: "pokedex-explorer",
      version: 3,
      // v3 dropped `autoLoad`: paging is infinite scroll, full stop, so the
      // preference no longer exists. Favourites and the comparison slate carry
      // over untouched.
      migrate: (persisted) => {
        const state = (persisted ?? {}) as Partial<PersistedUiState>;
        return { favorites: state.favorites ?? [], compare: state.compare ?? [] };
      },
      partialize: (state) => ({
        favorites: state.favorites,
        compare: state.compare,
      }),
    },
  ),
);
