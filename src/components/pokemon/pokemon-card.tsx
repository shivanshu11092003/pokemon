"use client";

import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { memo } from "react";
import { CompareButton } from "@/components/pokemon/compare-button";
import { FavoriteButton } from "@/components/pokemon/favorite-button";
import { PokemonArt } from "@/components/pokemon/pokemon-art";
import { TypeChip } from "@/components/pokemon/type-chip";
import { usePrefetchPokemon } from "@/hooks/use-pokemon-detail";
import type { FeedItem } from "@/hooks/use-pokemon-feed";
import { typeStyle } from "@/lib/pokemon/type-meta";
import { formatDexNumber } from "@/lib/utils/format";

/** Shared with the virtualiser and the skeleton so all three agree to the pixel. */
export const CARD_HEIGHT = 284;
export const GRID_GAP = 20;

/** Art panel height — the action row straddles the seam below it. */
const ART_PANEL_HEIGHT = 168;

interface PokemonCardProps {
  item: FeedItem;
  index: number;
  href: string;
}

/**
 * Grid card: artwork on a tinted panel, a row of quick actions straddling the
 * seam, then the dex number, name and type chips. The whole card is the link —
 * it opens the full detail route, never a modal — so the actions are siblings
 * positioned over the link rather than interactive content nested inside it.
 */
export const PokemonCard = memo(function PokemonCard({ item, index, href }: PokemonCardProps) {
  const prefetch = usePrefetchPokemon();
  const reducedMotion = useReducedMotion();
  const primaryType = item.pokemon?.types[0];

  return (
    <motion.article
      style={{ ...typeStyle(primaryType), height: CARD_HEIGHT }}
      whileHover={reducedMotion ? undefined : { y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="group relative rounded-[var(--radius-card)] border border-line bg-surface raised transition-shadow duration-200 hover:shadow-hover focus-within:border-line-strong"
    >
      <Link
        href={href}
        data-card-index={index}
        onMouseEnter={() => prefetch(item.name)}
        onFocus={() => prefetch(item.name)}
        className="flex h-full flex-col outline-none"
        aria-label={`${item.displayName}, ${formatDexNumber(item.id)}`}
      >
        {/* ------------------------------------------------------ art panel */}
        <div
          style={{ height: ART_PANEL_HEIGHT }}
          className="type-wash grid shrink-0 place-items-center overflow-hidden rounded-t-[calc(var(--radius-card)-1px)] border-b border-line"
        >
          <PokemonArt
            id={item.id}
            name={item.displayName}
            size={128}
            className="size-32 drop-shadow-[0_10px_16px_rgba(0,0,0,0.18)] transition-transform duration-300 ease-[var(--ease-out-soft)] group-hover:scale-[1.07]"
          />
        </div>

        {/* ------------------------------------------------------ info block */}
        <div className="flex flex-1 flex-col items-start px-4 pb-4 pt-7">
          <span className="tabular text-[11px] font-semibold tracking-wide text-ink-faint">
            {formatDexNumber(item.id)}
          </span>
          <h3 className="mt-0.5 text-[15px] font-semibold tracking-tight text-ink">
            {item.displayName}
          </h3>

          <div className="mt-2 flex min-h-[26px] flex-wrap items-center gap-1.5">
            {item.pokemon ? (
              item.pokemon.types.map((type) => <TypeChip key={type} type={type} />)
            ) : (
              <>
                <span className="shimmer h-[26px] w-16 rounded-full" />
                <span className="shimmer h-[26px] w-14 rounded-full opacity-60" />
              </>
            )}
          </div>
        </div>
      </Link>

      {/* ------------------------------------------------------ action row
          Sits on the seam between panel and info, half over each. */}
      <div
        className="absolute inset-x-0 z-10 flex -translate-y-1/2 items-center justify-center gap-2.5"
        style={{ top: ART_PANEL_HEIGHT }}
      >
        <CompareButton id={item.id} name={item.displayName} />
        <FavoriteButton id={item.id} name={item.displayName} className="size-9 shadow-resting" />
        <Link
          href={href}
          tabIndex={-1}
          aria-hidden
          onMouseEnter={() => prefetch(item.name)}
          className="grid size-9 place-items-center rounded-full border border-line bg-surface/80 text-ink-faint shadow-resting backdrop-blur transition-colors hover:border-line-strong hover:text-ink"
        >
          <ArrowUpRight className="size-4" />
        </Link>
      </div>
    </motion.article>
  );
});
