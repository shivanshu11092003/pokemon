"use client";

import { useQuery } from "@tanstack/react-query";
import { Search, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { type KeyboardEvent, useEffect, useId, useMemo, useRef, useState } from "react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { pokemonIndexOptions } from "@/lib/query/options";
import { cn } from "@/lib/utils/cn";
import { formatDexNumber } from "@/lib/utils/format";
import { scoreMatch } from "@/lib/utils/fuzzy";
import { pixelSpriteUrl } from "@/lib/utils/sprites";

const MAX_SUGGESTIONS = 6;

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  /** Query string appended to suggestion links so filters survive the jump. */
  search: string;
}

/**
 * Typeahead runs entirely against the cached name index, so suggestions appear on
 * the same frame as the keystroke. Only the committed query touches the URL, and
 * that is debounced.
 */
export function SearchBar({ value, onChange, search }: SearchBarProps) {
  const router = useRouter();
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);

  const debounced = useDebouncedValue(draft, 300);
  const { data: index } = useQuery(pokemonIndexOptions());

  // The URL is the source of truth: a back-navigation or a cleared filter has to
  // flow back into the field.
  useEffect(() => setDraft(value), [value]);

  useEffect(() => {
    if (debounced !== value) onChange(debounced);
  }, [debounced, value, onChange]);

  const suggestions = useMemo(() => {
    if (!index || draft.trim().length < 1) return [];
    const query = draft.trim().toLowerCase();
    return index
      .map((entry) => ({ entry, score: scoreMatch(entry.name, query) }))
      .filter(
        (match): match is { entry: (typeof index)[number]; score: number } => match.score !== null,
      )
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_SUGGESTIONS)
      .map((match) => match.entry);
  }, [index, draft]);

  const open = isOpen && suggestions.length > 0;

  const goTo = (name: string) => {
    setIsOpen(false);
    inputRef.current?.blur();
    router.push(search ? `/pokemon/${name}?${search}` : `/pokemon/${name}`);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      if (open) setIsOpen(false);
      else setDraft("");
      return;
    }
    if (!open) return;

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const delta = event.key === "ArrowDown" ? 1 : -1;
      setHighlighted((current) => {
        const next = current + delta;
        if (next < 0) return suggestions.length - 1;
        if (next >= suggestions.length) return 0;
        return next;
      });
      return;
    }

    if (event.key === "Enter" && highlighted >= 0) {
      event.preventDefault();
      const picked = suggestions[highlighted];
      if (picked) goTo(picked.name);
    }
  };

  return (
    <search className="relative block w-full">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const exact = suggestions[0];
          if (exact && exact.name === draft.trim().toLowerCase()) goTo(exact.name);
          else onChange(draft);
        }}
      >
        <label htmlFor="pokemon-search" className="sr-only">
          Search Pokémon by name or dex number
        </label>

        <Search
          className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-ink-faint"
          aria-hidden
        />

        <input
          ref={inputRef}
          id="pokemon-search"
          type="search"
          role="combobox"
          autoComplete="off"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={highlighted >= 0 ? `${listboxId}-${highlighted}` : undefined}
          placeholder="Search Pokémon…"
          value={draft}
          onChange={(event) => {
            setDraft(event.target.value);
            setIsOpen(true);
            setHighlighted(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => window.setTimeout(() => setIsOpen(false), 120)}
          onKeyDown={onKeyDown}
          className={cn(
            "h-12 w-full rounded-[var(--radius-control)] border border-line bg-surface pl-11 pr-11 text-[15px] text-ink",
            "placeholder:text-ink-faint focus:border-line-strong",
            "[&::-webkit-search-cancel-button]:hidden",
          )}
        />

        {draft && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setDraft("");
              onChange("");
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-ink-faint transition-colors hover:bg-canvas-muted hover:text-ink"
          >
            <X className="size-4" />
          </button>
        )}
      </form>

      <AnimatePresence>
        {open && (
          <motion.ul
            id={listboxId}
            role="listbox"
            aria-label="Pokémon suggestions"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute z-40 mt-2 w-full overflow-hidden rounded-[var(--radius-control)] border border-line bg-surface p-1.5 shadow-hover"
          >
            {suggestions.map((entry, position) => (
              <li key={entry.id}>
                <button
                  type="button"
                  id={`${listboxId}-${position}`}
                  role="option"
                  aria-selected={position === highlighted}
                  onMouseEnter={() => setHighlighted(position)}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => goTo(entry.name)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                    position === highlighted ? "bg-canvas-muted text-ink" : "text-ink-muted",
                  )}
                >
                  {/* Pixel sprites are ~2KB and need no optimisation pipeline. */}
                  {/** biome-ignore lint/performance/noImgElement: tiny static sprite */}
                  <img
                    src={pixelSpriteUrl(entry.id)}
                    alt=""
                    width={32}
                    height={32}
                    loading="lazy"
                    className="size-8 shrink-0 [image-rendering:pixelated]"
                  />
                  <span className="font-medium text-ink">{entry.displayName}</span>
                  <span className="tabular ml-auto text-xs text-ink-faint">
                    {formatDexNumber(entry.id)}
                  </span>
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </search>
  );
}
