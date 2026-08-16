import type { PokemonTypeName } from "@/types/pokemon";

/**
 * Every cache key in the app is minted here. Inline array literals as query keys
 * are banned — they drift, and invalidation silently stops matching.
 */
export const queryKeys = {
  all: ["pokemon"] as const,

  index: () => [...queryKeys.all, "index"] as const,

  details: () => [...queryKeys.all, "detail"] as const,
  detail: (idOrName: string | number) => [...queryKeys.details(), String(idOrName)] as const,

  species: (id: number) => [...queryKeys.all, "species", id] as const,

  types: () => [...queryKeys.all, "type"] as const,
  typeMembers: (type: PokemonTypeName) => [...queryKeys.types(), type] as const,

  statPool: (fingerprint: string) => [...queryKeys.all, "stat-pool", fingerprint] as const,
} as const;
