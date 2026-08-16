import { CARD_HEIGHT } from "@/components/pokemon/pokemon-card";

/**
 * Dimensionally identical to a real card. Anything else would move the grid the
 * moment data arrives, which is exactly the layout shift we are avoiding.
 */
export function CardSkeleton() {
  return (
    <div
      style={{ height: CARD_HEIGHT }}
      className="flex flex-col items-center justify-end gap-3 rounded-[var(--radius-card)] border border-line bg-surface px-4 pb-5 pt-10"
      aria-hidden
    >
      <div className="shimmer size-[118px] rounded-full" />
      <div className="shimmer h-4 w-24 rounded-full" />
      <div className="flex gap-1.5">
        <span className="shimmer h-[26px] w-16 rounded-full" />
        <span className="shimmer h-[26px] w-14 rounded-full opacity-60" />
      </div>
    </div>
  );
}

export function CardSkeletonGrid({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 min-[540px]:grid-cols-2 min-[860px]:grid-cols-3 min-[1180px]:grid-cols-4 min-[1520px]:grid-cols-5">
      {Array.from({ length: count }, (_, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: placeholders have no identity
        <CardSkeleton key={index} />
      ))}
    </div>
  );
}
