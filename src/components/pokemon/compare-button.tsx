"use client";

import { GitCompareArrows } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils/cn";
import { useUiStore } from "@/stores/ui-store";

interface CompareButtonProps {
  id: number;
  name: string;
  className?: string;
}

/**
 * Card-sized sibling of `FavoriteButton`: same circular chrome, toggles the
 * comparison slate. Lives outside the card link, so no navigation to suppress.
 */
export function CompareButton({ id, name, className }: CompareButtonProps) {
  const hydrated = useHydrated();
  const reducedMotion = useReducedMotion();
  const isComparing = useUiStore((state) => state.compare.includes(id)) && hydrated;
  const toggleCompare = useUiStore((state) => state.toggleCompare);

  return (
    <motion.button
      type="button"
      aria-pressed={isComparing}
      aria-label={
        isComparing ? `Remove ${name} from the comparison` : `Add ${name} to the comparison`
      }
      whileTap={reducedMotion ? undefined : { scale: 0.82 }}
      transition={{ type: "spring", stiffness: 600, damping: 18 }}
      onClick={() => toggleCompare(id)}
      className={cn(
        "grid size-9 place-items-center rounded-full border border-line bg-surface/80 text-ink-faint shadow-resting backdrop-blur transition-colors",
        "hover:border-line-strong hover:text-ink",
        isComparing && "border-transparent bg-brand/12 text-brand-accent hover:text-brand-accent",
        className,
      )}
    >
      <GitCompareArrows className="size-4" aria-hidden />
    </motion.button>
  );
}
