import { Suspense } from "react";
import { PokemonDetailModal } from "@/components/pokemon/pokemon-detail-modal";

export default async function InterceptedPokemonPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await params;

  return (
    <Suspense fallback={null}>
      <PokemonDetailModal name={decodeURIComponent(name)} />
    </Suspense>
  );
}
