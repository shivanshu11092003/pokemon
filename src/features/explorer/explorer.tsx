"use client";

import { Heart } from "lucide-react";
import dynamic from "next/dynamic";
import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { SortSelect } from "@/features/filters/sort-select";
import { TypeFilterMenu } from "@/features/filters/type-filter-menu";
import { SearchBar } from "@/features/search/search-bar";
import { useExplorerParams } from "@/hooks/use-explorer-params";
import { useHydrated } from "@/hooks/use-hydrated";
import { usePokemonFeed } from "@/hooks/use-pokemon-feed";
import { TYPE_META } from "@/lib/pokemon/type-meta";
import { cn } from "@/lib/utils/cn";
import { formatCount } from "@/lib/utils/format";
import { useUiStore } from "@/stores/ui-store";
import type { PokemonTypeName } from "@/types/pokemon";
import { GridSkeleton, StageSkeleton } from "./skeletons";
import { ViewToggle } from "./view-toggle";

/*
 * The two browsing modes are mutually exclusive — nobody sees both — so neither
 * belongs in the entry chunk. Splitting them also pulls their heavy dependencies
 * with them: the virtualiser and `react-infinite-scroll-component` now only load
 * for the reader who actually opens the grid.
 *
 * `ssr` stays on so the first paint and the crawler still get real markup.
 */
const StageView = dynamic(() => import("@/features/stage/stage-view").then((m) => m.StageView));

const GridView = dynamic(() => import("./grid-view").then((m) => m.GridView), {
  loading: () => <GridSkeleton />,
});

export function Explorer() {
  const params = useExplorerParams();
  const hydrated = useHydrated();

  const favorites = useUiStore((state) => state.favorites);

  const feed = usePokemonFeed({
    query: params.query,
    types: params.types,
    sort: params.sort,
    favoritesOnly: params.favoritesOnly,
    // Before hydration the persisted list is unknown; treating it as empty keeps
    // server and client markup identical.
    favorites: hydrated ? favorites : [],
  });

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
      <div className="sticky top-16 z-30 bg-canvas/60 backdrop-blur-md">
        <div className="mx-auto max-w-[100rem] px-4 sm:px-6 lg:px-10">
          {/*
            Two rows on mobile, one on desktop. `sm:contents` dissolves each
            grouping wrapper at the breakpoint so its children join the parent
            flex row directly — which is what lets the same markup be
            "search + view / type + sort + favourites" stacked on a phone and a
            single ordered row on a laptop, with no duplicated JSX.
          */}
          <div className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:gap-3 sm:py-3.5">
            {/* Mobile row 1: search, with the two mode controls pinned right. */}
            <div className="flex items-center gap-2 sm:contents">
              <div className="min-w-0 flex-1 sm:order-1 sm:max-w-sm">
                <SearchBar
                  value={params.query}
                  onChange={params.setQuery}
                  search={params.searchString}
                />
              </div>

              <button
                type="button"
                aria-pressed={params.favoritesOnly}
                onClick={() => params.setFavoritesOnly(!params.favoritesOnly)}
                className={cn(
                  "inline-flex h-11 shrink-0 items-center gap-2 rounded-(--radius-control) border border-transparent px-3.5 text-sm font-medium transition-colors duration-200 sm:order-4 sm:ml-auto",
                  // A tinted, outlined "on" state rather than a solid fill: it
                  // matches how an active type reads, and a saturated block of
                  // brand red is far too loud for a toggle sitting in a toolbar.
                  params.favoritesOnly
                    ? "border-brand/35 bg-brand/12 text-brand-accent"
                    : "text-ink-muted hover:bg-canvas-muted hover:text-ink",
                )}
              >
                <Heart className={cn("size-4", params.favoritesOnly && "fill-current")} />
                <span className="hidden sm:inline">Favourites</span>
                {hydrated && favorites.length > 0 && (
                  <span className="tabular text-xs opacity-70">{favorites.length}</span>
                )}
              </button>

              <div className="shrink-0 sm:order-5">
                <ViewToggle value={params.view} onChange={params.setView} />
              </div>
            </div>

            {/* Mobile row 2: the two filters, splitting the width evenly. */}
            <div className="flex items-center gap-2 sm:contents">
              <TypeFilterMenu
                className="min-w-0 flex-1 justify-between sm:order-2 sm:flex-none sm:justify-start"
                selected={params.types}
                onToggle={params.toggleType}
                onClear={params.clearTypes}
              />
              <SortSelect
                className="min-w-0 flex-1 sm:order-3 sm:w-54 sm:flex-none"
                value={params.sort}
                onChange={params.setSort}
              />
            </div>
          </div>
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
          <StageView feed={feed} search={params.searchString} />
        )
      ) : (
        <GridView
          feed={feed}
          search={params.searchString}
          types={params.types}
          query={params.query}
          isEmpty={isEmpty}
          emptyState={emptyState}
        />
      )}

      {/* The spotlight has no visible result count, so screen readers get one. */}
      {params.view === "stage" && (
        <p aria-live="polite" className="sr-only">
          {showResults
            ? `${formatCount(feed.totalCount)} Pokémon${describeFilters(params.types, params.query)}`
            : ""}
        </p>
      )}
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

function describeFilters(types: PokemonTypeName[], query: string): string {
  const parts: string[] = [];
  if (types.length === 1) {
    parts.push(`of type ${TYPE_META[types[0]].label}`);
  } else if (types.length > 1) {
    const labels = types.map((type) => TYPE_META[type].label);
    const shown = labels.slice(0, 2).join(", ");
    parts.push(
      labels.length > 2 ? `of type ${shown} +${labels.length - 2} more` : `of type ${shown}`,
    );
  }
  if (query) parts.push(`matching “${query}”`);
  return parts.length > 0 ? ` ${parts.join(" ")}` : "";
}
