import Link from "next/link";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 bg-canvas/60 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[100rem] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        <Link
          href="/"
          className="group flex items-center gap-3 rounded-xl outline-none"
          aria-label="Pokédex Explorer, home"
        >
          <PokeballMark />

          <span className="flex flex-col leading-none">
            {/*
              The logo treatment: Hollow supplies the outline, Solid the fill,
              stacked in the franchise's yellow-on-blue. Both colours are fixed
              brand values, so the wordmark reads identically in either theme.
            */}
            <span className="relative font-logo text-[19px] tracking-[0.02em]">
              <span aria-hidden className="font-logo-outline absolute inset-0 text-[#2a75bb]">
                Pokédex
              </span>
              <span className="relative text-[#ffcb05]">Pokédex</span>
            </span>
            <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.24em] text-ink-faint">
              Explorer
            </span>
          </span>
        </Link>

        <ThemeToggle />
      </div>
    </header>
  );
}

/**
 * Hand-drawn rather than an emoji or a flat circle: the specular highlight and
 * the shadow under the band are what make it read as an object with a surface.
 */
function PokeballMark() {
  return (
    <span className="raised grid size-10 shrink-0 place-items-center rounded-[0.9rem] bg-surface transition-transform duration-300 ease-[var(--ease-out-soft)] group-hover:-rotate-6">
      <svg viewBox="0 0 32 32" className="size-7" aria-hidden>
        <title>Pokéball</title>
        <defs>
          <linearGradient id="pokeball-top" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="oklch(0.68 0.2 26)" />
            <stop offset="100%" stopColor="oklch(0.52 0.21 26)" />
          </linearGradient>
          <linearGradient id="pokeball-bottom" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--surface-raised)" />
            <stop offset="100%" stopColor="var(--canvas-muted)" />
          </linearGradient>
        </defs>

        <circle cx="16" cy="16" r="14" fill="url(#pokeball-bottom)" />
        <path d="M2 16a14 14 0 0 1 28 0Z" fill="url(#pokeball-top)" />
        <rect x="2" y="14.6" width="28" height="2.8" fill="var(--ink)" opacity="0.85" />
        <circle cx="16" cy="16" r="5.4" fill="var(--ink)" opacity="0.85" />
        <circle cx="16" cy="16" r="3.9" fill="var(--surface)" />
        <circle cx="16" cy="16" r="1.9" fill="var(--line-strong)" />
        {/* Specular highlight. */}
        <ellipse cx="11" cy="8.5" rx="4.2" ry="2.6" fill="white" opacity="0.28" />
        <circle
          cx="16"
          cy="16"
          r="14"
          fill="none"
          stroke="var(--ink)"
          strokeOpacity="0.22"
          strokeWidth="1.2"
        />
      </svg>
    </span>
  );
}
