"use client";

import { Heart } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useHydrated } from "@/hooks/use-hydrated";
import { cn } from "@/lib/utils/cn";
import { useUiStore } from "@/stores/ui-store";

interface FavoriteButtonProps {
  id: number;
  name: string;
  size?: "sm" | "md";
  className?: string;
}

export function FavoriteButton({ id, name, size = "sm", className }: FavoriteButtonProps) {
  const hydrated = useHydrated();
  const reducedMotion = useReducedMotion();
  const isFavorite = useUiStore((state) => state.favorites.includes(id)) && hydrated;
  const toggleFavorite = useUiStore((state) => state.toggleFavorite);

  return (
    <motion.button
      type="button"
      aria-pressed={isFavorite}
      aria-label={isFavorite ? `Remove ${name} from favourites` : `Add ${name} to favourites`}
      whileTap={reducedMotion ? undefined : { scale: 0.82 }}
      transition={{ type: "spring", stiffness: 600, damping: 18 }}
      onClick={(event) => {
        // Cards are links; favouriting must not navigate.
        event.preventDefault();
        event.stopPropagation();
        toggleFavorite(id);
      }}
      className={cn(
        "grid place-items-center rounded-full border border-line bg-surface/70 text-ink-faint backdrop-blur transition-colors",
        "hover:border-line-strong hover:text-ink",
        size === "sm" ? "size-8" : "size-10",
        isFavorite && "border-transparent bg-brand/12 text-brand-accent hover:text-brand-accent",
        className,
      )}
    >
      <Heart
        className={cn(size === "sm" ? "size-4" : "size-[18px]", isFavorite && "fill-current")}
        aria-hidden
      />
    </motion.button>
  );
}
