import { Suspense } from "react";
import { CardSkeletonGrid } from "@/components/pokemon/card-skeleton";
import { Explorer } from "@/features/explorer/explorer";

export default function HomePage() {
  return (
    // `useSearchParams` inside Explorer opts this subtree into client rendering;
    // the boundary keeps the shell static and streams the grid in.
    <Suspense
      fallback={
        <div className="mx-auto max-w-[100rem] px-4 py-16 sm:px-6 lg:px-10">
          <CardSkeletonGrid count={12} />
        </div>
      }
    >
      <Explorer />
    </Suspense>
  );
}
