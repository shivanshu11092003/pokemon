"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import type { MoveLearnMethod, PokemonMove } from "@/types/pokemon";

const INITIAL_VISIBLE = 12;

const METHOD_LABELS: Record<MoveLearnMethod, string> = {
  "level-up": "By level up",
  machine: "TM / HM",
  egg: "Egg move",
  tutor: "Move tutor",
  other: "Other",
};

const METHOD_ORDER: MoveLearnMethod[] = ["level-up", "machine", "egg", "tutor", "other"];

export function MovesSection({ moves }: { moves: PokemonMove[] }) {
  const [expanded, setExpanded] = useState(false);

  if (moves.length === 0) {
    return <p className="text-sm text-ink-muted">No move data available.</p>;
  }

  const grouped = METHOD_ORDER.map((method) => ({
    method,
    moves: moves.filter((move) => move.method === method),
  })).filter((group) => group.moves.length > 0);

  return (
    <div className="space-y-5">
      {grouped.map((group) => {
        const visible = expanded ? group.moves : group.moves.slice(0, INITIAL_VISIBLE);
        const hidden = group.moves.length - visible.length;

        return (
          <section key={group.method}>
            <h4 className="mb-2.5 flex items-baseline gap-2 text-xs font-semibold uppercase tracking-wider text-ink-faint">
              {METHOD_LABELS[group.method]}
              <span className="tabular font-normal normal-case tracking-normal">
                {group.moves.length}
              </span>
            </h4>

            <ul className="flex flex-wrap gap-1.5">
              {visible.map((move) => (
                <li
                  key={move.name}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[13px] text-ink"
                >
                  {move.displayName}
                  {group.method === "level-up" && move.level > 0 && (
                    <span className="tabular text-[11px] text-ink-faint">Lv {move.level}</span>
                  )}
                </li>
              ))}
              {hidden > 0 && (
                <li className="tabular inline-flex items-center rounded-lg border border-dashed border-line px-2.5 py-1.5 text-[13px] text-ink-faint">
                  +{hidden} more
                </li>
              )}
            </ul>
          </section>
        );
      })}

      {moves.length > INITIAL_VISIBLE && (
        <Button variant="ghost" size="sm" onClick={() => setExpanded((value) => !value)}>
          {expanded ? "Show fewer moves" : `Show all ${moves.length} moves`}
          <ChevronDown className={cn("transition-transform", expanded && "rotate-180")} />
        </Button>
      )}
    </div>
  );
}
