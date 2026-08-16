"use client";

import { Heart, Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";
import InfiniteScroll from "react-infinite-scroll-component";
import { Aurora } from "@/components/layout/aurora";
import { CardSkeletonGrid } from "@/components/pokemon/card-skeleton";
import { PokemonGrid } from "@/components/pokemon/pokemon-grid";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { CompareTray } from "@/features/compare/compare-tray";
import { SortSelect } from "@/features/filters/sort-select";
import { TypeFilterRail } from "@/features/filters/type-filter-rail";
import { SearchBar } from "@/features/search/search-bar";
import { useExplorerParams } from "@/hooks/use-explorer-params";
import { useHydrated } from "@/hooks/use-hydrated";
import { usePokemonFeed } from "@/hooks/use-pokemon-feed";
import { TYPE_META } from "@/lib/pokemon/type-meta";
import { cn } from "@/lib/utils/cn";
import { formatCount } from "@/lib/utils/format";
import { useUiStore } from "@/stores/ui-store";
import { LoadMore } from "./load-more";

export function Explorer() {
  const params = useExplorerParams();
  const pathname = usePathname();
  const hydrated = useHydrated();

  const favorites = useUiStore((state) => state.favorites);
  const autoLoad = useUiStore((state) => state.autoLoad);
  const setAutoLoad = useUiStore((state) => state.setAutoLoad);

  const feed = usePokemonFeed({
    query: params.query,
    types: params.types,
    sort: params.sort,
    favoritesOnly: params.favoritesOnly,
    // Before hydration the persisted list is unknown; treating it as empty keeps
    // server and client markup identical.
    favorites: hydrated ? favorites : [],
  });

  // The grid stays mounted underneath the detail modal, so the "open" Pokémon is
  // read from the path rather than from state.
  const activeName = pathname.startsWith("/pokemon/")
    ? decodeURIComponent(pathname.split("/")[2] ?? "")
    : null;

  const showEmpty = !feed.isPending && !feed.isError && feed.items.length === 0;

  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-line">
        <Aurora />
        <div className="mx-auto max-w-[100rem] px-4 pb-10 pt-14 sm:px-6 sm:pt-20 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-faint">
              National Pokédex
            </p>
            <h1 className="mt-3 text-balance text-4xl font-bold tracking-tight text-ink sm:text-5xl">
              Every Pokémon, beautifully indexed
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-pretty text-[15px] leading-relaxed text-ink-muted">
              Search by name or dex number, filter by type, and compare base stats across 1,025
              Pokémon — powered live by PokéAPI.
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-xl">
            <SearchBar
              value={params.query}
              onChange={params.setQuery}
              search={params.searchString}
            />
          </div>
        </div>
      </section>

      <div className="sticky top-16 z-30 border-b border-line bg-canvas/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[100rem] flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:gap-4 lg:px-10">
          <div className="min-w-0 flex-1">
            <TypeFilterRail
              selected={params.types}
              onToggle={params.toggleType}
              onClear={params.clearTypes}
            />
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              aria-pressed={params.favoritesOnly}
              onClick={() => params.setFavoritesOnly(!params.favoritesOnly)}
              className={cn(
                "inline-flex h-10 items-center gap-2 rounded-[var(--radius-control)] border px-3.5 text-sm font-medium transition-colors",
                params.favoritesOnly
                  ? "border-transparent bg-brand text-brand-ink"
                  : "border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink",
              )}
            >
              <Heart className={cn("size-4", params.favoritesOnly && "fill-current")} />
              <span className="hidden sm:inline">Favourites</span>
              {hydrated && favorites.length > 0 && (
                <span className="tabular text-xs opacity-70">{favorites.length}</span>
              )}
            </button>

            <SortSelect value={params.sort} onChange={params.setSort} />
          </div>
        </div>
      </div>

      {/* `w-full` matters: this is a flex child, and `mx-auto` alone would collapse
          it to its content width instead of filling the row. */}
      <main id="content" className="mx-auto w-full max-w-[100rem] px-4 pb-24 pt-6 sm:px-6 lg:px-10">
        <div className="mb-5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p aria-live="polite" className="text-sm text-ink-muted">
            {feed.isPending ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="size-3.5 animate-spin" aria-hidden />
                Loading the Pokédex…
              </span>
            ) : (
              <>
                <span className="tabular font-semibold text-ink">
                  {formatCount(feed.totalCount)}
                </span>{" "}
                Pokémon
                {describeFilters(
                  params.types.map((type) => TYPE_META[type].label),
                  params.query,
                )}
              </>
            )}
          </p>

          {(feed.partialSortNote || feed.isHydratingSort) && (
            <p className="text-xs text-ink-faint">
              {feed.isHydratingSort ? "Fetching stats to sort…" : feed.partialSortNote}
            </p>
          )}
        </div>

        {feed.isError ? (
          <ErrorState error={feed.error} onRetry={feed.retry} />
        ) : feed.isPending ? (
          <CardSkeletonGrid count={12} />
        ) : showEmpty ? (
          <EmptyState
            query={params.query}
            favoritesOnly={params.favoritesOnly}
            suggestions={feed.suggestions}
            onSuggestion={params.setQuery}
            onClear={params.clearAll}
          />
        ) : (
          <>
            {autoLoad ? (
              <InfiniteScroll
                dataLength={feed.items.length}
                next={feed.loadMore}
                hasMore={feed.hasMore}
                scrollThreshold={0.85}
                style={{ overflow: "visible" }}
                loader={
                  <p className="py-8 text-center text-sm text-ink-faint">Loading more Pokémon…</p>
                }
              >
                <PokemonGrid
                  items={feed.items}
                  search={params.searchString}
                  activeName={activeName}
                />
              </InfiniteScroll>
            ) : (
              <PokemonGrid
                items={feed.items}
                search={params.searchString}
                activeName={activeName}
              />
            )}

            <LoadMore
              hasMore={feed.hasMore}
              remaining={feed.remaining}
              total={feed.totalCount}
              autoLoad={autoLoad}
              onLoadMore={feed.loadMore}
              onAutoLoadChange={setAutoLoad}
            />
          </>
        )}
      </main>

      <CompareTray />
    </>
  );
}

function describeFilters(typeLabels: string[], query: string): string {
  const parts: string[] = [];
  if (typeLabels.length > 0) parts.push(`of type ${typeLabels.join(" + ")}`);
  if (query) parts.push(`matching “${query}”`);
  return parts.length > 0 ? ` ${parts.join(" ")}` : "";
}
