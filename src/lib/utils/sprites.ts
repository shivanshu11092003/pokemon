/**
 * Sprite URLs are deterministic functions of the dex id, which is the single
 * most valuable fact about this API: it lets a card paint its artwork from the
 * cheap list endpoint alone, with no per-Pokémon detail request in the critical
 * path. See `lib/api/pokemon.ts` for the rest of that strategy.
 */

const SPRITE_CDN = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

export function officialArtworkUrl(id: number): string {
  return `${SPRITE_CDN}/other/official-artwork/${id}.png`;
}

export function pixelSpriteUrl(id: number): string {
  return `${SPRITE_CDN}/${id}.png`;
}

/** Extracts `25` from `https://pokeapi.co/api/v2/pokemon/25/`. */
export function idFromResourceUrl(url: string): number {
  const match = /\/(\d+)\/?$/.exec(url);
  return match ? Number(match[1]) : Number.NaN;
}
