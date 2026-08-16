"use client";

import { Heart, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toDisplayName } from "@/lib/utils/format";

interface EmptyStateProps {
  query: string;
  favoritesOnly: boolean;
  suggestions: string[];
  onSuggestion: (name: string) => void;
  onClear: () => void;
}

export function EmptyState({
  query,
  favoritesOnly,
  suggestions,
  onSuggestion,
  onClear,
}: EmptyStateProps) {
  const isFavoritesEmpty = favoritesOnly && !query;

  return (
    <div className="flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-dashed border-line px-6 py-20 text-center">
      <div className="mb-5 grid size-14 place-items-center rounded-full bg-canvas-muted text-ink-faint">
        {isFavoritesEmpty ? <Heart className="size-6" /> : <SearchX className="size-6" />}
      </div>

      <h2 className="text-lg font-semibold text-ink">
        {isFavoritesEmpty ? "No favourites yet" : "Pokémon not found"}
      </h2>

      <p className="mt-2 max-w-sm text-sm text-ink-muted">
        {isFavoritesEmpty
          ? "Tap the heart on any Pokémon to keep it here. Favourites are saved on this device."
          : query
            ? `Nothing in the Pokédex matches “${query}”. Try another name, or a dex number.`
            : "No Pokémon match the filters you’ve selected."}
      </p>

      {suggestions.length > 0 && (
        <div className="mt-6">
          <p className="mb-2.5 text-xs font-medium uppercase tracking-wider text-ink-faint">
            Did you mean
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {suggestions.map((name) => (
              <Button key={name} variant="outline" size="sm" onClick={() => onSuggestion(name)}>
                {toDisplayName(name)}
              </Button>
            ))}
          </div>
        </div>
      )}

      {!isFavoritesEmpty && (
        <Button variant="primary" size="md" className="mt-7" onClick={onClear}>
          Clear filters
        </Button>
      )}
    </div>
  );
}
