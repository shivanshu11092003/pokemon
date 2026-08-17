"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { useHydrated } from "@/hooks/use-hydrated";
import { pokemonDetailOptions, pokemonIndexOptions } from "@/lib/query/options";
import type { Pokemon } from "@/types/pokemon";

interface DetailResult {
  pokemon: Pokemon | undefined;
  isPending: boolean;
  isError: boolean;
  error: unknown;
  /** Neighbouring dex entries, for the prev/next controls. */
  neighbours: { previous: string | null; next: string | null };
}

export function usePokemonDetail(nameOrId: string): DetailResult {
  // Same reasoning as `usePokemonFeed`: this page server-renders its skeleton, so
  // the first client render must too, whatever the shared cache holds by then. The
  // comparison tray fetches detail records by name from the layout — outside this
  // route's boundary — so it can seed this exact query before the page hydrates.
  const hydrated = useHydrated();
  const indexQuery = useQuery(pokemonIndexOptions());
  const detailQuery = useQuery(pokemonDetailOptions(nameOrId));

  const index = indexQuery.data;
  const id = detailQuery.data?.id;
  const position = index && id ? index.findIndex((entry) => entry.id === id) : -1;

  return {
    pokemon: detailQuery.data,
    isPending: !hydrated || detailQuery.isPending,
    isError: detailQuery.isError,
    error: detailQuery.error,
    neighbours: {
      previous: position > 0 ? (index?.[position - 1]?.name ?? null) : null,
      next: position >= 0 ? (index?.[position + 1]?.name ?? null) : null,
    },
  };
}

/**
 * Warms a Pokémon's detail record on hover and focus. By the time a card is
 * actually clicked the modal has its data already, so it opens with content
 * rather than a spinner.
 */
export function usePrefetchPokemon(): (idOrName: string | number) => void {
  const client = useQueryClient();

  return useCallback(
    (idOrName: string | number) => {
      void client.prefetchQuery(pokemonDetailOptions(idOrName));
    },
    [client],
  );
}
