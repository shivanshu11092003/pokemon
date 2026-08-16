"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useTransition } from "react";
import { parseSortKey, type SortKey } from "@/lib/pokemon/sort";
import { ALL_TYPES, parseTypeNames } from "@/lib/pokemon/type-meta";
import type { PokemonTypeName } from "@/types/pokemon";

export const EXPLORER_VIEWS = ["stage", "grid"] as const;
export type ExplorerView = (typeof EXPLORER_VIEWS)[number];

export interface ExplorerParams {
  query: string;
  /** Selected types combine as a union: a Pokémon matches when it has *any* of
   *  them. Intersection was tried first and produced near-empty result sets, since
   *  a Pokémon has at most two types. */
  types: PokemonTypeName[];
  sort: SortKey;
  favoritesOnly: boolean;
  view: ExplorerView;
}

export interface ExplorerParamsApi extends ExplorerParams {
  /** The canonical query string for the current view — appended to every card link. */
  searchString: string;
  isFiltered: boolean;
  /** True while a filter change is being applied off the main interaction. */
  isPending: boolean;
  setQuery: (value: string) => void;
  toggleType: (type: PokemonTypeName) => void;
  clearTypes: () => void;
  setSort: (sort: SortKey) => void;
  setFavoritesOnly: (value: boolean) => void;
  setView: (view: ExplorerView) => void;
  clearAll: () => void;
}

export function readExplorerParams(params: URLSearchParams): ExplorerParams {
  return {
    query: params.get("q")?.trim() ?? "",
    types: parseTypeNames(params.get("type") ?? ""),
    sort: parseSortKey(params.get("sort")),
    favoritesOnly: params.get("fav") === "1",
    view: params.get("view") === "grid" ? "grid" : "stage",
  };
}

function serialise(params: ExplorerParams): string {
  const next = new URLSearchParams();
  if (params.query) next.set("q", params.query);
  if (params.types.length > 0) next.set("type", params.types.join(","));
  if (params.sort !== "id") next.set("sort", params.sort);
  if (params.favoritesOnly) next.set("fav", "1");
  // Spotlight is the default, so only the grid needs to be spelled out.
  if (params.view === "grid") next.set("view", "grid");
  return next.toString();
}

/**
 * Search, filters and sort live in the URL rather than in a store, so every view
 * is shareable, survives a refresh, and works with the back button for free.
 */
export function useExplorerParams(): ExplorerParamsApi {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const current = useMemo(
    () => readExplorerParams(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  const commit = useCallback(
    (next: ExplorerParams) => {
      const queryString = serialise(next);
      // Marked non-urgent: re-filtering 1,025 entries and re-rendering the feed is
      // the expensive part of a keystroke or a type change. Inside a transition
      // React keeps the input responsive and paints the result when it is ready,
      // instead of blocking on the way through.
      startTransition(() => {
        router.replace(queryString ? `/?${queryString}` : "/", { scroll: false });
      });
    },
    [router],
  );

  const setQuery = useCallback(
    (value: string) => commit({ ...current, query: value }),
    [commit, current],
  );

  const toggleType = useCallback(
    (type: PokemonTypeName) => {
      // Canonical ALL_TYPES order, so the serialised URL never depends on the
      // order the types were clicked in.
      const next = current.types.includes(type)
        ? current.types.filter((selected) => selected !== type)
        : [...current.types, type];
      next.sort((a, b) => ALL_TYPES.indexOf(a) - ALL_TYPES.indexOf(b));
      commit({ ...current, types: next });
    },
    [commit, current],
  );

  const clearTypes = useCallback(() => commit({ ...current, types: [] }), [commit, current]);

  const setSort = useCallback((sort: SortKey) => commit({ ...current, sort }), [commit, current]);

  const setFavoritesOnly = useCallback(
    (value: boolean) => commit({ ...current, favoritesOnly: value }),
    [commit, current],
  );

  const setView = useCallback(
    (view: ExplorerView) => commit({ ...current, view }),
    [commit, current],
  );

  const clearAll = useCallback(
    () =>
      commit({
        query: "",
        types: [],
        sort: current.sort,
        favoritesOnly: false,
        view: current.view,
      }),
    [commit, current.sort, current.view],
  );

  const searchString = useMemo(() => serialise(current), [current]);

  return {
    ...current,
    searchString,
    isPending,
    isFiltered: current.query !== "" || current.types.length > 0 || current.favoritesOnly,
    setQuery,
    toggleType,
    clearTypes,
    setSort,
    setFavoritesOnly,
    setView,
    clearAll,
  };
}
