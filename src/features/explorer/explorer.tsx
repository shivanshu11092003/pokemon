"use client";

import { Heart, Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";
import InfiniteScroll from "react-infinite-scroll-component";
import { CardSkeletonGrid } from "@/components/pokemon/card-skeleton";
import { PokemonGrid } from "@/components/pokemon/pokemon-grid";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { CompareTray } from "@/features/compare/compare-tray";
import { SortSelect } from "@/features/filters/sort-select";
import { TypeFilterRail } from "@/features/filters/type-filter-rail";
import { SearchBar } from "@/features/search/search-bar";
import { StageView } from "@/features/stage/stage-view";
import { useExplorerParams } from "@/hooks/use-explorer-params";
import { useHydrated } from "@/hooks/use-hydrated";
import { usePokemonFeed } from "@/hooks/use-pokemon-feed";
import { TYPE_META } from "@/lib/pokemon/type-meta";
import { cn } from "@/lib/utils/cn";
import { formatCount } from "@/lib/utils/format";
import { useUiStore } from "@/stores/ui-store";
import { LoadMore } from "./load-more";
import { ViewToggle } from "./view-toggle";

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

  // Both views stay mounted underneath the detail modal, so the "open" Pokémon is
  // read from the path rather than from state.
  const activeName = pathname.startsWith("/pokemon/")
    ? decodeURIComponent(pathname.split("/")[2] ?? "")
    : null;

  const isEmpty = !feed.isPending && !feed.isError && feed.items.length === 0;
  const showResults = !feed.isPending && !feed.isError && !isEmpty;

  const emptyState = (
    <EmptyState
      query={params.query}
      favoritesOnly={params.favoritesOnly}
      suggestions={feed.suggestions}
      onSuggestion={params.setQuery}
      onClear={params.clearAll}
    />
  );

  return (
    <>
      {/* ---------------------------------------------------------- toolbar */}
      <div className="sticky top-16 z-30 border-b border-line bg-canvas/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[100rem] flex-col gap-3 px-4 py-3 sm:px-6 lg:px-10">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1 sm:max-w-md">
              <SearchBar
                value={params.query}
                onChange={params.setQuery}
                search={params.searchString}
              />
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                aria-pressed={params.favoritesOnly}
                onClick={() => params.setFavoritesOnly(!params.favoritesOnly)}
                className={cn(
                  "inline-flex h-10 items-center gap-2 rounded-(--radius-control) border px-3.5 text-sm font-medium transition-colors",
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
              <ViewToggle value={params.view} onChange={params.setView} />
            </div>
          </div>

          <TypeFilterRail
            selected={params.types}
            onToggle={params.toggleType}
            onClear={params.clearTypes}
          />
        </div>
      </div>

      {/* ------------------------------------------------------------ views */}
      {feed.isError ? (
        <Shell>
          <ErrorState error={feed.error} onRetry={feed.retry} />
        </Shell>
      ) : params.view === "stage" ? (
        feed.isPending ? (
          <StageSkeleton />
        ) : isEmpty ? (
          <Shell>{emptyState}</Shell>
        ) : (
          <StageView feed={feed} search={params.searchString} activeName={activeName} />
        )
      ) : (
        <main
          id="content"
          className="mx-auto w-full max-w-[100rem] px-4 pb-24 pt-6 sm:px-6 lg:px-10"
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
            <>
              {/*
                The wrapper is unconditional — toggling auto-load only flips
                `hasMore`. Swapping the grid in and out of a parent instead would
                remount it, throwing away scroll position and the virtualiser's
                measurements every time the user changed their mind.
              */}
              <InfiniteScroll
                dataLength={feed.items.length}
                next={feed.loadMore}
                hasMore={autoLoad && feed.hasMore}
                scrollThreshold={0.8}
                style={{ overflow: "visible" }}
                loader={<AutoLoadIndicator />}
              >
                <PokemonGrid
                  items={feed.items}
                  search={params.searchString}
                  activeName={activeName}
                />
              </InfiniteScroll>

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
      )}

      {/* The spotlight has no visible result count, so screen readers get one. */}
      {params.view === "stage" && (
        <p aria-live="polite" className="sr-only">
          {showResults
            ? `${formatCount(feed.totalCount)} Pokémon${describeFilters(
                params.types.map((type) => TYPE_META[type].label),
                params.query,
              )}`
            : ""}
        </p>
      )}

      <CompareTray />
    </>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main id="content" className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6">
      {children}
    </main>
  );
}

/** Mirrors the spotlight panel so nothing jumps when the first page lands. */
function StageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[100rem] px-3 pb-6 sm:px-5 lg:px-8">
      <div className="rounded-4xl border border-line bg-canvas-muted/60 px-5 pb-8 pt-10 sm:px-8 sm:pt-12 lg:px-12 lg:pb-12">
        <div className="grid items-end gap-10 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:gap-12">
          <div>
            <div className="-mb-14 flex justify-center sm:-mb-20 lg:justify-start lg:pl-6">
              <div className="shimmer size-[clamp(11rem,24vw,19rem)] rounded-full" />
            </div>
            <div className="shimmer h-64 rounded-[1.75rem]" />
          </div>

          <div className="flex flex-col gap-8 lg:gap-12">
            <div className="grid gap-5 sm:grid-cols-[1.05fr_1fr] sm:gap-8">
              <div className="space-y-3">
                <div className="shimmer h-4 w-24 rounded-full" />
                <div className="shimmer h-20 w-full rounded-2xl" />
              </div>
              <div className="shimmer h-16 rounded-2xl" />
            </div>
            <div className="flex gap-4 pt-11">
              {[0, 1, 2, 3, 4].map((slot) => (
                <div key={slot} className="shimmer h-43 w-37 shrink-0 rounded-card" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AutoLoadIndicator() {
  return (
    <p className="flex items-center justify-center gap-2 py-8 text-sm text-ink-faint">
      <Loader2 className="size-4 animate-spin" aria-hidden />
      Loading more Pokémon…
    </p>
  );
}

function describeFilters(typeLabels: string[], query: string): string {
  const parts: string[] = [];
  if (typeLabels.length > 0) parts.push(`of type ${typeLabels.join(" + ")}`);
  if (query) parts.push(`matching “${query}”`);
  return parts.length > 0 ? ` ${parts.join(" ")}` : "";
}
