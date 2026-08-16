"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { DetailSkeleton } from "@/components/pokemon/detail-skeleton";
import { PokemonDetail } from "@/components/pokemon/pokemon-detail";
import { ErrorState } from "@/components/states/error-state";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { usePokemonDetail } from "@/hooks/use-pokemon-detail";
import { toDisplayName } from "@/lib/utils/format";

/**
 * The intercepted `/pokemon/[name]` route. The grid stays mounted behind it, so
 * closing returns to the exact scroll position and the artwork can animate between
 * the card and the panel.
 */
export function PokemonDetailModal({ name }: { name: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.toString();

  const { pokemon, isPending, isError, error, neighbours } = usePokemonDetail(name);

  const navigate = useCallback(
    (nextName: string) => {
      // `replace`, not `push` — walking the dex shouldn't stack twenty history
      // entries between the user and the grid.
      router.replace(search ? `/pokemon/${nextName}?${search}` : `/pokemon/${nextName}`, {
        scroll: false,
      });
    },
    [router, search],
  );

  return (
    <ResponsiveModal
      title={pokemon?.displayName ?? toDisplayName(name)}
      onClosed={() => router.back()}
    >
      {isError ? (
        <div className="p-6">
          <ErrorState error={error} onRetry={() => router.back()} />
        </div>
      ) : isPending || !pokemon ? (
        <DetailSkeleton />
      ) : (
        <PokemonDetail pokemon={pokemon} neighbours={neighbours} onNavigate={navigate} />
      )}
    </ResponsiveModal>
  );
}
