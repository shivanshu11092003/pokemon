"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { usePrefetchPokemon } from "@/hooks/use-pokemon-detail";
import type { Feed } from "@/hooks/use-pokemon-feed";
import { formatCount } from "@/lib/utils/format";
import { FeaturedPokemon } from "./featured-pokemon";
import { StageBackdrop } from "./stage-backdrop";
import { StageRail } from "./stage-rail";

interface StageViewProps {
  feed: Feed;
  /** Current filter/search query string, carried onto the detail link. */
  search: string;
}

/**
 * Spotlight browsing: one Pokémon presented full-bleed inside a framed panel,
 * the rest reachable through the carousel beside it.
 *
 * The focused index is deliberately *not* in the URL — it is a browsing cursor,
 * and writing every arrow-key press into history would make the back button
 * useless. The shareable URL is the full entry the card opens.
 */
export function StageView({ feed, search }: StageViewProps) {
  const router = useRouter();
  const prefetch = usePrefetchPokemon();
  const { items, loadMore, hasMore, totalCount } = feed;

  // Reset to the top of the list whenever the result set itself changes.
  const [focus, setFocus] = useState({ key: search, index: 0 });
  if (focus.key !== search) setFocus({ key: search, index: 0 });
  const index = Math.min(focus.key === search ? focus.index : 0, Math.max(items.length - 1, 0));

  const setIndex = useCallback(
    (next: number) => setFocus((previous) => ({ ...previous, index: next })),
    [],
  );

  const item = items[index];

  // Warm the neighbours so stepping along the carousel never waits on the network.
  useEffect(() => {
    for (const offset of [1, -1, 2, -2]) {
      const neighbour = items[index + offset];
      if (neighbour) prefetch(neighbour.name);
    }
  }, [index, items, prefetch]);

  const hrefFor = useCallback(
    (name: string) => (search ? `/pokemon/${name}?${search}` : `/pokemon/${name}`),
    [search],
  );

  const open = useCallback(
    (target: number) => {
      const entry = items[target];
      if (entry) router.push(hrefFor(entry.name));
    },
    [items, router, hrefFor],
  );

  if (!item) return null;

  return (
    <main
      id="content"
      // Vertical inset mirrors the horizontal one, so the panel sits in an even
      // frame rather than touching the toolbar above it.
      className="mx-auto w-full max-w-[100rem] px-3 py-4 sm:px-5 sm:py-5 lg:px-8 lg:py-8"
    >
      {/*
        The framed panel: content sits on a raised, rounded surface rather than
        running to the window edges, which is what gives the layout its poster-like
        feel and lets artwork overhang without touching the browser chrome.
      */}
      <div className="raised-lg relative isolate overflow-hidden rounded-4xl border border-line bg-canvas-muted/60 px-5 pb-6 pt-6 sm:px-8 sm:pb-8 sm:pt-8 lg:px-12 lg:pb-8 lg:pt-10">
        <StageBackdrop types={item.pokemon?.types ?? []} />

        <div className="grid items-stretch gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-12">
          <FeaturedPokemon item={item} href={hrefFor(item.name)} />

          <div className="flex min-w-0 flex-col justify-between gap-8 lg:gap-12">
            <header className="grid gap-5 sm:grid-cols-[1.05fr_1fr] sm:items-start sm:gap-8">
              <div>
                <p className="text-sm font-bold tracking-tight text-brand-accent">Go explore</p>
                <h1 className="mt-2 font-logo text-[clamp(1.9rem,4vw,3rem)] leading-[1.04] tracking-[0.01em] text-ink">
                  The world
                  <br />
                  of Pokémon
                </h1>
              </div>

              <p className="text-pretty text-sm leading-relaxed text-ink-muted">
                Every Pokémon in the National Pokédex — searchable by name or number, filterable by
                type, and comparable side by side.{" "}
                <span className="tabular font-semibold text-ink">{formatCount(totalCount)}</span> in
                view right now.
              </p>
            </header>

            <StageRail
              className="-mr-5 sm:-mr-8 lg:-mr-12"
              items={items}
              activeIndex={index}
              total={totalCount}
              hasMore={hasMore}
              onFocusIndex={setIndex}
              onOpen={open}
              onLoadMore={loadMore}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
