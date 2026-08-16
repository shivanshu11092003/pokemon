import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main
      id="content"
      className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 py-24 text-center"
    >
      <p className="tabular text-6xl font-bold tracking-tight text-ink-faint">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-ink">
        Pokémon not found. Try searching for another Pokémon.
      </h1>
      <p className="mt-3 text-sm text-ink-muted">
        Nothing in the National Pokédex matches that name or number.
      </p>
      <Button asChild variant="primary" size="md" className="mt-8">
        <Link href="/">Back to the Pokédex</Link>
      </Button>
    </main>
  );
}
