import { ApiError } from "./errors";

export const POKEAPI_BASE_URL = "https://pokeapi.co/api/v2";

/** Nothing should hang forever on a flaky connection. */
const REQUEST_TIMEOUT_MS = 15_000;

/**
 * The one and only place this app calls `fetch`. Everything else goes through
 * `lib/api/pokemon.ts`, which goes through here — no component, hook or route
 * ever touches the network directly.
 *
 * Using the platform `fetch` rather than a client library is what lets Next
 * deduplicate and cache these requests on the server: two callers asking for the
 * same Pokémon during one render share a single round trip.
 */
export async function apiFetch<T>(endpoint: string, signal?: AbortSignal): Promise<T> {
  const url = endpoint.startsWith("http") ? endpoint : `${POKEAPI_BASE_URL}${endpoint}`;

  // A caller's own abort still has to win, so the timeout is combined with it
  // rather than replacing it.
  const timeout = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  const combined = signal ? AbortSignal.any([signal, timeout]) : timeout;

  let response: Response;
  try {
    response = await fetch(url, {
      signal: combined,
      headers: { Accept: "application/json" },
      // PokéAPI data is effectively immutable; let the platform cache hard.
      cache: "force-cache",
    });
  } catch (cause) {
    // A cancellation is not a failure: TanStack Query recognises an abort and
    // drops the result quietly, whereas an ApiError would surface it as an error.
    if (signal?.aborted) throw cause;
    if (cause instanceof DOMException && cause.name === "TimeoutError") {
      throw new ApiError(0, endpoint, "The request timed out");
    }
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
