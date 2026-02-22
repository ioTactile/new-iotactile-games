"use client";

import { useSession } from "@/hooks/use-auth-queries";

/**
 * Déclenche la query session au montage (POST /auth/refresh avec le cookie).
 * Le token est mis en cache React Query ; plus de store.
 * À placer dans le layout racine.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  useSession();

  return <>{children}</>;
}
