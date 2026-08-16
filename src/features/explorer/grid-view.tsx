"use client";

import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { CardSkeletonGrid } from "@/components/pokemon/card-skeleton";
import { PokemonGrid } from "@/components/pokemon/pokemon-grid";
import type { Feed } from "@/hooks/use-pokemon-feed";
import { TYPE_META } from "@/lib/pokemon/type-meta";
import { formatCount } from "@/lib/utils/format";
import type { PokemonTypeName } from "@/types/pokemon";

interface GridViewProps {
  feed: Feed;
  search: string;
  types: PokemonTypeName[];
  query: string;
  isEmpty: boolean;
  emptyState: ReactNode;
}

/**
 * The classic card-grid mode. Lives in its own chunk — see `explorer.tsx` — so
 * the virtualiser and `react-infinite-scroll-component` are only downloaded by
 * readers who actually switch to it.
 */
export function GridView({ feed, search, types, query, isEmpty, emptyState }: GridViewProps) {
  return (
    <main
      id="content"
      className="mx-auto w-full max-w-[100rem] px-4 pb-24 pt-6 sm:px-6 sm:pt-7 lg:px-10 lg:pt-9"
    >
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h1 aria-live="polite" className="text-sm text-ink-muted">
          {feed.isPending ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="size-3.5 animate-spin" aria-hidden />
              Loading the Pokédex…
            </span>
          ) : (
            <>
              <span className="tabular font-semibold text-ink">{formatCount(feed.totalCount)}</span>{" "}
              Pokémon
              {describeFilters(types, query)}
            </>
          )}
        </h1>

        {(feed.partialSortNote || feed.isHydratingSort) && (
          <p className="text-xs text-ink-faint">
            {feed.isHydratingSort ? "Fetching stats to sort…" : feed.partialSortNote}
          </p>
        )}
      </div>

      {feed.isPending ? (
        <CardSkeletonGrid count={12} />
      ) : isEmpty ? (
        emptyState
      ) : (
        <InfiniteScroll
          dataLength={feed.items.length}
          next={feed.loadMore}
          hasMore={feed.hasMore}
          scrollThreshold={0.8}
          style={{ overflow: "visible" }}
          loader={<LoadingMore />}
          endMessage={<EndOfDex total={feed.totalCount} />}
        >
          <PokemonGrid items={feed.items} search={search} />
        </InfiniteScroll>
      )}
    </main>
  );
}

function describeFilters(types: PokemonTypeName[], query: string): string {
  const parts: string[] = [];
  if (types.length > 0) parts.push(`of type ${types.map((t) => TYPE_META[t].label).join(" or ")}`);
  if (query) parts.push(`matching “${query}”`);
  return parts.length > 0 ? ` ${parts.join(" ")}` : "";
}

/** Shown while the next page is on its way in. */
function LoadingMore() {
  return (
    <p className="flex items-center justify-center gap-2.5 py-10 text-sm text-ink-muted">
      <Loader2 className="size-4 animate-spin" aria-hidden />
      Loading more Pokémon…
    </p>
  );
}

/** The only footer the feed needs now that paging is automatic. */
function EndOfDex({ total }: { total: number }) {
  return (
    <p className="flex items-center justify-center gap-3 py-10 text-sm text-ink-faint">
      <span aria-hidden className="h-px w-8 bg-line" />
      That’s all {formatCount(total)} Pokémon
      <span aria-hidden className="h-px w-8 bg-line" />
    </p>
  );
}
