"use client";

import { ArrowRight, GitCompareArrows } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { SplitText } from "@/components/motion/split-text";
import { FavoriteButton } from "@/components/pokemon/favorite-button";
import { PokemonArt } from "@/components/pokemon/pokemon-art";
import { StatBar } from "@/components/pokemon/stat-bar";
import { TypeChip } from "@/components/pokemon/type-chip";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useHydrated } from "@/hooks/use-hydrated";
import type { FeedItem } from "@/hooks/use-pokemon-feed";
import { typeStyle } from "@/lib/pokemon/type-meta";
import { formatDexNumber } from "@/lib/utils/format";
import { useUiStore } from "@/stores/ui-store";
import type { StatKey } from "@/types/pokemon";

/** The four stats worth showing at a glance; the rest live in the full entry. */
const STAGE_STATS: StatKey[] = ["hp", "attack", "defense", "speed"];

interface PokemonStageProps {
  item: FeedItem;
  href: string;
  /** True while this Pokémon's detail view is open — its art is the shared element. */
  isActive: boolean;
}

export function PokemonStage({ item, href, isActive }: PokemonStageProps) {
  const reducedMotion = useReducedMotion();
  const hydrated = useHydrated();
  const compare = useUiStore((state) => state.compare);
  const toggleCompare = useUiStore((state) => state.toggleCompare);
  const isComparing = hydrated && compare.includes(item.id);

  const pokemon = item.pokemon;

  return (
    <div
      style={typeStyle(pokemon?.types[0])}
      // `content-center` centres the row track itself; `items-center` alone only
      // centres each cell inside a track that has already been sized to content.
      className="mx-auto grid w-full max-w-[100rem] flex-1 content-center items-center gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-10 lg:px-10 lg:py-10"
    >
      {/* ------------------------------------------------------------ copy */}
      <div className="order-2 flex min-w-0 flex-col items-center text-center lg:order-1 lg:items-start lg:text-left">
        <div className="flex items-center gap-3">
          <span className="tabular text-sm font-semibold text-ink-faint">
            {formatDexNumber(item.id)}
          </span>
          <span className="h-px w-8 bg-line-strong" />
          <div className="flex gap-1.5">
            {pokemon ? (
              pokemon.types.map((type) => <TypeChip key={type} type={type} />)
            ) : (
              <Skeleton className="h-6.5 w-20 rounded-full" />
            )}
          </div>
        </div>

        <h1 className="mt-4 text-[clamp(2.75rem,8vw,6.5rem)] font-bold uppercase leading-[0.86] tracking-[-0.04em] text-ink">
          <AnimatePresence mode="wait">
            <SplitText key={item.id} text={item.displayName} />
          </AnimatePresence>
        </h1>

        <div className="mt-7 w-full max-w-sm space-y-2.5">
          {pokemon
            ? STAGE_STATS.map((key, index) => (
                <StatBar
                  key={`${item.id}-${key}`}
                  statKey={key}
                  value={pokemon.stats[key]}
                  index={index}
                />
              ))
            : STAGE_STATS.map((key) => <Skeleton key={key} className="h-4 w-full" />)}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5 lg:justify-start">
          <Button asChild variant="primary" size="lg">
            <Link href={href}>
              View full entry
              <ArrowRight />
            </Link>
          </Button>

          <FavoriteButton id={item.id} name={item.displayName} size="md" />

          <Button
            variant={isComparing ? "primary" : "secondary"}
            size="md"
            onClick={() => toggleCompare(item.id)}
            aria-pressed={isComparing}
          >
            <GitCompareArrows />
            {isComparing ? "In comparison" : "Compare"}
          </Button>
        </div>
      </div>

      {/* ------------------------------------------------------------- art */}
      <div className="order-1 flex justify-center lg:order-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={item.id}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.9, y: 16 }}
            animate={{ opacity: isActive ? 0 : 1, scale: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: -12 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="relative grid place-items-center"
          >
            <motion.div layoutId={reducedMotion ? undefined : `pokemon-art-${item.id}`}>
              <PokemonArt
                id={item.id}
                name={item.displayName}
                size={420}
                priority
                className="size-[clamp(13rem,32vw,26rem)] drop-shadow-[0_28px_48px_rgba(0,0,0,0.28)]"
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
