"use client";

import { useQueries, useQuery } from "@tanstack/react-query";
import { GitCompareArrows, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { PokemonArt } from "@/components/pokemon/pokemon-art";
import { Button } from "@/components/ui/button";
import { useHydrated } from "@/hooks/use-hydrated";
import { pokemonDetailOptions, pokemonIndexOptions } from "@/lib/query/options";
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
            className="fixed inset-x-0 bottom-0 z-30 px-4 pb-4"
          >
            <div className="mx-auto flex max-w-3xl items-center gap-3 rounded-[var(--radius-card)] border border-line bg-surface/85 p-2.5 pl-4 shadow-hover backdrop-blur-xl">
              <span className="hidden text-sm font-medium text-ink-muted sm:block">Compare</span>

              <ul className="flex flex-1 items-center gap-2">
                {compare.map((id, position) => {
                  const pokemon = selected.find((entry) => entry.id === id);
                  return (
                    <li
                      key={id}
                      className="flex items-center gap-1.5 rounded-full bg-canvas-muted py-1 pl-1 pr-2.5"
                    >
                      <PokemonArt
                        id={id}
                        name={pokemon?.displayName ?? `Pokémon ${id}`}
                        size={28}
                        className="size-7"
                      />
                      <span className="text-[13px] font-medium text-ink">
                        {pokemon?.displayName ?? names[position]}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleCompare(id)}
                        aria-label={`Remove ${pokemon?.displayName ?? "Pokémon"} from comparison`}
                        className="text-ink-faint transition-colors hover:text-ink"
                      >
                        <X className="size-3.5" />
                      </button>
                    </li>
                  );
                })}

                {!isReady && (
                  <li className="rounded-full border border-dashed border-line px-3 py-1.5 text-[13px] text-ink-faint">
                    Pick one more
                  </li>
                )}
              </ul>

              <Button variant="ghost" size="sm" onClick={clearCompare}>
                Clear
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={!isReady || selected.length < MAX_COMPARE}
                onClick={() => setIsOpen(true)}
              >
                <GitCompareArrows />
                Compare
              </Button>
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
