"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { DetailSkeleton } from "@/components/pokemon/detail-skeleton";
import { PokemonDetail } from "@/components/pokemon/pokemon-detail";
import { ErrorState } from "@/components/states/error-state";
import { usePokemonDetail } from "@/hooks/use-pokemon-detail";

/**
 * The standalone `/pokemon/[name]` view — what a shared link, a refresh or a
 * search-engine crawler gets. Same detail component as the modal, different chrome.
 */
export function PokemonDetailPage({ name }: { name: string }) {
  const router = useRouter();
  const { pokemon, isPending, isError, error, neighbours } = usePokemonDetail(name);

  const navigate = useCallback((nextName: string) => router.push(`/pokemon/${nextName}`), [router]);

  return (
    <main id="content" className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6">
      <Link
        href="/"
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
          <PokemonDetail
            pokemon={pokemon}
            neighbours={neighbours}
            onNavigate={navigate}
            variant="page"
          />
        )}
      </div>
    </main>
  );
}
