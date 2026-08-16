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
      <div className="px-6 py-8 md:px-10">
        <h2 className="mb-6 text-center text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint">
          Head to head
        </h2>

        <div className="grid grid-cols-2 gap-4">
          <CompareHeader pokemon={left} />
          <CompareHeader pokemon={right} />
        </div>

        <table className="mt-8 w-full border-collapse">
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
                <td className="w-[30%] py-2.5">
                  <StatCell value={row.left} wins={row.left > row.right} align="left" />
                </td>
                <th
                  scope="row"
                  className="py-2.5 text-center text-xs font-medium uppercase tracking-wider text-ink-faint"
                >
                  {row.label}
                </th>
                <td className="w-[30%] py-2.5">
                  <StatCell value={row.right} wins={row.right > row.left} align="right" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ResponsiveModal>
  );
}

function CompareHeader({ pokemon }: { pokemon: Pokemon }) {
  return (
    <div
      style={typeStyle(pokemon.types[0])}
      className="type-wash flex flex-col items-center gap-2 rounded-[var(--radius-card)] border border-line px-4 py-5"
    >
      <PokemonArt id={pokemon.id} name={pokemon.displayName} size={104} className="size-[104px]" />
      <span className="tabular text-xs font-semibold text-ink-faint">
        {formatDexNumber(pokemon.id)}
      </span>
      <h3 className="text-balance text-center text-lg font-semibold text-ink">
        {pokemon.displayName}
      </h3>
      <div className="flex flex-wrap justify-center gap-1.5">
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
        "tabular block text-lg font-semibold",
        align === "left" ? "text-left" : "text-right",
        wins ? "text-brand-accent" : "text-ink-muted",
      )}
    >
      {value}
      {wins && <span className="sr-only"> (higher)</span>}
    </span>
  );
}
