"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, GitCompareArrows } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { SplitText } from "@/components/motion/split-text";
import { FavoriteButton } from "@/components/pokemon/favorite-button";
import { PokemonArt } from "@/components/pokemon/pokemon-art";
import { TypeChip } from "@/components/pokemon/type-chip";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useHydrated } from "@/hooks/use-hydrated";
import type { FeedItem } from "@/hooks/use-pokemon-feed";
import { typeStyle } from "@/lib/pokemon/type-meta";
import { pokemonSpeciesOptions } from "@/lib/query/options";
import { formatDexNumber, formatStatLabel } from "@/lib/utils/format";
import { useUiStore } from "@/stores/ui-store";
import type { StatKey } from "@/types/pokemon";

/** The four stats worth showing at a glance; the rest live in the full entry. */
const STAGE_STATS: StatKey[] = ["hp", "attack", "defense", "speed"];

interface FeaturedPokemonProps {
  item: FeedItem;
  href: string;
}

/**
 * The featured Pokémon: artwork breaking out above a card that carries its name,
 * its real Pokédex entry and a way in. The overflow is the whole point of the
 * composition — the character has to escape its frame.
 */
export function FeaturedPokemon({ item, href }: FeaturedPokemonProps) {
  const reducedMotion = useReducedMotion();
  const hydrated = useHydrated();
  const compare = useUiStore((state) => state.compare);
  const toggleCompare = useUiStore((state) => state.toggleCompare);
  const isComparing = hydrated && compare.includes(item.id);

  const pokemon = item.pokemon;
  const { data: species } = useQuery(pokemonSpeciesOptions(item.id));

  return (
    <div style={typeStyle(pokemon?.types[0])} className="relative flex flex-col justify-end">
      {/* ------------------------------------------------------------- art */}
      <div className="relative z-10 -mb-12 flex justify-center sm:-mb-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={item.id}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -16 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <PokemonArt
              id={item.id}
              name={item.displayName}
              size={420}
              priority
              className="size-[clamp(9.5rem,20vw,16rem)] drop-shadow-[0_28px_36px_rgba(0,0,0,0.24)]"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ------------------------------------------------------------ card */}
      <article className="raised-lg relative rounded-[1.75rem] border border-line bg-surface/85 p-5 pt-14 backdrop-blur-xl sm:p-6 sm:pt-16">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="type-ink text-[clamp(1.6rem,2.6vw,2.1rem)] font-bold leading-tight tracking-tight">
              <AnimatePresence mode="wait">
                <SplitText key={item.id} text={item.displayName} />
              </AnimatePresence>
            </h2>
            <p className="tabular mt-0.5 text-xs font-medium text-ink-faint">
              {formatDexNumber(item.id)}
              {species?.genus ? ` · ${species.genus}` : ""}
            </p>
          </div>

          <FavoriteButton id={item.id} name={item.displayName} size="md" className="shrink-0" />
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {pokemon ? (
            pokemon.types.map((type) => <TypeChip key={type} type={type} />)
          ) : (
            <Skeleton className="h-6.5 w-20 rounded-full" />
          )}
        </div>

        <p className="mt-3 line-clamp-3 min-h-15 text-[13px] leading-relaxed text-ink-muted">
          {species?.flavorText ?? " "}
        </p>

        <dl className="mt-4 grid grid-cols-4 gap-2 border-t border-line pt-3.5">
          {STAGE_STATS.map((key) => (
            <div key={key}>
              <dt className="text-[10px] font-medium uppercase tracking-wider text-ink-faint">
                {formatStatLabel(key)}
              </dt>
              <dd className="tabular text-lg font-semibold text-ink">
                {pokemon ? pokemon.stats[key] : "—"}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-4 flex items-center gap-2">
          <Button asChild variant="primary" size="md">
            <Link href={href}>
              Read more
              <ArrowRight />
            </Link>
          </Button>
          <Button
            variant={isComparing ? "primary" : "secondary"}
            size="md"
            onClick={() => toggleCompare(item.id)}
            aria-pressed={isComparing}
          >
            <GitCompareArrows />
            <span className="sr-only sm:not-sr-only">
              {isComparing ? "In comparison" : "Compare"}
            </span>
          </Button>
        </div>
      </article>
    </div>
  );
}
