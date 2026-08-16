import { Skeleton } from "@/components/ui/skeleton";

/** Mirrors the detail layout so the panel never resizes when data lands. */
export function DetailSkeleton() {
  return (
    <div aria-busy className="pb-10">
      <div className="bg-canvas-muted px-6 pb-8 pt-10 md:px-10 md:pt-12">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 md:flex-row md:items-end md:gap-10">
          <Skeleton className="size-[190px] shrink-0 rounded-full md:size-[224px]" />
          <div className="flex w-full flex-col items-center gap-3 md:items-start">
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-10 w-52" />
            <div className="flex gap-2">
              <Skeleton className="h-7 w-24 rounded-full" />
              <Skeleton className="h-7 w-20 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl space-y-8 px-6 py-8 md:px-10">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {["height", "weight", "exp", "abilities"].map((key) => (
            <Skeleton key={key} className="h-[4.5rem] rounded-[var(--radius-control)]" />
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
