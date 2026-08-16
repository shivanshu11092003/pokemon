import { toDisplayName } from "@/lib/utils/format";
import { idFromResourceUrl, officialArtworkUrl } from "@/lib/utils/sprites";
import {
  type MoveLearnMethod,
  POKEMON_TYPES,
  type Pokemon,
  type PokemonDetailResponse,
  type PokemonIndexEntry,
  type PokemonListResponse,
  type PokemonMove,
  type PokemonSpecies,
  type PokemonTypeName,
  type SpeciesResponse,
  STAT_KEYS,
  type StatBlock,
  type StatKey,
  type TypeResponse,
} from "@/types/pokemon";
import { apiFetch, mapWithConcurrency } from "./client";

/**
 * Highest id in the National Dex proper. Everything above 10000 is an alternate
 * form (`deoxys-attack`, `charizard-mega-x`, …) — searchable, but excluded from
 * the browse feed so the grid reads like a real Pokédex.
 */
export const MAX_NATIONAL_DEX_ID = 1025;

const VALID_TYPES = new Set<string>(POKEMON_TYPES);

function isPokemonType(name: string): name is PokemonTypeName {
  return VALID_TYPES.has(name);
}

/* ------------------------------------------------------------ name index */

/**
 * One request returns every name in the dex (~1300 rows, ~90KB). Cached forever,
 * it powers instant typeahead, exact result counts, stable pagination under any
 * filter, and did-you-mean suggestions — all without another round trip.
 */
export async function fetchPokemonIndex(signal?: AbortSignal): Promise<PokemonIndexEntry[]> {
  const data = await apiFetch<PokemonListResponse>("/pokemon?limit=100000&offset=0", signal);

  return data.results
    .map((entry) => {
      const id = idFromResourceUrl(entry.url);
      return { id, name: entry.name, displayName: toDisplayName(entry.name) };
    })
    .filter((entry) => Number.isFinite(entry.id))
    .sort((a, b) => a.id - b.id);
}

/* ---------------------------------------------------------------- detail */

function normaliseStats(response: PokemonDetailResponse): StatBlock {
  const stats = Object.fromEntries(STAT_KEYS.map((key) => [key, 0])) as StatBlock;
  for (const entry of response.stats) {
    const key = entry.stat.name as StatKey;
    if (key in stats) stats[key] = entry.base_stat;
  }
  return stats;
}

const KNOWN_METHODS: MoveLearnMethod[] = ["level-up", "machine", "egg", "tutor"];

function normaliseMoves(response: PokemonDetailResponse): PokemonMove[] {
  return response.moves
    .map((entry) => {
      const detail = entry.version_group_details.at(-1);
      const rawMethod = detail?.move_learn_method.name ?? "other";
      const method = KNOWN_METHODS.find((m) => m === rawMethod) ?? "other";
      return {
        name: entry.move.name,
        displayName: toDisplayName(entry.move.name),
        method,
        level: detail?.level_learned_at ?? 0,
      };
    })
    .sort((a, b) => a.level - b.level || a.displayName.localeCompare(b.displayName));
}

/** Wire → domain. The UI never sees a `PokemonDetailResponse`. */
export function normalisePokemon(response: PokemonDetailResponse): Pokemon {
  const stats = normaliseStats(response);

  return {
    id: response.id,
    name: response.name,
    displayName: toDisplayName(response.name),
    types: response.types
      .sort((a, b) => a.slot - b.slot)
      .map((entry) => entry.type.name)
      .filter(isPokemonType),
    height: response.height,
    weight: response.weight,
    baseExperience: response.base_experience,
    abilities: response.abilities
      .sort((a, b) => a.slot - b.slot)
      .map((entry) => ({
        name: entry.ability.name,
        displayName: toDisplayName(entry.ability.name),
        isHidden: entry.is_hidden,
      })),
    stats,
    statTotal: Object.values(stats).reduce((sum, value) => sum + value, 0),
    moves: normaliseMoves(response),
    artwork:
      response.sprites.other?.["official-artwork"]?.front_default ??
      response.sprites.other?.home?.front_default ??
      officialArtworkUrl(response.id),
    sprite: response.sprites.front_default,
    cry: response.cries?.latest ?? null,
  };
}

export async function fetchPokemon(
  idOrName: string | number,
  signal?: AbortSignal,
): Promise<Pokemon> {
  const key = typeof idOrName === "string" ? idOrName.toLowerCase().trim() : idOrName;
  const response = await apiFetch<PokemonDetailResponse>(`/pokemon/${key}`, signal);
  return normalisePokemon(response);
}

/**
 * Pooled multi-fetch for the cases where we genuinely need many records at once
 * (sorting by a base stat, comparison). `onEach` lets the caller seed the
 * per-Pokémon query cache so cards render from memory afterwards.
 */
export async function fetchPokemonBatch(
  ids: readonly number[],
  options: { concurrency?: number; onEach?: (pokemon: Pokemon) => void; signal?: AbortSignal } = {},
): Promise<Pokemon[]> {
  const { concurrency = 8, onEach, signal } = options;

  const settled = await mapWithConcurrency(ids, concurrency, async (id) => {
    try {
      const pokemon = await fetchPokemon(id, signal);
      onEach?.(pokemon);
      return pokemon;
    } catch {
      // A single bad id must not fail the whole sort.
      return null;
    }
  });

  return settled.filter((entry): entry is Pokemon => entry !== null);
}

/* --------------------------------------------------------------- species */

/**
 * The species record carries the flavour text — the actual Pokédex prose. It is a
 * separate request from `/pokemon/{id}`, so it is fetched only for the Pokémon
 * currently in the spotlight rather than for every card.
 */
export async function fetchPokemonSpecies(
  id: number,
  signal?: AbortSignal,
): Promise<PokemonSpecies | null> {
  // Alternate forms have no species of their own.
  if (id > MAX_NATIONAL_DEX_ID) return null;

  const data = await apiFetch<SpeciesResponse>(`/pokemon-species/${id}`, signal);

  const genus = data.genera.find((entry) => entry.language.name === "en")?.genus ?? "";
  const flavor = data.flavor_text_entries.find((entry) => entry.language.name === "en");

  return {
    genus,
    flavorText: (flavor?.flavor_text ?? "")
      // The games encode line breaks as \n and page breaks as \f; both are noise here.
      .replace(/[\n\f\r]+/g, " ")
      // Older entries shout the brand in the games' own casing ("POKéMON").
      .replace(/POKéMON/gi, "Pokémon")
      .replace(/\s{2,}/g, " ")
      .trim(),
  };
}

/* ------------------------------------------------------------------ type */

/**
 * `/type/{name}` returns every member of a type in one response — names only.
 * We cache that name list forever and intersect client-side, so switching or
 * combining type filters costs zero requests after the first visit.
 */
export async function fetchTypeMembers(
  type: PokemonTypeName,
  signal?: AbortSignal,
): Promise<string[]> {
  const data = await apiFetch<TypeResponse>(`/type/${type}`, signal);
  return data.pokemon.map((entry) => entry.pokemon.name);
}
