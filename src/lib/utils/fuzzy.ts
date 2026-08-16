/**
 * Tiny scoring matcher used for the typeahead and for "did you mean…" suggestions.
 * Runs against the cached name index, so search never costs a request per keystroke.
 */

/** Higher is better. `null` means "no match at all". */
export function scoreMatch(candidate: string, query: string): number | null {
  if (!query) return 0;
  const haystack = candidate.toLowerCase();
  const needle = query.toLowerCase();

  if (haystack === needle) return 1000;
  if (haystack.startsWith(needle)) return 800 - haystack.length;
  const containsAt = haystack.indexOf(needle);
  if (containsAt !== -1) return 600 - containsAt * 4 - haystack.length;

  // Subsequence fallback: "chrzd" still finds "charizard".
  let cursor = 0;
  let gaps = 0;
  for (const char of needle) {
    const found = haystack.indexOf(char, cursor);
    if (found === -1) return null;
    gaps += found - cursor;
    cursor = found + 1;
  }
  return 300 - gaps * 2 - haystack.length;
}

/** Levenshtein distance, capped for cheapness — only used on search misses. */
export function editDistance(a: string, b: string): number {
  const rows = a.length + 1;
  const cols = b.length + 1;
  let previous = Array.from({ length: cols }, (_, i) => i);

  for (let i = 1; i < rows; i += 1) {
    const current = [i];
    for (let j = 1; j < cols; j += 1) {
      const substitution = (previous[j - 1] ?? 0) + (a[i - 1] === b[j - 1] ? 0 : 1);
      const insertion = (current[j - 1] ?? 0) + 1;
      const deletion = (previous[j] ?? 0) + 1;
      current[j] = Math.min(substitution, insertion, deletion);
    }
    previous = current;
  }
  return previous[cols - 1] ?? Number.POSITIVE_INFINITY;
}
