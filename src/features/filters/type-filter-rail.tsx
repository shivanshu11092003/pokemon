"use client";

import { X } from "lucide-react";
import { ALL_TYPES, TYPE_META, typeStyle } from "@/lib/pokemon/type-meta";
import { cn } from "@/lib/utils/cn";
import type { PokemonTypeName } from "@/types/pokemon";

interface TypeFilterRailProps {
  selected: PokemonTypeName[];
  onToggle: (type: PokemonTypeName) => void;
  onClear: () => void;
}

export function TypeFilterRail({ selected, onToggle, onClear }: TypeFilterRailProps) {
  const hasSelection = selected.length > 0;

  return (
    <div className="flex items-center gap-2">
      <fieldset className="rail -mx-1 flex min-w-0 flex-1 gap-2 overflow-x-auto border-0 px-1 py-1">
        <legend className="sr-only">Filter by type</legend>

        <button
          type="button"
          onClick={onClear}
          aria-pressed={!hasSelection}
          className={cn(
            "shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors",
            hasSelection
              ? "border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink"
              : "border-transparent bg-ink text-canvas",
          )}
        >
          All types
        </button>

        {ALL_TYPES.map((type) => {
          const isSelected = selected.includes(type);
          const { label, Icon } = TYPE_META[type];

          return (
            <button
              key={type}
              type="button"
              style={typeStyle(type)}
              data-selected={isSelected}
              aria-pressed={isSelected}
              onClick={() => onToggle(type)}
              className="type-chip shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-[background-color,box-shadow,color] duration-150"
            >
              <span className="flex items-center gap-1.5">
                <Icon className="size-3.5" aria-hidden />
                {label}
              </span>
            </button>
          );
        })}
      </fieldset>

      {selected.length > 1 && (
        <button
          type="button"
          onClick={onClear}
          className="hidden shrink-0 items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:text-ink sm:inline-flex"
        >
          <X className="size-3.5" />
          Clear
        </button>
      )}
    </div>
  );
}
