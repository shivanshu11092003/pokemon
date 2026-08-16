"use client";

import { ChevronDown } from "lucide-react";
import { useCallback, useState } from "react";
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

/**
 * Moves grouped by how they are learned, each group expanding on its own.
 *
 * A single control expanding every group at once meant opening "Egg moves" also
 * dumped a hundred TMs on the page. The "+N more" chip that already sat at the end
 * of a truncated group is the natural place for that group's control, so it is
 * the button rather than a label sitting next to one.
 */
export function MovesSection({ moves }: { moves: PokemonMove[] }) {
  const [expanded, setExpanded] = useState<ReadonlySet<MoveLearnMethod>>(new Set());

  const toggle = useCallback((method: MoveLearnMethod) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (!next.delete(method)) next.add(method);
      return next;
    });
  }, []);

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
        const isExpanded = expanded.has(group.method);
        const visible = isExpanded ? group.moves : group.moves.slice(0, INITIAL_VISIBLE);
        const hidden = group.moves.length - visible.length;
        const label = METHOD_LABELS[group.method];

        return (
          <section key={group.method}>
            <h4 className="mb-2.5 flex items-baseline gap-2 text-xs font-semibold uppercase tracking-wider text-ink-faint">
              {label}
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

              {(hidden > 0 || isExpanded) && (
                <li>
                  <button
                    type="button"
                    onClick={() => toggle(group.method)}
                    aria-expanded={isExpanded}
                    // Names the group it controls, so a screen reader hearing five
                    // of these in a row can tell them apart.
                    aria-label={
                      isExpanded
                        ? `Show fewer moves — ${label}`
                        : `Show ${hidden} more moves — ${label}`
                    }
                    className={cn(
                      "inline-flex items-center gap-1 rounded-lg border border-dashed border-line px-2.5 py-1.5 text-[13px] font-medium text-ink-muted",
                      "transition-colors duration-150 hover:border-line-strong hover:bg-canvas-muted hover:text-ink",
                    )}
                  >
                    <span className="tabular">{isExpanded ? "Show less" : `+${hidden} more`}</span>
                    <ChevronDown
                      aria-hidden
                      className={cn(
                        "size-3.5 transition-transform duration-200",
                        isExpanded && "rotate-180",
                      )}
                    />
                  </button>
                </li>
              )}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
