import {
  Biohazard,
  Brain,
  Bug,
  Circle,
  Droplets,
  Feather,
  Flame,
  Ghost,
  Heart,
  Layers,
  Leaf,
  type LucideIcon,
  Moon,
  Mountain,
  Shield,
  Snowflake,
  Sparkles,
  Swords,
  Zap,
} from "lucide-react";
import type { CSSProperties } from "react";
import { POKEMON_TYPES, type PokemonTypeName } from "@/types/pokemon";

interface TypeMeta {
  label: string;
  Icon: LucideIcon;
}

export const TYPE_META: Record<PokemonTypeName, TypeMeta> = {
  normal: { label: "Normal", Icon: Circle },
  fire: { label: "Fire", Icon: Flame },
  water: { label: "Water", Icon: Droplets },
  electric: { label: "Electric", Icon: Zap },
  grass: { label: "Grass", Icon: Leaf },
  ice: { label: "Ice", Icon: Snowflake },
  fighting: { label: "Fighting", Icon: Swords },
  poison: { label: "Poison", Icon: Biohazard },
  ground: { label: "Ground", Icon: Layers },
  flying: { label: "Flying", Icon: Feather },
  psychic: { label: "Psychic", Icon: Brain },
  bug: { label: "Bug", Icon: Bug },
  rock: { label: "Rock", Icon: Mountain },
  ghost: { label: "Ghost", Icon: Ghost },
  dragon: { label: "Dragon", Icon: Sparkles },
  dark: { label: "Dark", Icon: Moon },
  steel: { label: "Steel", Icon: Shield },
  fairy: { label: "Fairy", Icon: Heart },
};

export const ALL_TYPES = POKEMON_TYPES;

/**
 * Parses the comma-separated `?type=` query value. Invalid segments are dropped,
 * and the result follows `ALL_TYPES` order regardless of the order in the URL, so
 * the same selection always serialises to the same string.
 */
export function parseTypeNames(value: string): PokemonTypeName[] {
  if (!value) return [];
  const requested = new Set(value.split(","));
  return POKEMON_TYPES.filter((type) => requested.has(type));
}

/**
 * Publishes `--type-color` onto a subtree. Every type-aware style in the app
 * (`.type-chip`, `.type-wash`, `.stat-bar-fill`) reads that one variable, which
 * is why none of them need eighteen variants.
 */
export function typeStyle(type: PokemonTypeName | undefined): CSSProperties {
  return { "--type-color": `var(--type-${type ?? "normal"})` } as CSSProperties;
}
