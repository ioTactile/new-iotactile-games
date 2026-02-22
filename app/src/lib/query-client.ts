import { QueryClient } from "@tanstack/react-query";

/** Options par défaut du QueryClient (cache, retry, stale). */
const defaultOptions = {
  queries: {
    staleTime: 60 * 1000, // 1 min
    retry: 1,
    refetchOnWindowFocus: false,
  },
};

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions,
  });
}
