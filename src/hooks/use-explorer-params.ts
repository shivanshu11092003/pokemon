"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { parseSortKey, type SortKey } from "@/lib/pokemon/sort";
import { parseTypeName } from "@/lib/pokemon/type-meta";
import type { PokemonTypeName } from "@/types/pokemon";

export interface ExplorerParams {
  query: string;
  types: PokemonTypeName[];
  sort: SortKey;
  favoritesOnly: boolean;
}

export interface ExplorerParamsApi extends ExplorerParams {
  /** The canonical query string for the current view — appended to every card link. */
  searchString: string;
  isFiltered: boolean;
  setQuery: (value: string) => void;
  toggleType: (type: PokemonTypeName) => void;
  clearTypes: () => void;
  setSort: (sort: SortKey) => void;
  setFavoritesOnly: (value: boolean) => void;
  clearAll: () => void;
}

export function readExplorerParams(params: URLSearchParams): ExplorerParams {
  return {
    query: params.get("q")?.trim() ?? "",
    types: (params.get("type")?.split(",") ?? [])
      .map(parseTypeName)
      .filter((type): type is PokemonTypeName => type !== null),
    sort: parseSortKey(params.get("sort")),
    favoritesOnly: params.get("fav") === "1",
  };
}

function serialise(params: ExplorerParams): string {
  const next = new URLSearchParams();
  if (params.query) next.set("q", params.query);
  if (params.types.length > 0) next.set("type", params.types.join(","));
  if (params.sort !== "id") next.set("sort", params.sort);
  if (params.favoritesOnly) next.set("fav", "1");
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

  const toggleType = useCallback(
    (type: PokemonTypeName) =>
      commit({
        ...current,
        types: current.types.includes(type)
          ? current.types.filter((entry) => entry !== type)
          : [...current.types, type],
      }),
    [commit, current],
  );

  const clearTypes = useCallback(() => commit({ ...current, types: [] }), [commit, current]);

  const setSort = useCallback((sort: SortKey) => commit({ ...current, sort }), [commit, current]);

  const setFavoritesOnly = useCallback(
    (value: boolean) => commit({ ...current, favoritesOnly: value }),
    [commit, current],
  );

  const clearAll = useCallback(
    () => commit({ query: "", types: [], sort: current.sort, favoritesOnly: false }),
    [commit, current.sort],
  );

  const searchString = useMemo(() => serialise(current), [current]);

  return {
    ...current,
    searchString,
    isFiltered: current.query !== "" || current.types.length > 0 || current.favoritesOnly,
    setQuery,
    toggleType,
    clearTypes,
    setSort,
    setFavoritesOnly,
    clearAll,
  };
}
