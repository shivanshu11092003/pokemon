"use client";

import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { memo } from "react";
import { FavoriteButton } from "@/components/pokemon/favorite-button";
import { PokemonArt } from "@/components/pokemon/pokemon-art";
import { TypeChip } from "@/components/pokemon/type-chip";
import { usePrefetchPokemon } from "@/hooks/use-pokemon-detail";
import type { FeedItem } from "@/hooks/use-pokemon-feed";
import { typeStyle } from "@/lib/pokemon/type-meta";
import { cn } from "@/lib/utils/cn";
import { formatDexNumber } from "@/lib/utils/format";

/** Shared with the virtualiser and the skeleton so all three agree to the pixel. */
export const CARD_HEIGHT = 252;
export const GRID_GAP = 20;

interface PokemonCardProps {
  item: FeedItem;
  index: number;
  href: string;
  /** The card whose detail view is currently open — its art is the shared element. */
  isActive: boolean;
}

export const PokemonCard = memo(function PokemonCard({
  item,
  index,
  href,
  isActive,
}: PokemonCardProps) {
  const prefetch = usePrefetchPokemon();
  const reducedMotion = useReducedMotion();
  const primaryType = item.pokemon?.types[0];

  return (
    <motion.article
      style={{ ...typeStyle(primaryType), height: CARD_HEIGHT }}
      whileHover={reducedMotion ? undefined : { y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={cn(
        "type-wash group relative overflow-hidden rounded-[var(--radius-card)] border border-line",
        "shadow-resting transition-shadow duration-200 hover:shadow-hover",
        "focus-within:border-line-strong",
      )}
    >
      <span className="tabular pointer-events-none absolute right-4 top-3.5 text-xs font-semibold text-ink-faint">
        {formatDexNumber(item.id)}
      </span>

      <FavoriteButton id={item.id} name={item.displayName} className="absolute left-3 top-3 z-10" />

      <Link
        href={href}
        data-card-index={index}
        onMouseEnter={() => prefetch(item.name)}
        onFocus={() => prefetch(item.name)}
        className="flex h-full flex-col items-center justify-end gap-3 px-4 pb-5 pt-10 outline-none"
      >
        <motion.div
          layoutId={reducedMotion ? undefined : `pokemon-art-${item.id}`}
          className="grid h-[118px] w-[118px] place-items-center"
          style={{ opacity: isActive ? 0 : 1 }}
        >
          <PokemonArt
            id={item.id}
            name={item.displayName}
            size={118}
            className="h-[118px] w-[118px] drop-shadow-[0_8px_14px_rgba(0,0,0,0.18)] transition-transform duration-300 ease-[var(--ease-out-soft)] group-hover:scale-[1.06]"
          />
        </motion.div>

        <h3 className="text-[15px] font-semibold tracking-tight text-ink">{item.displayName}</h3>

        <div className="flex min-h-[26px] flex-wrap items-center justify-center gap-1.5">
          {item.pokemon ? (
            item.pokemon.types.map((type) => <TypeChip key={type} type={type} />)
          ) : (
            <>
              <span className="shimmer h-[26px] w-16 rounded-full" />
              <span className="shimmer h-[26px] w-14 rounded-full opacity-60" />
            </>
          )}
        </div>
      </Link>
    </motion.article>
  );
});
