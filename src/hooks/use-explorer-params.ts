"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { parseSortKey, type SortKey } from "@/lib/pokemon/sort";
import { parseTypeName } from "@/lib/pokemon/type-meta";
import type { PokemonTypeName } from "@/types/pokemon";

export const EXPLORER_VIEWS = ["stage", "grid"] as const;
export type ExplorerView = (typeof EXPLORER_VIEWS)[number];

export interface ExplorerParams {
  query: string;
  /** One type at a time. Combining them produced near-empty result sets and a
   *  filter bar that was impossible to read at a glance. */
  type: PokemonTypeName | null;
  sort: SortKey;
  favoritesOnly: boolean;
  view: ExplorerView;
}

export interface ExplorerParamsApi extends ExplorerParams {
  /** The canonical query string for the current view — appended to every card link. */
  searchString: string;
  isFiltered: boolean;
  setQuery: (value: string) => void;
  /** Pass `null` to clear. Selecting the active type also clears it. */
  selectType: (type: PokemonTypeName | null) => void;
  setSort: (sort: SortKey) => void;
  setFavoritesOnly: (value: boolean) => void;
  setView: (view: ExplorerView) => void;
  clearAll: () => void;
}

export function readExplorerParams(params: URLSearchParams): ExplorerParams {
  return {
    query: params.get("q")?.trim() ?? "",
    type: parseTypeName(params.get("type") ?? ""),
    sort: parseSortKey(params.get("sort")),
    favoritesOnly: params.get("fav") === "1",
    view: params.get("view") === "grid" ? "grid" : "stage",
  };
}

function serialise(params: ExplorerParams): string {
  const next = new URLSearchParams();
  if (params.query) next.set("q", params.query);
  if (params.type) next.set("type", params.type);
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

  const current = useMemo(
    () => readExplorerParams(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );

  const commit = useCallback(
    (next: ExplorerParams) => {
      const queryString = serialise(next);
      router.replace(queryString ? `/?${queryString}` : "/", { scroll: false });
    },
    [router],
  );

  const setQuery = useCallback(
    (value: string) => commit({ ...current, query: value }),
    [commit, current],
  );

  const selectType = useCallback(
    (type: PokemonTypeName | null) =>
      commit({ ...current, type: type === current.type ? null : type }),
    [commit, current],
  );

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
        type: null,
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
    isFiltered: current.query !== "" || current.type !== null || current.favoritesOnly,
    setQuery,
    selectType,
    setSort,
    setFavoritesOnly,
    setView,
    clearAll,
  };
}
