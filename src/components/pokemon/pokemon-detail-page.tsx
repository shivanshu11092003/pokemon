"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { DetailSkeleton } from "@/components/pokemon/detail-skeleton";
import { PokemonDetail } from "@/components/pokemon/pokemon-detail";
import { ErrorState } from "@/components/states/error-state";
import { usePokemonDetail } from "@/hooks/use-pokemon-detail";

/**
 * The `/pokemon/[name]` route every card opens. Server-rendered shell with real
 * metadata, so shared links and crawlers get a complete page.
 */
export function PokemonDetailPage({ name }: { name: string }) {
  const router = useRouter();
  // Card links carry the explorer's whole state (`view`, `q`, `type`, `sort`,
  // `fav`) into this URL, so going back is a matter of handing it straight back
  // rather than dropping the user on a default `/`.
  const search = useSearchParams().toString();
  const backHref = search ? `/?${search}` : "/";

  const { pokemon, isPending, isError, error, neighbours } = usePokemonDetail(name);

  const navigate = useCallback(
    (nextName: string) =>
      // Walking the dex has to preserve it too, or the third Pokémon you look at
      // forgets which view you started from.
      router.push(search ? `/pokemon/${nextName}?${search}` : `/pokemon/${nextName}`),
    [router, search],
  );

  return (
    <main id="content" className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
      <Link
        href={backHref}
        className="mb-4 inline-flex items-center gap-2 rounded-lg text-sm font-medium text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        Back to the Pokédex
      </Link>

      <div className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-canvas shadow-resting">
        {isError ? (
          <div className="p-6">
            <ErrorState error={error} onRetry={() => router.refresh()} />
          </div>
        ) : isPending || !pokemon ? (
          <DetailSkeleton />
        ) : (
          <PokemonDetail pokemon={pokemon} neighbours={neighbours} onNavigate={navigate} />
        )}
      </div>
    </main>
  );
}
