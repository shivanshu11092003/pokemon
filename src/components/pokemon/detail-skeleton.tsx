import { Skeleton } from "@/components/ui/skeleton";

/** Mirrors the detail layout so the panel never resizes when data lands. */
export function DetailSkeleton() {
  return (
    <div aria-busy className="w-full min-w-0 overflow-hidden pb-10">
      <div className="bg-canvas-muted px-6 pb-8 pt-10 md:px-10 md:pt-12">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 md:flex-row md:items-end md:gap-10">
          <Skeleton className="size-47.5 max-w-full shrink-0 rounded-full md:size-56" />
          <div className="flex w-full min-w-0 flex-col items-center gap-3 md:items-start">
            <Skeleton className="h-4 w-14 max-w-full" />
            <Skeleton className="h-10 w-52 max-w-full" />
            <div className="flex max-w-full flex-wrap gap-2">
              <Skeleton className="h-7 w-24 rounded-full" />
              <Skeleton className="h-7 w-20 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-8 px-6 py-8 md:px-10">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {["height", "weight", "exp", "abilities"].map((key) => (
            <Skeleton key={key} className="h-18 rounded-(--radius-control)" />
          ))}
        </div>
        <div className="space-y-2.5">
          {["hp", "atk", "def", "spa", "spd", "spe"].map((key) => (
            <Skeleton key={key} className="h-4 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
