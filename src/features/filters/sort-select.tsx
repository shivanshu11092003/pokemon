"use client";

import { ArrowUpDown, ChevronDown } from "lucide-react";
import { parseSortKey, SORT_KEYS, SORT_LABELS, type SortKey } from "@/lib/pokemon/sort";
import { cn } from "@/lib/utils/cn";

interface SortSelectProps {
  value: SortKey;
  onChange: (value: SortKey) => void;
  className?: string;
}

/**
 * A styled native select rather than a custom listbox: it is keyboard- and
 * screen-reader-correct for free, and it uses the platform picker on mobile.
 */
export function SortSelect({ value, onChange, className }: SortSelectProps) {
  return (
    <div className={cn("relative", className)}>
      <ArrowUpDown
        className="pointer-events-none absolute left-3.5 top-1/2 hidden size-4 -translate-y-1/2 text-ink-faint sm:block"
        aria-hidden
      />
      <select
        aria-label="Sort Pokémon"
        value={value}
        onChange={(event) => onChange(parseSortKey(event.target.value))}
        className="raised h-11 w-full cursor-pointer appearance-none rounded-(--radius-control) border border-line bg-surface pl-3.5 pr-8 text-sm font-medium text-ink transition-colors duration-200 hover:border-line-strong sm:pl-10 sm:pr-9"
      >
        {SORT_KEYS.map((key) => (
          <option key={key} value={key}>
            {SORT_LABELS[key]}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint"
        aria-hidden
      />
    </div>
  );
}
