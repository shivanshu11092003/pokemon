"use client";

import { ALL_TYPES, TYPE_META, typeStyle } from "@/lib/pokemon/type-meta";
import { cn } from "@/lib/utils/cn";
import type { PokemonTypeName } from "@/types/pokemon";

interface TypeFilterRailProps {
  selected: PokemonTypeName | null;
  onSelect: (type: PokemonTypeName | null) => void;
}

/**
 * One type at a time, and — more importantly — one *colour* at a time.
 *
 * Rendering all eighteen types as saturated pills put eighteen competing accents
 * on screen at once, which reads as noise no matter how good the individual
 * colours are. Here every chip is neutral chrome carrying a small colour dot, and
 * only the active type is allowed to take its full colour.
 */
export function TypeFilterRail({ selected, onSelect }: TypeFilterRailProps) {
  return (
    <fieldset className="rail -mx-1 flex min-w-0 items-center gap-1.5 overflow-x-auto border-0 px-1 py-1">
      <legend className="sr-only">Filter by type</legend>

      <button
        type="button"
        onClick={() => onSelect(null)}
        aria-pressed={selected === null}
        className={cn(
          "h-9 shrink-0 rounded-full px-4 text-[13px] font-medium transition-colors duration-200",
          selected === null
            ? "bg-ink text-canvas"
            : "text-ink-faint hover:bg-canvas-muted hover:text-ink",
        )}
      >
        All
      </button>

      <span aria-hidden className="mx-1 h-5 w-px shrink-0 bg-line" />

      {ALL_TYPES.map((type) => {
        const isSelected = selected === type;
        const { label } = TYPE_META[type];

        return (
          <button
            key={type}
            type="button"
            style={typeStyle(type)}
            data-selected={isSelected}
            aria-pressed={isSelected}
            onClick={() => onSelect(type)}
            className="type-pill h-9 shrink-0 rounded-full pl-2.5 pr-3.5 text-[13px] font-medium"
          >
            <span className="flex items-center gap-2">
              <span aria-hidden className="type-dot size-2 rounded-full" />
              {label}
            </span>
          </button>
        );
      })}
    </fieldset>
  );
}
