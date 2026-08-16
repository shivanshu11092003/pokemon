import { ApiError } from "./errors";

export const POKEAPI_BASE_URL = "https://pokeapi.co/api/v2";

/**
 * The one and only place this app calls `fetch`. Everything else goes through
 * `lib/api/pokemon.ts`, which goes through here.
 */
export async function apiFetch<T>(endpoint: string, signal?: AbortSignal): Promise<T> {
  const url = endpoint.startsWith("http") ? endpoint : `${POKEAPI_BASE_URL}${endpoint}`;

  let response: Response;
  try {
    response = await fetch(url, {
      signal,
      headers: { Accept: "application/json" },
      // PokéAPI data is effectively immutable; let the platform cache hard.
      cache: "force-cache",
    });
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === "AbortError") throw cause;
    throw new ApiError(0, endpoint, "Network request failed");
  }

  if (!response.ok) {
    throw new ApiError(response.status, endpoint);
  }

  return (await response.json()) as T;
}

/**
 * Bounded-concurrency map. Used when we need many detail records at once
 * (stat sorting, comparison) without firing hundreds of parallel requests.
 */
export async function mapWithConcurrency<In, Out>(
  items: readonly In[],
  limit: number,
  worker: (item: In, index: number) => Promise<Out>,
): Promise<Out[]> {
  const results = Array.from({ length: items.length }) as Out[];
  let cursor = 0;

  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      // Sequential *within* a runner is the whole point: `limit` runners drain the
      // queue in parallel, which is what bounds the in-flight request count.
      // oxlint-disable-next-line no-await-in-loop
      results[index] = await worker(items[index] as In, index);
    }
  });

  await Promise.all(runners);
  return results;
}
