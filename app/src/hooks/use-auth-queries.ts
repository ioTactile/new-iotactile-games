"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as authApi from "@/lib/auth-api";
import { queryKeys } from "@/lib/query-keys";
import type { User } from "@/types/auth";

/**
 * Session : appelle POST /auth/refresh (cookie) et met en cache l'accessToken.
 * Une seule source de vérité pour "ai-je un token ?" — remplace le store.
 */
export function useSession() {
  return useQuery({
    queryKey: queryKeys.auth.session(),
    queryFn: async (): Promise<string | null> => {
      const result = await authApi.refresh();
      return result.ok ? result.accessToken : null;
    },
    staleTime: Infinity,
    retry: false,
  });
}

/**
 * Récupère l'utilisateur courant (GET /auth/me) avec cache TanStack Query.
 * Le token est lu depuis le cache session dans la queryFn — clé stable sans accessToken.
 * Passer l'accessToken (useSession().data) pour enabled.
 */
export function useMe(accessToken: string | null) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: async (): Promise<User> => {
      const token = queryClient.getQueryData<string | null>(
        queryKeys.auth.session(),
      );
      if (!token) throw new Error("No token");
      const result = await authApi.getMe(token);
      if (!result.ok) throw new Error(result.error);
      return result.data;
    },
    enabled: Boolean(accessToken),
  });
}

/**
 * Mutation de connexion (POST /auth/login).
 * En cas de succès : met à jour le cache session + me (plus de store).
 */
export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: { email: string; password: string }) =>
      authApi.login(credentials),
    onSuccess: async (result) => {
      if (!result.ok) return;
      const { accessToken } = result.data;
      queryClient.setQueryData(queryKeys.auth.session(), accessToken);

      const meResult = await authApi.getMe(accessToken);
      if (meResult.ok) {
        queryClient.setQueryData(queryKeys.auth.me(), meResult.data);
      }
    },
  });
}

/**
 * Mutation d'inscription (POST /auth/register).
 * En cas de succès, invalide le cache auth (optionnel, pour cohérence).
 */
export function useRegisterMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: {
      email: string;
      password: string;
      username: string;
      role?: "ADMIN" | "USER";
    }) => authApi.register(credentials),
    onSuccess: (result) => {
      if (result.ok) {
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
      }
    },
  });
}

/**
 * Mutation de déconnexion (POST /auth/logout).
 * Met le cache session + me à null immédiatement pour afficher la page login sans attendre.
 */
export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.auth.session(), null);
      queryClient.setQueryData(queryKeys.auth.me(), null);
    },
  });
}
