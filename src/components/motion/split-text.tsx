"use client";

import { motion, useReducedMotion } from "motion/react";
import { useMemo } from "react";

interface SplitTextProps {
  text: string;
  className?: string;
  /** Seconds between each character. Keep it small — this runs on long names. */
  stagger?: number;
  delay?: number;
}

/**
 * Per-character reveal, in the spirit of React Bits' SplitText.
 *
 * The whole string stays in the accessibility tree as one label; the split
 * characters are hidden from it, so a screen reader announces "Charizard" rather
 * than nine separate letters.
 */
export function SplitText({ text, className, stagger = 0.025, delay = 0 }: SplitTextProps) {
  const reducedMotion = useReducedMotion();

  // Keys and delays are baked in here so the render below never has to reach for
  // an array index — position is part of each character's identity, not a
  // rendering accident.
  const characters = useMemo(
    () =>
      [...text].map((character, position) => ({
        character,
        id: `${position}-${character}`,
        delay: delay + position * stagger,
      })),
    [text, delay, stagger],
  );

  if (reducedMotion) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden className="inline-flex flex-wrap">
        {characters.map((entry) => (
          <motion.span
            key={entry.id}
            initial={{ opacity: 0, y: "0.35em" }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: entry.delay, ease: [0.16, 1, 0.3, 1] }}
            className="inline-block whitespace-pre"
          >
            {entry.character}
          </motion.span>
        ))}
      </span>
    </span>
  );
}
