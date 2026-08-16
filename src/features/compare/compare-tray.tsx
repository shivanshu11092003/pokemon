"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import { GitCompareArrows, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { PokemonArt } from "@/components/pokemon/pokemon-art";
import { Button } from "@/components/ui/button";
import { useHydrated } from "@/hooks/use-hydrated";
import { pokemonDetailOptions, pokemonIndexOptions } from "@/lib/query/options";
import { cn } from "@/lib/utils/cn";
import { MAX_COMPARE, useUiStore } from "@/stores/ui-store";
import type { Pokemon } from "@/types/pokemon";
import { CompareDialog } from "./compare-dialog";

/**
 * Docks as soon as one Pokémon is selected so the interaction explains itself:
 * you can see what you have picked and how many more the comparison wants.
 */
export function CompareTray() {
  const hydrated = useHydrated();
  const compare = useUiStore((state) => state.compare);
  const toggleCompare = useUiStore((state) => state.toggleCompare);
  const clearCompare = useUiStore((state) => state.clearCompare);
  const [isOpen, setIsOpen] = useState(false);

  const { data: index } = useQuery(pokemonIndexOptions());
  const names = compare.map((id) => index?.find((entry) => entry.id === id)?.name ?? String(id));

  const selected = useQueries({
    queries: names.map((name) => pokemonDetailOptions(name)),
    combine: (results) =>
      results.map((result) => result.data).filter((data): data is Pokemon => Boolean(data)),
  });

  const isReady = compare.length === MAX_COMPARE;

  return (
    <>
      <AnimatePresence>
        {hydrated && compare.length > 0 && (
          <motion.div
            initial={{ y: 88, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 88, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="fixed inset-x-0 bottom-0 z-30 px-3 pb-3 sm:px-4 sm:pb-4"
          >
            <div className="mx-auto flex max-w-3xl flex-col gap-2 rounded-[var(--radius-card)] border border-line bg-surface/95 p-2.5 shadow-hover backdrop-blur-xl sm:flex-row sm:items-center sm:gap-3 sm:py-2.5 sm:pl-4 sm:pr-3">
              <span className="hidden text-sm font-medium text-ink-muted sm:block">Compare</span>

              <ul className="flex min-w-0 flex-1 items-center justify-between gap-1.5 overflow-x-auto py-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:justify-start sm:gap-2">
                {compare.map((id, position) => {
                  const pokemon = selected.find((entry) => entry.id === id);
                  return (
                    <div key={id} className="flex min-w-0 flex-1 items-center justify-between gap-1.5 sm:flex-initial">
                      {position > 0 && (
                        <span className="tabular shrink-0 rounded-full bg-brand/12 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-brand-accent">
                          VS
                        </span>
                      )}
                      <li className="flex min-w-0 flex-1 items-center justify-between gap-1.5 rounded-full bg-canvas-muted py-1 pl-1 pr-2.5 sm:flex-initial sm:pr-2.5">
                        <PokemonArt
                          id={id}
                          name={pokemon?.displayName ?? `Pokémon ${id}`}
                          size={28}
                          className="size-6.5 shrink-0 sm:size-7"
                        />
                        <span className="truncate text-xs font-medium text-ink sm:max-w-[130px] sm:text-[13px]">
                          {pokemon?.displayName ?? names[position]}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleCompare(id)}
                          aria-label={`Remove ${pokemon?.displayName ?? "Pokémon"} from comparison`}
                          className="shrink-0 text-ink-faint transition-colors hover:text-ink"
                        >
                          <X className="size-3.5" />
                        </button>
                      </li>
                    </div>
                  );
                })}

                {!isReady && (
                  <li className="shrink-0 whitespace-nowrap rounded-full border border-dashed border-line px-3 py-1 text-xs text-ink-faint sm:py-1.5 sm:text-[13px]">
                    Pick 1 more
                  </li>
                )}
              </ul>

              <div className="flex items-center justify-end gap-2 border-t border-line/40 pt-2 sm:shrink-0 sm:border-0 sm:pt-0">
                <Button variant="ghost" size="sm" onClick={clearCompare} className="text-xs sm:text-sm">
                  Clear
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={!isReady || selected.length < MAX_COMPARE}
                  onClick={() => setIsOpen(true)}
                >
                  <GitCompareArrows className="size-4" />
                  Compare
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isOpen && selected.length === MAX_COMPARE && (
        <CompareDialog pokemon={selected} onClose={() => setIsOpen(false)} />
      )}
    </>
  );
}
