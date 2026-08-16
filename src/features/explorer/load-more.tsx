"use client";

import { ArrowDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PAGE_SIZE } from "@/hooks/use-pokemon-feed";
import { cn } from "@/lib/utils/cn";
import { formatCount } from "@/lib/utils/format";

interface LoadMoreProps {
  hasMore: boolean;
  remaining: number;
  total: number;
  autoLoad: boolean;
  onLoadMore: () => void;
  onAutoLoadChange: (value: boolean) => void;
}

/**
 * Infinite scroll is the default. The manual button is kept as an opt-out —
 * some people want to control when a thousand more cards arrive, and a page
 * that never stops growing is hostile to anyone trying to reach the footer.
 */
export function LoadMore({
  hasMore,
  remaining,
  total,
  autoLoad,
  onLoadMore,
  onAutoLoadChange,
}: LoadMoreProps) {
  const nextBatch = Math.min(PAGE_SIZE, remaining);

  return (
    <div className="flex flex-col items-center gap-4 py-10">
      {!hasMore && (
        <p className="text-sm text-ink-faint">That’s all {formatCount(total)} Pokémon.</p>
      )}

      {hasMore && !autoLoad && (
        <Button variant="primary" size="lg" onClick={onLoadMore} className="min-w-60">
          Load {nextBatch} more
          <span className="text-brand-ink/70">·</span>
          <span className="tabular font-normal">{formatCount(remaining)} left</span>
          <ArrowDown />
        </Button>
      )}

      <button
        type="button"
        role="switch"
        aria-checked={autoLoad}
        onClick={() => onAutoLoadChange(!autoLoad)}
        className="inline-flex items-center gap-2 text-[13px] font-medium text-ink-muted transition-colors hover:text-ink"
      >
        <span
          className={cn(
            "grid size-4 place-items-center rounded-[5px] border transition-colors",
            autoLoad ? "border-transparent bg-brand text-brand-ink" : "border-line-strong",
          )}
        >
          {autoLoad && <Check className="size-3" strokeWidth={3} />}
        </span>
        Keep loading as I scroll
      </button>
    </div>
  );
}
