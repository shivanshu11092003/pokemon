"use client";

import { ChevronLeft, ChevronRight, GitCompareArrows, Volume2 } from "lucide-react";
import { useCallback, useEffect } from "react";
import { FavoriteButton } from "@/components/pokemon/favorite-button";
import { MovesSection } from "@/components/pokemon/moves-section";
import { PokemonArt } from "@/components/pokemon/pokemon-art";
import { StatBar } from "@/components/pokemon/stat-bar";
import { TypeChip } from "@/components/pokemon/type-chip";
import { Button } from "@/components/ui/button";
import { useHydrated } from "@/hooks/use-hydrated";
import { typeStyle } from "@/lib/pokemon/type-meta";
import { formatDexNumber, formatHeight, formatWeight } from "@/lib/utils/format";
import { useUiStore } from "@/stores/ui-store";
import type { Pokemon, StatKey } from "@/types/pokemon";

interface PokemonDetailProps {
  pokemon: Pokemon;
  neighbours: { previous: string | null; next: string | null };
  onNavigate: (name: string) => void;
}

export function PokemonDetail({ pokemon, neighbours, onNavigate }: PokemonDetailProps) {
  const hydrated = useHydrated();
  const compare = useUiStore((state) => state.compare);
  const toggleCompare = useUiStore((state) => state.toggleCompare);
  const isComparing = hydrated && compare.includes(pokemon.id);

  const goPrevious = useCallback(() => {
    if (neighbours.previous) onNavigate(neighbours.previous);
  }, [neighbours.previous, onNavigate]);

  const goNext = useCallback(() => {
    if (neighbours.next) onNavigate(neighbours.next);
  }, [neighbours.next, onNavigate]);

  // Arrow keys walk the dex, but never while the user is typing somewhere.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, [contenteditable='true']")) return;
      if (event.key === "ArrowLeft") goPrevious();
      if (event.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goPrevious, goNext]);

  const height = formatHeight(pokemon.height);
  const weight = formatWeight(pokemon.weight);

  const playCry = () => {
    if (!pokemon.cry) return;
    const audio = new Audio(pokemon.cry);
    audio.volume = 0.35;
    void audio.play().catch(() => {});
  };

  return (
    <div style={typeStyle(pokemon.types[0])} className="pb-16">
      {/* ------------------------------------------------------------ hero */}
      <header className="type-wash relative px-6 pb-8 pt-10 md:px-10 md:pt-12">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 md:flex-row md:items-end md:gap-10">
          <div className="grid size-[190px] shrink-0 place-items-center md:size-[224px]">
            <PokemonArt
              id={pokemon.id}
              name={pokemon.displayName}
              size={224}
              priority
              className="size-full drop-shadow-[0_16px_28px_rgba(0,0,0,0.22)]"
            />
          </div>

          <div className="flex min-w-0 flex-1 flex-col items-center gap-3 md:items-start">
            <span className="tabular text-sm font-semibold text-ink-faint">
              {formatDexNumber(pokemon.id)}
            </span>

            <h2 className="text-balance text-center text-4xl font-bold tracking-tight text-ink md:text-left md:text-[2.75rem]">
              {pokemon.displayName}
            </h2>

            <div className="flex flex-wrap justify-center gap-2 md:justify-start">
              {pokemon.types.map((type) => (
                <TypeChip key={type} type={type} size="md" />
              ))}
            </div>

            <div className="mt-2 flex items-center gap-2">
              <FavoriteButton id={pokemon.id} name={pokemon.displayName} size="md" />

              <Button
                variant={isComparing ? "primary" : "secondary"}
                size="sm"
                onClick={() => toggleCompare(pokemon.id)}
                aria-pressed={isComparing}
              >
                <GitCompareArrows />
                {isComparing ? "In comparison" : "Compare"}
              </Button>

              {pokemon.cry && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={playCry}
                  aria-label={`Play ${pokemon.displayName}’s cry`}
                >
                  <Volume2 />
                </Button>
              )}
            </div>
          </div>
        </div>

        <DexNavigation
          onPrevious={goPrevious}
          onNext={goNext}
          hasPrevious={Boolean(neighbours.previous)}
          hasNext={Boolean(neighbours.next)}
        />
      </header>

      {/* ----------------------------------------------------------- facts */}
      <div className="mx-auto max-w-3xl space-y-10 px-6 py-8 md:px-10">
        <section>
          <SectionHeading>Pokédex data</SectionHeading>
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Fact label="Height" value={height.metric} hint={height.imperial} />
            <Fact label="Weight" value={weight.metric} hint={weight.imperial} />
            <Fact
              label="Base EXP"
              value={pokemon.baseExperience === null ? "—" : String(pokemon.baseExperience)}
            />
            <Fact label="Abilities" value={String(pokemon.abilities.length)} />
          </dl>
        </section>

        <section>
          <SectionHeading>Abilities</SectionHeading>
          <ul className="flex flex-wrap gap-2">
            {pokemon.abilities.map((ability) => (
              <li
                key={ability.name}
                className="inline-flex items-center gap-2 rounded-[var(--radius-control)] border border-line bg-surface px-3 py-2 text-sm font-medium text-ink"
              >
                {ability.displayName}
                {ability.isHidden && (
                  <span className="rounded-full bg-canvas-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ink-faint">
                    Hidden
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <SectionHeading
            trailing={
              <span className="tabular text-sm font-semibold text-ink">
                Total {pokemon.statTotal}
              </span>
            }
          >
            Base stats
          </SectionHeading>
          <div className="space-y-2.5">
            {(Object.entries(pokemon.stats) as Array<[StatKey, number]>).map(
              ([key, value], index) => (
                <StatBar key={key} statKey={key} value={value} index={index} />
              ),
            )}
          </div>
        </section>

        <section>
          <SectionHeading>Moves</SectionHeading>
          <MovesSection moves={pokemon.moves} />
        </section>
      </div>
    </div>
  );
}

function SectionHeading({
  children,
  trailing,
}: {
  children: React.ReactNode;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-baseline justify-between gap-4">
      <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint">
        {children}
      </h3>
      {trailing}
    </div>
  );
}

function Fact({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-[var(--radius-control)] border border-line bg-surface px-3.5 py-3">
      <dt className="text-[11px] font-medium uppercase tracking-wider text-ink-faint">{label}</dt>
      <dd className="tabular mt-1 text-lg font-semibold text-ink">{value}</dd>
      {hint && <dd className="tabular text-xs text-ink-faint">{hint}</dd>}
    </div>
  );
}

function DexNavigation({
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
}: {
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-1/2 hidden -translate-y-1/2 justify-between px-3 md:flex">
      <Button
        variant="secondary"
        size="icon"
        className="pointer-events-auto rounded-full"
        onClick={onPrevious}
        disabled={!hasPrevious}
        aria-label="Previous Pokémon"
      >
        <ChevronLeft />
      </Button>
      <Button
        variant="secondary"
        size="icon"
        className="pointer-events-auto rounded-full"
        onClick={onNext}
        disabled={!hasNext}
        aria-label="Next Pokémon"
      >
        <ChevronRight />
      </Button>
    </div>
  );
}
