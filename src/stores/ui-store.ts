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
  autoLoad: boolean;
  toggleFavorite: (id: number) => void;
  toggleCompare: (id: number) => void;
  clearCompare: () => void;
  setAutoLoad: (value: boolean) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      favorites: [],
      compare: [],
      autoLoad: false,

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
      setAutoLoad: (value) => set({ autoLoad: value }),
    }),
    {
      name: "pokedex-explorer",
      version: 1,
      partialize: (state) => ({
        favorites: state.favorites,
        compare: state.compare,
        autoLoad: state.autoLoad,
      }),
    },
  ),
);
