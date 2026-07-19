import { QueryClient } from '@tanstack/react-query';

/**
 * Shared TanStack Query client with sensible defaults.
 *
 * - `staleTime` of 2 min avoids refetching too aggressively.
 * - `gcTime` of 10 min keeps data in cache for fast navigation.
 * - 1 retry on failure with exponential backoff.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
