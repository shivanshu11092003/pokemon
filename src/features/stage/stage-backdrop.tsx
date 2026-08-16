"use client";

import { AnimatePresence, motion } from "motion/react";
import { Aurora } from "@/components/layout/aurora";
import { formatDexNumber } from "@/lib/utils/format";
import type { PokemonTypeName } from "@/types/pokemon";

interface StageBackdropProps {
  id: number;
  types: PokemonTypeName[];
}

/**
 * The stage's sense of place: an ambient field in the featured Pokémon's own type
 * colours, plus its dex number set enormous and nearly invisible behind the
 * content. Crossfaded on every selection change, so the whole screen changes mood
 * with the Pokémon.
 */
export function StageBackdrop({ id, types }: StageBackdropProps) {
  const colors = (types.length > 0 ? types : (["normal"] as PokemonTypeName[])).map(
    (type) => `var(--type-${type})`,
  );

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <AnimatePresence mode="sync">
        <motion.div
          key={types.join("-") || "none"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <Aurora colors={colors} />
        </motion.div>
      </AnimatePresence>

      {/*
        Centring happens on this wrapper, never on the animated child: Motion
        writes an inline `transform` for the slide, which would silently replace a
        `-translate-y-1/2` utility. Same reason the watermark's transparency lives
        in its colour rather than in an `opacity` class.
      */}
      <div className="absolute inset-y-0 right-0 flex items-center">
        <AnimatePresence mode="wait">
          <motion.span
            key={id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="tabular -mr-8 select-none text-[clamp(6rem,18vw,15rem)] font-bold leading-none tracking-tighter text-ink/5"
          >
            {formatDexNumber(id)}
          </motion.span>
        </AnimatePresence>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-32 bg-linear-to-b from-transparent to-canvas" />
    </div>
  );
}
