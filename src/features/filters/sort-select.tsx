"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { ArrowUpDown, Check, ChevronDown } from "lucide-react";
import { parseSortKey, SORT_KEYS, SORT_LABELS, type SortKey } from "@/lib/pokemon/sort";
import { cn } from "@/lib/utils/cn";

interface SortSelectProps {
  value: SortKey;
  onChange: (value: SortKey) => void;
  className?: string;
}

/**
 * Built on Radix Select rather than a native `<select>`.
 *
 * The native control could not be styled to match the rest of the toolbar — the
 * option list is drawn by the operating system, so it ignored the type scale, the
 * radii and the dark palette entirely. Radix keeps the parts that actually matter
 * (roving arrow keys, type-ahead, Home/End, Escape, focus return) and lets the
 * popup be ours.
 */
export function SortSelect({ value, onChange, className }: SortSelectProps) {
  return (
    <SelectPrimitive.Root value={value} onValueChange={(next) => onChange(parseSortKey(next))}>
      <SelectPrimitive.Trigger
        aria-label="Sort Pokémon"
        className={cn(
          "raised group inline-flex h-11 items-center gap-2 rounded-(--radius-control) border border-line bg-surface pl-3.5 pr-3 text-sm font-medium text-ink",
          "transition-colors duration-200 hover:border-line-strong",
          className,
        )}
      >
        <ArrowUpDown className="hidden size-4 shrink-0 text-ink-faint sm:block" aria-hidden />
        <span className="min-w-0 flex-1 truncate text-left">
          <SelectPrimitive.Value />
        </span>
        <SelectPrimitive.Icon asChild>
          <ChevronDown
            className="size-4 shrink-0 text-ink-faint transition-transform duration-200 group-data-[state=open]:rotate-180"
            aria-hidden
          />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={8}
          className={cn(
            "raised-lg z-50 overflow-hidden rounded-2xl border border-line bg-surface p-1.5",
            // Never narrower than the control that opened it.
            "min-w-[var(--radix-select-trigger-width)]",
          )}
        >
          <SelectPrimitive.Viewport>
            {SORT_KEYS.map((key) => (
              <SelectPrimitive.Item
                key={key}
                value={key}
                className={cn(
                  "flex cursor-pointer select-none items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm text-ink-muted outline-none",
                  "data-[highlighted]:bg-canvas-muted data-[highlighted]:text-ink",
                  "data-[state=checked]:font-medium data-[state=checked]:text-ink",
                )}
              >
                <SelectPrimitive.ItemText>{SORT_LABELS[key]}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="ml-auto">
                  <Check className="size-4" aria-hidden />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
