"use client";

import { motion, useReducedMotion } from "motion/react";
import { formatStatLabel } from "@/lib/utils/format";

/** The highest base stat in the games (Blissey's HP) — the scale every bar shares. */
export const MAX_BASE_STAT = 255;

interface StatBarProps {
  statKey: string;
  value: number;
  index: number;
}

export function StatBar({ statKey, value, index }: StatBarProps) {
  const reducedMotion = useReducedMotion();
  const percentage = Math.min((value / MAX_BASE_STAT) * 100, 100);

  return (
    <div className="grid grid-cols-[5.5rem_1fr_2.5rem] items-center gap-3">
      <span className="text-xs font-medium text-ink-muted">{formatStatLabel(statKey)}</span>

      {/* biome-ignore lint/a11y/useSemanticElements: <meter> cannot be styled consistently across engines */}
      <div
        className="h-2 overflow-hidden rounded-full bg-canvas-muted"
        role="meter"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={MAX_BASE_STAT}
        aria-label={formatStatLabel(statKey)}
      >
        <motion.div
          className="stat-bar-fill h-full rounded-full"
          initial={reducedMotion ? false : { width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.55, delay: 0.06 + index * 0.04, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>

      <span className="tabular text-right text-sm font-semibold text-ink">{value}</span>
    </div>
  );
}
