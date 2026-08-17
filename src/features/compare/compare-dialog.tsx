"use client";

import { PokemonArt } from "@/components/pokemon/pokemon-art";
import { TypeChip } from "@/components/pokemon/type-chip";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { typeStyle } from "@/lib/pokemon/type-meta";
import { cn } from "@/lib/utils/cn";
import { formatDexNumber, formatStatLabel } from "@/lib/utils/format";
import { type Pokemon, STAT_KEYS } from "@/types/pokemon";

interface CompareDialogProps {
  pokemon: [Pokemon, Pokemon] | Pokemon[];
  onClose: () => void;
}

export function CompareDialog({ pokemon, onClose }: CompareDialogProps) {
  const [left, right] = pokemon;
  if (!left || !right) return null;

  const rows = [
    ...STAT_KEYS.map((key) => ({
      label: formatStatLabel(key),
      left: left.stats[key],
      right: right.stats[key],
    })),
    { label: "Total", left: left.statTotal, right: right.statTotal },
  ];

  return (
    <ResponsiveModal
      title={`${left.displayName} compared with ${right.displayName}`}
      onClosed={onClose}
    >
      <div className="px-3.5 py-5 sm:px-6 md:px-10 md:py-8">
        <h2 className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint sm:mb-6">
          Head to head
        </h2>

        <div className="relative grid grid-cols-2 gap-2 sm:gap-4">
          <CompareHeader pokemon={left} />
          <div className="pointer-events-none absolute inset-0 m-auto flex size-7 items-center justify-center rounded-full border border-line bg-surface text-[10px] font-black tracking-wider text-brand-accent shadow-md z-10 uppercase sm:size-8 sm:text-xs">
            VS
          </div>
          <CompareHeader pokemon={right} />
        </div>

        <div className="mt-5 overflow-x-auto sm:mt-8">
          <table className="w-full border-collapse">
            <caption className="sr-only">
              Base stat comparison between {left.displayName} and {right.displayName}
            </caption>
            <thead className="sr-only">
              <tr>
                <th scope="col">{left.displayName}</th>
                <th scope="col">Stat</th>
                <th scope="col">{right.displayName}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-t border-line">
                  <td className="w-[30%] py-2 sm:py-2.5">
                    <StatCell value={row.left} wins={row.left > row.right} align="left" />
                  </td>
                  <th
                    scope="row"
                    className="py-2 text-center text-[11px] font-medium uppercase tracking-wider text-ink-faint sm:text-xs"
                  >
                    {row.label}
                  </th>
                  <td className="w-[30%] py-2 sm:py-2.5">
                    <StatCell value={row.right} wins={row.right > row.left} align="right" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ResponsiveModal>
  );
}

function CompareHeader({ pokemon }: { pokemon: Pokemon }) {
  return (
    <div
      style={typeStyle(pokemon.types[0])}
      className="type-wash flex flex-col items-center gap-1.5 rounded-card border border-line px-2 py-3.5 sm:gap-2 sm:px-4 sm:py-5"
    >
      <PokemonArt
        id={pokemon.id}
        name={pokemon.displayName}
        size={96}
        className="size-16 sm:size-26"
      />
      <span className="tabular text-[11px] font-semibold text-ink-faint sm:text-xs">
        {formatDexNumber(pokemon.id)}
      </span>
      <h3 className="text-balance text-center text-sm font-semibold text-ink sm:text-lg">
        {pokemon.displayName}
      </h3>
      <div className="flex flex-wrap justify-center gap-1 sm:gap-1.5">
        {pokemon.types.map((type) => (
          <TypeChip key={type} type={type} />
        ))}
      </div>
    </div>
  );
}

function StatCell({
  value,
  wins,
  align,
}: {
  value: number;
  wins: boolean;
  align: "left" | "right";
}) {
  return (
    <span
      className={cn(
        "tabular block text-base font-semibold sm:text-lg",
        align === "left" ? "text-left" : "text-right",
        wins ? "text-brand-accent" : "text-ink-muted",
      )}
    >
      {value}
      {wins && <span className="sr-only"> (higher)</span>}
    </span>
  );
}
