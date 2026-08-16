import { Suspense } from "react";
import { Explorer } from "@/features/explorer/explorer";
import { GridSkeleton, StageSkeleton } from "@/features/explorer/skeletons";

interface HomePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  // `useSearchParams` inside Explorer opts that subtree into client rendering, so
  // this boundary is what the visitor actually sees first. Reading `view` here
  // means the placeholder matches the mode being loaded — showing a grid of card
  // skeletons and then resolving into the spotlight was a jarring bait and switch.
  const { view } = await searchParams;

  return (
    <Suspense fallback={view === "grid" ? <GridSkeleton /> : <StageSkeleton />}>
      <Explorer />
    </Suspense>
  );
}
