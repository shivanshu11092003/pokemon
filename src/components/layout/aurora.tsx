import type { CSSProperties } from "react";
import { cn } from "@/lib/utils/cn";

/**
 * Ambient backdrop — slow, blurred colour fields drifting behind the content.
 * Adapted from the React Bits "Aurora" idea, rebuilt as pure CSS so it costs no
 * JavaScript, composites on the GPU, and stops dead under `prefers-reduced-motion`
 * (handled globally in `globals.css`).
 */
const PLACEMENTS = [
  { className: "-left-24 -top-32 size-[30rem]", duration: "18s", reverse: false },
  { className: "-right-20 -top-24 size-[28rem]", duration: "22s", reverse: true },
  { className: "left-1/3 top-16 size-[26rem]", duration: "26s", reverse: false },
] as const;

interface AuroraProps {
  /** CSS colours, one per blob. Falls back to the house palette. */
  colors?: string[];
  className?: string;
}

const DEFAULT_COLORS = ["var(--type-fire)", "var(--type-water)", "var(--type-electric)"];

export function Aurora({ colors = DEFAULT_COLORS, className }: AuroraProps) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}
    >
      {PLACEMENTS.map((placement, index) => (
        <div
          key={placement.className}
          className={`aurora-blob ${placement.className}`}
          style={
            {
              "--aurora-color": colors[index % colors.length],
              animation: `aurora-drift ${placement.duration} ease-in-out infinite${
                placement.reverse ? " reverse" : ""
              }`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
