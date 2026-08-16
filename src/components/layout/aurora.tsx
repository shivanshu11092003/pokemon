/**
 * Ambient hero backdrop — three slow, blurred colour fields drifting behind the
 * masthead. Adapted from the React Bits "Aurora" idea, rebuilt as pure CSS so it
 * costs no JavaScript, composites on the GPU, and stops dead under
 * `prefers-reduced-motion` (handled globally in `globals.css`).
 */
export function Aurora() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -left-24 -top-32 size-[26rem] rounded-full bg-[var(--type-fire)] opacity-[0.14] blur-[90px] [animation:aurora-drift_18s_ease-in-out_infinite] dark:opacity-[0.20]" />
      <div className="absolute -right-20 -top-24 size-[24rem] rounded-full bg-[var(--type-water)] opacity-[0.16] blur-[90px] [animation:aurora-drift_22s_ease-in-out_infinite_reverse] dark:opacity-[0.22]" />
      <div className="absolute left-1/2 top-8 size-[22rem] -translate-x-1/2 rounded-full bg-[var(--type-electric)] opacity-[0.10] blur-[100px] [animation:aurora-drift_26s_ease-in-out_infinite] dark:opacity-[0.14]" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-[var(--canvas)]" />
    </div>
  );
}
