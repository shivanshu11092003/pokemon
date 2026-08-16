"use client";

import { ArrowUpDown, ChevronDown } from "lucide-react";
import { parseSortKey, SORT_KEYS, SORT_LABELS, type SortKey } from "@/lib/pokemon/sort";

interface SortSelectProps {
  value: SortKey;
  onChange: (value: SortKey) => void;
}

/**
 * A styled native select rather than a custom listbox: it is keyboard- and
 * screen-reader-correct for free, and it uses the platform picker on mobile.
 */
export function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <div className="relative">
      <ArrowUpDown
        className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-faint"
        aria-hidden
      />
      <select
        aria-label="Sort Pokémon"
        value={value}
        onChange={(event) => onChange(parseSortKey(event.target.value))}
        className="h-10 w-full cursor-pointer appearance-none rounded-[var(--radius-control)] border border-line bg-surface pl-10 pr-9 text-sm font-medium text-ink transition-colors hover:border-line-strong sm:w-[13.5rem]"
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
