"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { usePrefetchPokemon } from "@/hooks/use-pokemon-detail";
import type { Feed } from "@/hooks/use-pokemon-feed";
import { PokemonStage } from "./pokemon-stage";
import { StageBackdrop } from "./stage-backdrop";
import { StageRail } from "./stage-rail";

interface StageViewProps {
  feed: Feed;
  /** Current filter/search query string, carried onto the detail link. */
  search: string;
  activeName: string | null;
}

/**
 * Character-select browsing: one Pokémon presented full-bleed, the rest reachable
 * through the rail underneath.
 *
 * The focused index is deliberately *not* in the URL — it is a browsing cursor,
 * and writing every arrow-key press into history would make the back button
 * useless. The shareable URL is the full entry the CTA opens.
 */
export function StageView({ feed, search, activeName }: StageViewProps) {
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

  // Warm the neighbours so stepping along the rail never waits on the network.
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
    // `flex-1` rather than a `100svh` calculation: the header and toolbar are
    // different heights at every breakpoint, and hardcoded viewport maths would
    // push the rail below the fold at exactly one of them.
    <section
      id="content"
      className="relative isolate flex min-h-128 flex-1 flex-col overflow-hidden"
    >
      <StageBackdrop id={item.id} types={item.pokemon?.types ?? []} />

      <PokemonStage item={item} href={hrefFor(item.name)} isActive={activeName === item.name} />

      <StageRail
        items={items}
        activeIndex={index}
        total={totalCount}
        hasMore={hasMore}
        onFocusIndex={setIndex}
        onOpen={open}
        onLoadMore={loadMore}
      />
    </section>
  );
}
