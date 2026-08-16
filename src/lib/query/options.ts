import { type QueryClient, queryOptions } from "@tanstack/react-query";
import {
  fetchPokemon,
  fetchPokemonBatch,
  fetchPokemonIndex,
  fetchPokemonSpecies,
  fetchTypeMembers,
} from "@/lib/api/pokemon";
import type { Pokemon, PokemonTypeName } from "@/types/pokemon";
import { queryKeys } from "./keys";

/** Pokédex data does not change. Treat it as immutable and stop revalidating. */
const IMMUTABLE = {
  staleTime: Number.POSITIVE_INFINITY,
  gcTime: 1000 * 60 * 60 * 24,
} as const;

export const pokemonIndexOptions = () =>
  queryOptions({
    queryKey: queryKeys.index(),
    queryFn: ({ signal }) => fetchPokemonIndex(signal),
    ...IMMUTABLE,
  });

export const pokemonDetailOptions = (idOrName: string | number | null) =>
  queryOptions({
    queryKey: queryKeys.detail(idOrName ?? "none"),
    queryFn: ({ signal }) => fetchPokemon(idOrName as string | number, signal),
    enabled: idOrName !== null && idOrName !== "",
    ...IMMUTABLE,
  });

export const pokemonSpeciesOptions = (id: number | null) =>
  queryOptions({
    queryKey: queryKeys.species(id ?? 0),
    queryFn: ({ signal }) => fetchPokemonSpecies(id as number, signal),
    enabled: id !== null,
    ...IMMUTABLE,
  });

export const typeMembersOptions = (type: PokemonTypeName) =>
  queryOptions({
    queryKey: queryKeys.typeMembers(type),
    queryFn: ({ signal }) => fetchTypeMembers(type, signal),
    ...IMMUTABLE,
  });

/**
 * Bulk hydration for stat sorting. Runs one pooled query rather than N component
 * subscriptions, then seeds every individual detail cache so the cards that end
 * up on screen render straight from memory.
 */
export const statPoolOptions = (client: QueryClient, ids: readonly number[]) =>
  queryOptions({
    queryKey: queryKeys.statPool(fingerprint(ids)),
    queryFn: ({ signal }) =>
      fetchPokemonBatch(ids, {
        signal,
        concurrency: 8,
        onEach: (pokemon) => seedDetail(client, pokemon),
      }),
    enabled: ids.length > 0,
    ...IMMUTABLE,
  });

export function seedDetail(client: QueryClient, pokemon: Pokemon): void {
  client.setQueryData(queryKeys.detail(pokemon.id), pokemon);
  client.setQueryData(queryKeys.detail(pokemon.name), pokemon);
}

/**
 * Stable, short key for an id set — embedding a few hundred ids in the query key
 * would make it enormous and defeat structural sharing. djb2 over the id list.
 */
function fingerprint(ids: readonly number[]): string {
  let hash = 5381;
  for (const id of ids) {
    hash = ((hash << 5) + hash + id) | 0;
  }
  return `${ids.length}-${(hash >>> 0).toString(36)}`;
}
