"use client";

import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ALL_TYPES, TYPE_META, typeStyle } from "@/lib/pokemon/type-meta";
import { cn } from "@/lib/utils/cn";
import type { PokemonTypeName } from "@/types/pokemon";

interface TypeFilterMenuProps {
  selected: PokemonTypeName | null;
  onSelect: (type: PokemonTypeName | null) => void;
}

/**
 * Eighteen types do not fit on one row at any realistic width, so the previous
 * scrolling rail was permanently clipped — the last few types simply were not
 * discoverable. Behind a single control they all fit, laid out as an even grid,
 * and the toolbar collapses to one tidy row.
 */
export function TypeFilterMenu({ selected, onSelect }: TypeFilterMenuProps) {
  const [open, setOpen] = useState(false);
  const active = selected ? TYPE_META[selected] : null;

  const choose = (type: PokemonTypeName | null) => {
    onSelect(type);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          style={selected ? typeStyle(selected) : undefined}
          data-selected={selected !== null}
          aria-label={active ? `Type: ${active.label}` : "Filter by type"}
          className={cn(
            "type-pill raised inline-flex h-11 shrink-0 items-center gap-2 rounded-(--radius-control) border-line! bg-surface pl-3 pr-2.5 text-sm font-medium",
            "hover:border-line-strong! hover:bg-surface",
          )}
        >
          {selected ? (
            <>
              <span aria-hidden className="type-dot size-2 rounded-full" />
              {active?.label}
            </>
          ) : (
            <>
              <span aria-hidden className="size-2 rounded-full bg-line-strong" />
              All types
            </>
          )}
          <ChevronDown
            className={cn(
              "size-4 text-ink-faint transition-transform duration-200",
              open && "rotate-180",
            )}
            aria-hidden
          />
        </button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-[min(23rem,calc(100vw-2rem))]">
        <button
          type="button"
          onClick={() => choose(null)}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm font-medium transition-colors",
            selected === null ? "bg-canvas-muted text-ink" : "text-ink-muted hover:bg-canvas-muted",
          )}
        >
          <span aria-hidden className="size-2 rounded-full bg-line-strong" />
          All types
          {selected === null && <Check className="ml-auto size-4" aria-hidden />}
        </button>

        <div aria-hidden className="my-1.5 h-px bg-line" />

        <fieldset className="grid grid-cols-3 gap-1 border-0">
          <legend className="sr-only">Pokémon types</legend>
          {ALL_TYPES.map((type) => {
            const { label, Icon } = TYPE_META[type];
            const isSelected = selected === type;

            return (
              <button
                key={type}
                type="button"
                style={typeStyle(type)}
                data-selected={isSelected}
                aria-pressed={isSelected}
                onClick={() => choose(type)}
                className="type-pill flex items-center gap-2 rounded-xl px-2.5 py-2 text-left text-[13px] font-medium"
              >
                <Icon className="size-4 shrink-0 text-(--type-color)" aria-hidden />
                <span className="truncate">{label}</span>
              </button>
            );
          })}
        </fieldset>
      </PopoverContent>
    </Popover>
  );
}
