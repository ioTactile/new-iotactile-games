/**
 * Clés de requête TanStack Query pour invalidation et cache.
 * Une clé par "ressource" ou route API.
 */
export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    /** Session = accessToken (via POST /auth/refresh avec cookie). */
    session: () => [...queryKeys.auth.all, "session"] as const,
    me: () => [...queryKeys.auth.all, "me"] as const,
  },
  dice: {
    all: ["dice"] as const,
    session: (sessionId: string) =>
      [...queryKeys.dice.all, "session", sessionId] as const,
  },
} as const;
