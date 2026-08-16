"use client";

import { AnimatePresence, motion } from "motion/react";
import { Aurora } from "@/components/layout/aurora";
import type { PokemonTypeName } from "@/types/pokemon";

interface StageBackdropProps {
  types: PokemonTypeName[];
}

/**
 * The panel's sense of place: an ambient field in the featured Pokémon's own type
 * colours, crossfaded on every selection change so the whole surface changes mood
 * with the Pokémon.
 *
 * Nothing else lives back here. An earlier version also set the dex number
 * enormous behind the content; it looked good in isolation and made the body copy
 * measurably harder to read in practice.
 */
export function StageBackdrop({ types }: StageBackdropProps) {
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
    </div>
  );
}
