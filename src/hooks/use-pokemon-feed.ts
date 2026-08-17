"use client";

import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { MAX_NATIONAL_DEX_ID } from "@/lib/api/pokemon";
import { isStatSort, type SortKey, sortIndexEntries } from "@/lib/pokemon/sort";
import {
  pokemonDetailOptions,
  pokemonIndexOptions,
  statPoolOptions,
  typeMembersOptions,
} from "@/lib/query/options";
import { editDistance, scoreMatch } from "@/lib/utils/fuzzy";
import type { Pokemon, PokemonIndexEntry, PokemonTypeName } from "@/types/pokemon";

export const PAGE_SIZE = 24;

/**
 * Ceiling on how many detail records a stat sort will hydrate. Type-filtered sets
 * are almost always under this, so those sorts are exact; on the unfiltered dex we
 * sort the first slice and say so in the UI rather than pretending otherwise.
 */
export const STAT_SORT_POOL = 300;

export interface FeedItem extends PokemonIndexEntry {
  pokemon: Pokemon | undefined;
}

interface FeedInput {
  query: string;
  types: PokemonTypeName[];
  sort: SortKey;
  favoritesOnly: boolean;
  favorites: number[];
}

export interface Feed {
  items: FeedItem[];
  totalCount: number;
  hasMore: boolean;
  remaining: number;
  loadMore: () => void;
  isPending: boolean;
  isError: boolean;
  error: unknown;
  retry: () => void;
  /** True while a stat sort is still pulling in the records it sorts across. */
  isHydratingSort: boolean;
  /** Set when a stat sort covers only part of the result set. */
  partialSortNote: string | null;
  suggestions: string[];
}

export function usePokemonFeed(input: FeedInput): Feed {
  const { query, types, sort, favoritesOnly, favorites } = input;
  const client = useQueryClient();

  const indexQuery = useQuery(pokemonIndexOptions());

  // One membership list per selected type, each cached on its own, so re-selecting
  // a type seen before costs zero requests. The filter itself is the union.
  //
  // `combine` is load-bearing, not decoration: without it `useQueries` hands back
  // a freshly built results array on every render, so every memo keyed on it
  // recomputes — which meant one unrelated re-render (a favourite toggle, say)
  // re-ran the whole 1,025-entry filter and sort and handed every card a new
  // `item` object, defeating `memo`. Narrowing to plain data lets React Query
  // structurally share the result, so the identity below is stable.
  const typeQueries = useQueries({
    queries: types.map((type) => typeMembersOptions(type)),
    combine: (results) => ({
      isPending: results.some((result) => result.isPending),
      lists: results.map((result) => result.data ?? []),
    }),
  });

  const typesPending = types.length > 0 && typeQueries.isPending;

  const typeNames = useMemo(() => {
    if (typeQueries.lists.length === 0) return null;
    const names = new Set<string>();
    for (const list of typeQueries.lists) {
      for (const name of list) names.add(name);
    }
    return names;
  }, [typeQueries]);

  /* -------------------------------------------------- candidate selection */

  const candidates = useMemo(() => {
    const index = indexQuery.data;
    if (!index) return [];

    // Alternate forms (id > 1025) are searchable but excluded from browsing, so
    // the default grid reads like the National Pokédex rather than a data dump.
    const pool = query ? index : index.filter((entry) => entry.id <= MAX_NATIONAL_DEX_ID);

    const favoriteSet = favoritesOnly ? new Set(favorites) : null;
    const typeSet = typeNames;

    const matched: Array<{ entry: PokemonIndexEntry; score: number }> = [];

    for (const entry of pool) {
      if (favoriteSet && !favoriteSet.has(entry.id)) continue;
      if (typeSet && !typeSet.has(entry.name)) continue;

      if (query) {
        const numeric = Number(query);
        const score = Number.isInteger(numeric)
          ? entry.id === numeric
            ? 1000
            : null
          : scoreMatch(entry.name, query);
        if (score === null) continue;
        matched.push({ entry, score });
      } else {
        matched.push({ entry, score: 0 });
      }
    }

    // A search ranks by relevance first; the chosen sort then breaks ties within
    // the matched set for everything except the default dex order.
    if (query && sort === "id") {
      matched.sort((a, b) => b.score - a.score || a.entry.id - b.entry.id);
    }

    return matched.map((match) => match.entry);
  }, [indexQuery.data, query, favoritesOnly, favorites, typeNames, sort]);

  /* ------------------------------------------------------- stat hydration */

  const needsStats = isStatSort(sort);
  const statPoolIds = useMemo(
    () => (needsStats ? candidates.slice(0, STAT_SORT_POOL).map((entry) => entry.id) : []),
    [needsStats, candidates],
  );

  const statPoolQuery = useQuery({
    ...statPoolOptions(client, statPoolIds),
    enabled: needsStats && statPoolIds.length > 0,
  });

  const statsById = useMemo(() => {
    const map = new Map<number, Pokemon>();
    for (const pokemon of statPoolQuery.data ?? []) map.set(pokemon.id, pokemon);
    return map;
  }, [statPoolQuery.data]);

  const ordered = useMemo(
    () => (query && sort === "id" ? candidates : sortIndexEntries(candidates, sort, statsById)),
    [candidates, sort, statsById, query],
  );

  /* -------------------------------------------------------------- paging */

  const fingerprint = `${query}|${types.join(",")}|${sort}|${favoritesOnly}|${favoritesOnly ? favorites.length : ""}`;
  const [page, setPage] = useState({ fingerprint, count: PAGE_SIZE });

  // Adjusting state during render is the documented way to reset derived state on
  // a prop change — cheaper and flicker-free compared with an effect.
  if (page.fingerprint !== fingerprint) {
    setPage({ fingerprint, count: PAGE_SIZE });
  }
  const visibleCount = page.fingerprint === fingerprint ? page.count : PAGE_SIZE;

  const visible = useMemo(() => ordered.slice(0, visibleCount), [ordered, visibleCount]);

  const loadMore = useCallback(() => {
    setPage((previous) => ({ ...previous, count: previous.count + PAGE_SIZE }));
  }, []);

  /* ------------------------------------------------------ detail records */

  // Keyed by name, not id: the detail route's param is a name, so sharing one
  // canonical key means clicking a card opens a page that is already populated.
  //
  // Combined into a plain array positionally aligned with `visible`, rather than a
  // Map: React Query's structural sharing only preserves the identity of plain
  // objects and arrays, and a fresh Map every render would push a fresh `item`
  // into every card.
  const details = useQueries({
    queries: visible.map((entry) => pokemonDetailOptions(entry.name)),
    combine: (results) => results.map((result) => result.data),
  });

  const items = useMemo<FeedItem[]>(
    () => visible.map((entry, position) => ({ ...entry, pokemon: details[position] })),
    [visible, details],
  );

  /* ---------------------------------------------------------- suggestions */

  const suggestions = useMemo(() => {
    if (!query || ordered.length > 0 || !indexQuery.data) return [];
    return [...indexQuery.data]
      .map((entry) => ({ entry, distance: editDistance(entry.name, query.toLowerCase()) }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 3)
      .filter((match) => match.distance <= Math.max(3, query.length - 1))
      .map((match) => match.entry.name);
  }, [query, ordered.length, indexQuery.data]);

  const retry = useCallback(() => {
    void indexQuery.refetch();
  }, [indexQuery]);

  const truncatedSort = needsStats && candidates.length > STAT_SORT_POOL;

  return {
    items,
    totalCount: ordered.length,
    hasMore: visibleCount < ordered.length,
    remaining: Math.max(ordered.length - visibleCount, 0),
    loadMore,
    isPending: indexQuery.isPending || typesPending,
    isError: indexQuery.isError,
    error: indexQuery.error,
    retry,
    isHydratingSort: needsStats && statPoolQuery.isPending,
    partialSortNote: truncatedSort
      ? `Sorted across the first ${STAT_SORT_POOL} of ${ordered.length} matches`
      : null,
    suggestions,
  };
}
