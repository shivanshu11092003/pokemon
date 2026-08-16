import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PokemonDetailPage } from "@/components/pokemon/pokemon-detail-page";
import { isApiError } from "@/lib/api/errors";
import { fetchPokemon } from "@/lib/api/pokemon";
import { TYPE_META } from "@/lib/pokemon/type-meta";
import { formatDexNumber, formatHeight, formatWeight, toDisplayName } from "@/lib/utils/format";
import { officialArtworkUrl } from "@/lib/utils/sprites";

interface PageProps {
  params: Promise<{ name: string }>;
}

/**
 * Rendered on the server so a shared link previews properly and crawlers get a
 * real title and description rather than an empty client shell.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { name } = await params;

  try {
    const pokemon = await fetchPokemon(decodeURIComponent(name));
    const types = pokemon.types.map((type) => TYPE_META[type].label).join(" / ");
    const article = /^[aeiou]/i.test(types) ? "an" : "a";

    return {
      title: `${pokemon.displayName} ${formatDexNumber(pokemon.id)}`,
      description: `${pokemon.displayName} is ${article} ${types} type Pokémon, ${formatHeight(pokemon.height).metric} tall and ${formatWeight(pokemon.weight).metric}, with a base stat total of ${pokemon.statTotal}.`,
      openGraph: {
        title: `${pokemon.displayName} · Pokédex Explorer`,
        images: [{ url: officialArtworkUrl(pokemon.id), width: 475, height: 475 }],
      },
    };
  } catch {
    return { title: toDisplayName(decodeURIComponent(name)) };
  }
}

export default async function PokemonPage({ params }: PageProps) {
  const { name } = await params;
  const decoded = decodeURIComponent(name);

  // Resolve on the server purely to turn a bad slug into a real 404 instead of a
  // client-side error state.
  try {
    await fetchPokemon(decoded);
  } catch (error) {
    if (isApiError(error) && error.isNotFound) notFound();
  }

  return <PokemonDetailPage name={decoded} />;
}
