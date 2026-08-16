import type { Pokemon, PokemonIndexEntry } from "@/types/pokemon";

export const SORT_KEYS = ["id", "name", "hp", "attack", "speed", "total"] as const;
export type SortKey = (typeof SORT_KEYS)[number];

export const SORT_LABELS: Record<SortKey, string> = {
  id: "Dex number",
  name: "Name (A–Z)",
  hp: "HP",
  attack: "Attack",
  speed: "Speed",
  total: "Base stat total",
};

/**
 * Sorts by dex number or name are free — the index already has both. Sorts by a
 * base stat require every candidate's detail record, which is why they take the
 * bounded-hydration path in `usePokemonFeed`.
 */
export function isStatSort(sort: SortKey): boolean {
  return sort !== "id" && sort !== "name";
}

export function parseSortKey(value: string | null): SortKey {
  return (SORT_KEYS as readonly string[]).includes(value ?? "") ? (value as SortKey) : "id";
}

function statValue(pokemon: Pokemon | undefined, sort: SortKey): number {
  if (!pokemon) return Number.NEGATIVE_INFINITY;
  switch (sort) {
    case "hp":
      return pokemon.stats.hp;
    case "attack":
      return pokemon.stats.attack;
    case "speed":
      return pokemon.stats.speed;
    case "total":
      return pokemon.statTotal;
    default:
      return 0;
  }
}

export function sortIndexEntries(
  entries: readonly PokemonIndexEntry[],
  sort: SortKey,
  statsById: ReadonlyMap<number, Pokemon>,
): PokemonIndexEntry[] {
  const sorted = [...entries];

  if (sort === "id") return sorted.sort((a, b) => a.id - b.id);
  if (sort === "name") return sorted.sort((a, b) => a.name.localeCompare(b.name));

  // Descending, and anything we haven't hydrated sinks to the bottom rather
  // than silently masquerading as a zero.
  return sorted.sort((a, b) => {
    const left = statValue(statsById.get(a.id), sort);
    const right = statValue(statsById.get(b.id), sort);
    if (left === right) return a.id - b.id;
    return right - left;
  });
}
