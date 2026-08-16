"use client";

import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { motion, useReducedMotion } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { CARD_HEIGHT, GRID_GAP, PokemonCard } from "@/components/pokemon/pokemon-card";
import { useColumnCount } from "@/hooks/use-column-count";
import { useGridKeyboardNav } from "@/hooks/use-grid-keyboard-nav";
import type { FeedItem } from "@/hooks/use-pokemon-feed";

interface PokemonGridProps {
  items: FeedItem[];
  /** Query string carried onto every card link so filters survive the detail view. */
  search: string;
}

/**
 * Window-virtualised card grid. Only the rows near the viewport exist in the DOM,
 * which is what lets the full 1025-entry dex scroll at 60fps, and the row height is
 * a constant so the scrollbar never lies about how long the page is.
 */
export function PokemonGrid({ items, search }: PokemonGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const columns = useColumnCount(containerRef);
  const reducedMotion = useReducedMotion();
  const onKeyDown = useGridKeyboardNav(columns);

  // The window virtualiser measures against the document, so it needs to know how
  // far down the page the grid starts.
  const [scrollMargin, setScrollMargin] = useState(0);
  useLayoutEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const update = () => setScrollMargin(element.getBoundingClientRect().top + window.scrollY);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const rowCount = Math.ceil(items.length / columns);
  const virtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: () => CARD_HEIGHT + GRID_GAP,
    overscan: 3,
    scrollMargin,
  });

  // Cards animate in the first time they are seen, never again — otherwise every
  // scroll would replay the entrance as rows recycle.
  const seen = useRef(new Set<number>());
  const renderedIds: number[] = [];

  useEffect(() => {
    for (const id of renderedIds) seen.current.add(id);
  });

  const virtualRows = virtualizer.getVirtualItems();

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: delegated arrow-key handler; the focusable targets are the card links inside
    <div ref={containerRef} onKeyDown={onKeyDown}>
      {/*
        `overflow-anchor: none` is load-bearing. Without it Chrome's scroll
        anchoring picks a row as its anchor, the virtualiser recycles that row
        out, the browser "corrects" the scroll position, and the two fight each
        other frame after frame.
      */}
      <div
        className="relative w-full"
        style={{ height: virtualizer.getTotalSize(), overflowAnchor: "none" }}
      >
        {virtualRows.map((row) => {
          const start = row.index * columns;
          const rowItems = items.slice(start, start + columns);

          return (
            <div
              key={row.key}
              className="absolute left-0 top-0 grid w-full"
              style={{
                transform: `translateY(${row.start - scrollMargin}px)`,
                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                gap: GRID_GAP,
                paddingBottom: GRID_GAP,
              }}
            >
              {rowItems.map((item, column) => {
                const isNew = !seen.current.has(item.id);
                renderedIds.push(item.id);

                return (
                  <motion.div
                    key={item.id}
                    initial={isNew && !reducedMotion ? { opacity: 0, y: 12 } : false}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.28, delay: column * 0.03, ease: [0.4, 0, 0.2, 1] }}
                  >
                    <PokemonCard
                      item={item}
                      index={start + column}
                      href={search ? `/pokemon/${item.name}?${search}` : `/pokemon/${item.name}`}
                    />
                  </motion.div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
