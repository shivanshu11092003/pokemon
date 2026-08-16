"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type KeyboardEvent, useCallback, useEffect, useRef } from "react";
import { PokemonArt } from "@/components/pokemon/pokemon-art";
import type { FeedItem } from "@/hooks/use-pokemon-feed";
import { typeStyle } from "@/lib/pokemon/type-meta";
import { cn } from "@/lib/utils/cn";
import { formatCount, formatDexNumber } from "@/lib/utils/format";

const ITEM_WIDTH = 96;
const ITEM_GAP = 12;

interface StageRailProps {
  items: FeedItem[];
  activeIndex: number;
  total: number;
  hasMore: boolean;
  onFocusIndex: (index: number) => void;
  onOpen: (index: number) => void;
  onLoadMore: () => void;
}

/**
 * The character-select strip. Horizontally virtualised, so the rail stays cheap
 * once a few hundred Pokémon are loaded, and it pulls the next page in as it
 * approaches its right edge.
 */
export function StageRail({
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
    overscan: 8,
  });

  // Keep the selection centred as the user walks the dex with the keyboard.
  useEffect(() => {
    virtualizer.scrollToIndex(activeIndex, { align: "center", behavior: "smooth" });
  }, [activeIndex, virtualizer]);

  // Pull the next page in before the user actually reaches the end of the rail.
  useEffect(() => {
    if (hasMore && activeIndex >= items.length - 8) onLoadMore();
  }, [hasMore, activeIndex, items.length, onLoadMore]);

  const step = useCallback(
    (delta: number) => {
      const next = Math.max(0, Math.min(activeIndex + delta, items.length - 1));
      onFocusIndex(next);
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
      default:
        break;
    }
  };

  return (
    <div className="border-t border-line bg-canvas/70 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[100rem] items-center gap-2 px-2 py-3 sm:px-4 lg:px-6">
        <RailArrow direction="previous" onClick={() => step(-1)} disabled={activeIndex === 0} />

        {/*
          The rail is one composite widget: a single tab stop, then arrow keys
          move the selection inside it. Stepping through 1,025 tab stops would be
          unusable.
        */}
        <div
          ref={scrollRef}
          role="listbox"
          aria-label="Choose a Pokémon"
          aria-activedescendant={`rail-item-${items[activeIndex]?.id ?? 0}`}
          tabIndex={0}
          onKeyDown={onKeyDown}
          className="rail flex-1 overflow-x-auto overflow-y-hidden rounded-(--radius-control) outline-offset-4"
        >
          <div
            className="relative"
            style={{ width: virtualizer.getTotalSize(), height: ITEM_WIDTH + 26 }}
          >
            {virtualizer.getVirtualItems().map((virtualItem) => {
              const item = items[virtualItem.index];
              if (!item) return null;
              const isActive = virtualItem.index === activeIndex;

              return (
                <div
                  key={item.id}
                  className="absolute left-0 top-0"
                  style={{
                    width: ITEM_WIDTH,
                    transform: `translateX(${virtualItem.start}px)`,
                  }}
                >
                  <RailItem
                    item={item}
                    isActive={isActive}
                    onSelect={() =>
                      isActive ? onOpen(virtualItem.index) : onFocusIndex(virtualItem.index)
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>

        <RailArrow
          direction="next"
          onClick={() => step(1)}
          disabled={activeIndex >= items.length - 1 && !hasMore}
        />

        <p className="tabular hidden shrink-0 px-2 text-xs text-ink-faint sm:block">
          {formatCount(activeIndex + 1)} / {formatCount(total)}
        </p>
      </div>
    </div>
  );
}

function RailItem({
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
      aria-label={`${item.displayName}, ${formatDexNumber(item.id)}${isActive ? ". Select again to open" : ""}`}
      tabIndex={-1}
      onClick={onSelect}
      style={typeStyle(item.pokemon?.types[0])}
      className={cn(
        "group flex w-full flex-col items-center gap-1 rounded-(--radius-control) border p-1.5 transition-[border-color,background-color,transform] duration-200",
        isActive
          ? "type-wash -translate-y-1 border-[color-mix(in_oklab,var(--type-color)_55%,transparent)]"
          : "border-transparent hover:border-line hover:bg-canvas-muted",
      )}
    >
      <PokemonArt
        id={item.id}
        name={item.displayName}
        size={72}
        className={cn(
          "size-[72px] transition-transform duration-200",
          isActive ? "scale-105" : "opacity-70 group-hover:scale-105 group-hover:opacity-100",
        )}
      />
      <span
        className={cn(
          "tabular text-[10px] font-semibold",
          isActive ? "text-ink" : "text-ink-faint",
        )}
      >
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
      className="hidden size-10 shrink-0 place-items-center rounded-full border border-line bg-surface text-ink-muted transition-colors hover:border-line-strong hover:text-ink disabled:pointer-events-none disabled:opacity-40 sm:grid"
    >
      <Icon className="size-5" />
    </button>
  );
}
