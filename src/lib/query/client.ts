import { QueryClient } from "@tanstack/react-query";
import { isApiError } from "@/lib/api/errors";

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Retrying a 404 is a guaranteed waste of two round trips and delays the
        // "not found" state the user is waiting to see.
        retry: (failureCount, error) => {
          if (isApiError(error) && error.isNotFound) return false;
          return failureCount < 2;
        },
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        staleTime: 1000 * 60 * 5,
      },
    },
  });
}
