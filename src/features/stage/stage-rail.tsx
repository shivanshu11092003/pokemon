"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type KeyboardEvent, useCallback, useEffect, useRef } from "react";
import { PokemonArt } from "@/components/pokemon/pokemon-art";
import type { FeedItem } from "@/hooks/use-pokemon-feed";
import { typeStyle } from "@/lib/pokemon/type-meta";
import { cn } from "@/lib/utils/cn";
import { formatCount, formatDexNumber } from "@/lib/utils/format";

const ITEM_WIDTH = 148;
const ITEM_GAP = 16;
/** Headroom inside the scroll box so artwork can rise above its card without clipping. */
const ART_OVERHANG = 44;

interface StageRailProps {
  className?: string;
  items: FeedItem[];
  activeIndex: number;
  total: number;
  hasMore: boolean;
  onFocusIndex: (index: number) => void;
  onOpen: (index: number) => void;
  onLoadMore: () => void;
}

/**
 * The character-select carousel. Horizontally virtualised, so it stays cheap once
 * a few hundred Pokémon are loaded, and it pulls the next page in as the
 * selection approaches its right edge.
 */
export function StageRail({
  className,
  items,
  activeIndex,
  total,
  hasMore,
  onFocusIndex,
  onOpen,
  onLoadMore,
}: StageRailProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    horizontal: true,
    count: items.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ITEM_WIDTH + ITEM_GAP,
    overscan: 6,
  });

  // Keep the selection in view as the user walks the dex with the keyboard.
  useEffect(() => {
    virtualizer.scrollToIndex(activeIndex, { align: "center", behavior: "smooth" });
  }, [activeIndex, virtualizer]);

  // Pull the next page in before the user actually reaches the end of the rail.
  useEffect(() => {
    if (hasMore && activeIndex >= items.length - 8) onLoadMore();
  }, [hasMore, activeIndex, items.length, onLoadMore]);

  const step = useCallback(
    (delta: number) => {
      onFocusIndex(Math.max(0, Math.min(activeIndex + delta, items.length - 1)));
    },
    [activeIndex, items.length, onFocusIndex],
  );

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case "ArrowRight":
        event.preventDefault();
        step(1);
        break;
      case "ArrowLeft":
        event.preventDefault();
        step(-1);
        break;
      case "Home":
        event.preventDefault();
        onFocusIndex(0);
        break;
      case "End":
        event.preventDefault();
        onFocusIndex(items.length - 1);
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        onOpen(activeIndex);
        break;
      default:
        break;
    }
  };

  return (
    <div className={cn("min-w-0", className)}>
      <div className="mb-2 flex items-center justify-between gap-3 pl-1 pr-5 sm:pr-8 lg:pr-12">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-faint">
          Browse the dex
        </p>
        <div className="flex items-center gap-2">
          <p className="tabular text-xs text-ink-faint">
            {formatCount(activeIndex + 1)} / {formatCount(total)}
          </p>
          <RailArrow direction="previous" onClick={() => step(-1)} disabled={activeIndex === 0} />
          <RailArrow
            direction="next"
            onClick={() => step(1)}
            disabled={activeIndex >= items.length - 1 && !hasMore}
          />
        </div>
      </div>

      {/*
        One tab stop, then arrow keys move the selection inside it. Stepping
        through 1,025 individual tab stops would be unusable.
      */}
      <div
        ref={scrollRef}
        role="listbox"
        aria-label="Choose a Pokémon"
        aria-activedescendant={`rail-item-${items[activeIndex]?.id ?? 0}`}
        tabIndex={0}
        onKeyDown={onKeyDown}
        className="rail overflow-x-auto overflow-y-hidden rounded-3xl outline-offset-4"
        style={{ paddingTop: ART_OVERHANG }}
      >
        <div className="relative" style={{ width: virtualizer.getTotalSize(), height: 172 }}>
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const item = items[virtualItem.index];
            if (!item) return null;

            return (
              <div
                key={item.id}
                className="absolute left-0 top-0"
                style={{ width: ITEM_WIDTH, transform: `translateX(${virtualItem.start}px)` }}
              >
                <RailCard
                  item={item}
                  isActive={virtualItem.index === activeIndex}
                  onSelect={() =>
                    virtualItem.index === activeIndex
                      ? onOpen(virtualItem.index)
                      : onFocusIndex(virtualItem.index)
                  }
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function RailCard({
  item,
  isActive,
  onSelect,
}: {
  item: FeedItem;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      id={`rail-item-${item.id}`}
      role="option"
      aria-selected={isActive}
      aria-label={`${item.displayName}, ${formatDexNumber(item.id)}${
        isActive ? ". Select again to open" : ""
      }`}
      tabIndex={-1}
      onClick={onSelect}
      style={typeStyle(item.pokemon?.types[0])}
      className={cn(
        "group relative flex h-43 w-full flex-col justify-end rounded-card border p-3 text-center",
        "transition-[transform,box-shadow,border-color] duration-300 ease-(--ease-out-soft)",
        isActive
          ? "type-wash raised-lg -translate-y-2 border-[color-mix(in_oklab,var(--type-color)_45%,transparent)]"
          : "raised border-line bg-surface/70 hover:-translate-y-1 hover:shadow-hover",
      )}
    >
      {/* Artwork escapes the top of the card — the signature move of this layout. */}
      <span className="pointer-events-none absolute inset-x-0 -top-11 flex justify-center">
        <PokemonArt
          id={item.id}
          name={item.displayName}
          size={144}
          className={cn(
            "size-29 drop-shadow-[0_14px_18px_rgba(0,0,0,0.22)] transition-transform duration-300 ease-(--ease-out-soft)",
            isActive ? "scale-110" : "group-hover:scale-105",
          )}
        />
      </span>

      <span
        className={cn(
          // Every name wears its own type colour — inactive ones simply sit back.
          "type-ink truncate text-[13px] font-bold tracking-tight transition-opacity",
          isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100",
        )}
      >
        {item.displayName}
      </span>
      <span className="tabular mt-0.5 text-[10px] font-medium text-ink-faint">
        {formatDexNumber(item.id)}
      </span>
    </button>
  );
}

function RailArrow({
  direction,
  onClick,
  disabled,
}: {
  direction: "previous" | "next";
  onClick: () => void;
  disabled: boolean;
}) {
  const Icon = direction === "previous" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "previous" ? "Previous Pokémon" : "Next Pokémon"}
      className="grid size-8 shrink-0 place-items-center rounded-full border border-line bg-surface text-ink-muted transition-colors hover:border-line-strong hover:text-ink disabled:pointer-events-none disabled:opacity-40"
    >
      <Icon className="size-4" />
    </button>
  );
}
