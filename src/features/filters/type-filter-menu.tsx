"use client";

import { Check, ChevronDown, Shapes, X } from "lucide-react";
import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ALL_TYPES, TYPE_META, typeStyle } from "@/lib/pokemon/type-meta";
import { cn } from "@/lib/utils/cn";
import type { PokemonTypeName } from "@/types/pokemon";

interface TypeFilterMenuProps {
  selected: PokemonTypeName[];
  onToggle: (type: PokemonTypeName) => void;
  onClear: () => void;
  className?: string;
}

/**
 * Eighteen types do not fit on one row at any realistic width, so they live behind
 * a single control, laid out as an even grid. Selection is multi-value: each pick
 * toggles in place and the menu stays open, so assembling "Fire + Water + Grass"
 * takes three clicks in one visit instead of three round trips.
 */
export function TypeFilterMenu({ selected, onToggle, onClear, className }: TypeFilterMenuProps) {
  const [open, setOpen] = useState(false);
  const count = selected.length;
  const first = count > 0 ? selected[0] : null;

  const summary =
    count === 0
      ? "Filter by type"
      : count === 1
        ? `Type: ${TYPE_META[selected[0]].label}`
        : `Types: ${selected.map((type) => TYPE_META[type].label).join(", ")}`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {/*
        The clear button is a sibling of the trigger, not a child of it: nesting a
        button inside a button is invalid HTML and browsers resolve the click
        target unpredictably. A shared wrapper carries the pill styling so the two
        still read as one control.
      */}
      <div
        style={first ? typeStyle(first) : undefined}
        data-selected={count > 0}
        className={cn(
          "type-pill raised inline-flex h-11 shrink-0 items-center rounded-(--radius-control) border-line! bg-surface text-sm font-medium",
          "has-[button:hover]:border-line-strong!",
          className,
        )}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={summary}
            className={cn(
              "inline-flex h-full min-w-0 flex-1 items-center gap-2 rounded-(--radius-control) pl-3 text-inherit",
              count > 0 ? "pr-1.5" : "pr-2.5",
            )}
          >
            {first ? (
              <TriggerIcon type={first} />
            ) : (
              <Shapes className="size-4 shrink-0 text-ink-faint" aria-hidden />
            )}
            <span className="truncate">{first ? TYPE_META[first].label : "All types"}</span>
            {count > 1 && (
              <span className="tabular shrink-0 rounded-md bg-canvas-muted px-1.5 py-0.5 text-xs font-semibold text-ink-muted">
                +{count - 1}
              </span>
            )}
            <ChevronDown
              className={cn(
                "size-4 shrink-0 text-ink-faint transition-transform duration-200",
                open && "rotate-180",
              )}
              aria-hidden
            />
          </button>
        </PopoverTrigger>

        {count > 0 && (
          <button
            type="button"
            onClick={onClear}
            aria-label={
              count === 1
                ? `Clear ${TYPE_META[selected[0]].label} filter`
                : `Clear all ${count} type filters`
            }
            className="mr-1.5 grid size-7 shrink-0 place-items-center rounded-full text-ink-faint transition-colors hover:bg-canvas-muted hover:text-ink"
          >
            <X className="size-3.5" aria-hidden />
          </button>
        )}
      </div>

      <PopoverContent align="start" className="w-[min(23rem,calc(100vw-2rem))]">
        <button
          type="button"
          onClick={onClear}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-sm font-medium transition-colors",
            count === 0 ? "bg-canvas-muted text-ink" : "text-ink-muted hover:bg-canvas-muted",
          )}
        >
          <Shapes className="size-4 shrink-0 text-ink-faint" aria-hidden />
          All types
          {count === 0 && <Check className="ml-auto size-4" aria-hidden />}
        </button>

        <div aria-hidden className="my-1.5 h-px bg-line" />

        <fieldset className="grid grid-cols-3 gap-1 border-0">
          <legend className="sr-only">Pokémon types — select any combination</legend>
          {ALL_TYPES.map((type) => {
            const { label, Icon } = TYPE_META[type];
            const isSelected = selected.includes(type);

            return (
              <button
                key={type}
                type="button"
                style={typeStyle(type)}
                data-selected={isSelected}
                aria-pressed={isSelected}
                onClick={() => onToggle(type)}
                className="type-pill flex items-center gap-2 rounded-xl px-2.5 py-2 text-left text-[13px] font-medium"
              >
                <Icon className="size-4 shrink-0 text-(--type-color)" aria-hidden />
                <span className="truncate">{label}</span>
                {isSelected && (
                  <X className="ml-auto size-3.5 shrink-0 text-ink-muted" aria-hidden />
                )}
              </button>
            );
          })}
        </fieldset>

        {count > 0 && (
          <>
            <div aria-hidden className="my-1.5 h-px bg-line" />
            <div className="flex items-center justify-between px-2.5 py-1">
              <span className="text-xs text-ink-faint">
                <span className="tabular font-semibold text-ink-muted">{count}</span>{" "}
                {count === 1 ? "type" : "types"} selected
              </span>
              <button
                type="button"
                onClick={onClear}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-ink-faint transition-colors hover:bg-canvas-muted hover:text-ink"
              >
                <X className="size-3.5" aria-hidden />
                Clear
              </button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}

function TriggerIcon({ type }: { type: PokemonTypeName }) {
  const { Icon } = TYPE_META[type];
  return <Icon className="size-4 shrink-0 text-(--type-color)" aria-hidden />;
}
