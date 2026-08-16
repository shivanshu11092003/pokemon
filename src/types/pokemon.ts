/**
 * Domain + wire types for the PokéAPI.
 *
 * Wire types (`*Response`) model *only* the fields we actually read — modelling the
 * full PokéAPI surface would be thousands of lines of types we never touch. Everything
 * downstream of `lib/api` consumes the normalised domain types instead.
 */

export const POKEMON_TYPES = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
] as const;

export type PokemonTypeName = (typeof POKEMON_TYPES)[number];

export const STAT_KEYS = [
  "hp",
  "attack",
  "defense",
  "special-attack",
  "special-defense",
  "speed",
] as const;

export type StatKey = (typeof STAT_KEYS)[number];

export type StatBlock = Record<StatKey, number>;

/* ------------------------------------------------------------------ wire */

export interface NamedResource {
  name: string;
  url: string;
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: NamedResource[];
}

export interface TypeResponse {
  name: string;
  pokemon: Array<{ pokemon: NamedResource; slot: number }>;
}

export interface PokemonDetailResponse {
  id: number;
  name: string;
  height: number;
  weight: number;
  base_experience: number | null;
  types: Array<{ slot: number; type: NamedResource }>;
  abilities: Array<{ ability: NamedResource; is_hidden: boolean; slot: number }>;
  stats: Array<{ base_stat: number; effort: number; stat: NamedResource }>;
  moves: Array<{
    move: NamedResource;
    version_group_details: Array<{
      level_learned_at: number;
      move_learn_method: NamedResource;
    }>;
  }>;
  sprites: {
    front_default: string | null;
    other?: {
      "official-artwork"?: { front_default: string | null };
      home?: { front_default: string | null };
    };
  };
  cries?: { latest: string | null; legacy: string | null };
}

/* ---------------------------------------------------------------- domain */

export type MoveLearnMethod = "level-up" | "machine" | "egg" | "tutor" | "other";

export interface PokemonMove {
  name: string;
  displayName: string;
  method: MoveLearnMethod;
  level: number;
}

export interface PokemonAbility {
  name: string;
  displayName: string;
  isHidden: boolean;
}

/** A fully normalised Pokémon. This is the only shape the UI ever sees. */
export interface Pokemon {
  id: number;
  name: string;
  displayName: string;
  types: PokemonTypeName[];
  /** decimetres */
  height: number;
  /** hectograms */
  weight: number;
  baseExperience: number | null;
  abilities: PokemonAbility[];
  stats: StatBlock;
  statTotal: number;
  moves: PokemonMove[];
  artwork: string;
  sprite: string | null;
  cry: string | null;
}

/** One row of the cheap name index — enough to render a card shell instantly. */
export interface PokemonIndexEntry {
  id: number;
  name: string;
  displayName: string;
}
