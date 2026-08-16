import type { CSSProperties } from "react";

/**
 * Ambient hero backdrop — three slow, blurred colour fields drifting behind the
 * masthead. Adapted from the React Bits "Aurora" idea, rebuilt as pure CSS so it
 * costs no JavaScript, composites on the GPU, and stops dead under
 * `prefers-reduced-motion` (handled globally in `globals.css`).
 */
const BLOBS: Array<{ color: string; className: string; duration: string; reverse?: boolean }> = [
  {
    color: "var(--type-fire)",
    className: "-left-24 -top-32 size-[26rem]",
    duration: "18s",
  },
  {
    color: "var(--type-water)",
    className: "-right-20 -top-24 size-[24rem]",
    duration: "22s",
    reverse: true,
  },
  {
    color: "var(--type-electric)",
    className: "left-1/2 top-8 size-[22rem] -translate-x-1/2",
    duration: "26s",
  },
];

export function Aurora() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {BLOBS.map((blob) => (
        <div
          key={blob.color}
          className={`aurora-blob ${blob.className}`}
          style={
            {
              "--aurora-color": blob.color,
              animation: `aurora-drift ${blob.duration} ease-in-out infinite${blob.reverse ? " reverse" : ""}`,
            } as CSSProperties
          }
        />
      ))}
      <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-b from-transparent to-canvas" />
    </div>
  );
}
