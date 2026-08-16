import { CardSkeletonGrid } from "@/components/pokemon/card-skeleton";

/**
 * One skeleton per browsing mode, kept dimensionally in step with the real thing.
 *
 * They live here rather than inside their views because the `Suspense` fallback in
 * `app/page.tsx` has to choose between them on the server, before any client code
 * — including the view itself — has loaded.
 */

/** Mirrors the spotlight panel so nothing jumps when the first page lands. */
export function StageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[100rem] px-3 py-4 sm:px-5 sm:py-5 lg:px-8 lg:py-8">
      <div className="rounded-4xl border border-line bg-canvas-muted/60 px-5 pb-8 pt-8 sm:px-8 sm:pt-10 lg:px-12 lg:pb-10">
        <div className="grid items-stretch gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-12">
          <div className="flex flex-col justify-end">
            <div className="-mb-12 flex justify-center sm:-mb-16">
              <div className="shimmer size-[clamp(9.5rem,20vw,16rem)] rounded-full" />
            </div>
            <div className="shimmer h-72 rounded-[1.75rem]" />
          </div>

          <div className="flex flex-col justify-between gap-8 lg:gap-12">
            <div className="grid gap-5 sm:grid-cols-[1.05fr_1fr] sm:gap-8">
              <div className="space-y-3">
                <div className="shimmer h-4 w-24 rounded-full" />
                <div className="shimmer h-20 w-full rounded-2xl" />
              </div>
              <div className="shimmer h-16 rounded-2xl" />
            </div>

            <div>
              <div className="shimmer mb-2 h-3 w-28 rounded-full" />
              <div className="flex gap-4 overflow-hidden pt-11">
                {[0, 1, 2, 3, 4].map((slot) => (
                  <div key={slot} className="shimmer h-43 w-37 shrink-0 rounded-card" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Mirrors the grid view: results line, then a page of cards. */
export function GridSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[100rem] px-4 pb-24 pt-6 sm:px-6 sm:pt-7 lg:px-10 lg:pt-9">
      <div className="mb-5 shimmer h-4 w-40 rounded-full" />
      <CardSkeletonGrid count={12} />
    </div>
  );
}
