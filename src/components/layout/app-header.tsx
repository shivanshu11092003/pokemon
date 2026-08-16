import Link from "next/link";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[100rem] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        <Link
          href="/"
          className="group flex items-center gap-2.5 rounded-lg outline-none"
          aria-label="Pokédex Explorer, home"
        >
          <PokeballMark />
          <span className="text-[15px] font-semibold tracking-tight text-ink">
            Pokédex <span className="text-ink-faint">Explorer</span>
          </span>
        </Link>

        <ThemeToggle />
      </div>
    </header>
  );
}

function PokeballMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-7 transition-transform duration-300 ease-[var(--ease-out-soft)] group-hover:rotate-[18deg]"
      aria-hidden
    >
      <title>Pokéball</title>
      <circle
        cx="12"
        cy="12"
        r="10.5"
        fill="var(--surface)"
        stroke="var(--ink)"
        strokeWidth="1.5"
      />
      <path
        d="M1.5 12h6.2a4.3 4.3 0 0 1 8.6 0h6.2"
        stroke="var(--ink)"
        strokeWidth="1.5"
        fill="none"
      />
      <path d="M1.9 8.6A10.5 10.5 0 0 1 22.1 8.6Z" fill="var(--brand)" />
      <circle cx="12" cy="12" r="2.6" fill="var(--surface)" stroke="var(--ink)" strokeWidth="1.5" />
    </svg>
  );
}
