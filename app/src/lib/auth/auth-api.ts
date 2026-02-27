import type {
  LoginCredentials,
  LoginResponse,
  RegisterCredentials,
  User,
} from "@/types/auth";

import { defaultFetchOptions, getApiUrl } from "../api/api-client";

const authBase = () => `${getApiUrl()}/auth`;

/**
 * Connexion : POST /auth/login.
 * Le refresh token est posé en cookie httpOnly par l'API.
 */
export async function login(
  credentials: LoginCredentials,
): Promise<{ ok: true; data: LoginResponse } | { ok: false; error: string }> {
  const res = await fetch(`${authBase()}/login`, {
    ...defaultFetchOptions,
    method: "POST",
    body: JSON.stringify(credentials),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    return {
      ok: false,
      error: data?.error ?? "Erreur lors de la connexion.",
    };
  }

  return {
    ok: true,
    data: data as LoginResponse,
  };
}

/**
 * Inscription : POST /auth/register.
 * Retourne l'utilisateur créé (sans mot de passe).
 */
export async function register(
  credentials: RegisterCredentials,
): Promise<{ ok: true; data: User } | { ok: false; error: string }> {
  const res = await fetch(`${authBase()}/register`, {
    ...defaultFetchOptions,
    method: "POST",
    body: JSON.stringify(credentials),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    return {
      ok: false,
      error: (data?.error as string) ?? "Erreur lors de l'inscription.",
    };
  }

  return { ok: true, data: data as User };
}

/**
 * Déconnexion : POST /auth/logout (efface le cookie refresh).
 */
export async function logout(): Promise<void> {
  await fetch(`${authBase()}/logout`, {
    ...defaultFetchOptions,
    method: "POST",
  });
}

/**
 * Utilisateur courant : GET /auth/me (requiert Authorization: Bearer accessToken).
 */
export async function getMe(
  accessToken: string,
): Promise<{ ok: true; data: User } | { ok: false; error: string }> {
  const res = await fetch(`${authBase()}/me`, {
    ...defaultFetchOptions,
    method: "GET",
    headers: {
      ...defaultFetchOptions.headers,
      Authorization: `Bearer ${accessToken}`,
    } as HeadersInit,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    return {
      ok: false,
      error: data?.error ?? "Non authentifié.",
    };
  }

  return { ok: true, data: data as User };
}

/**
 * Rafraîchir l'access token via le cookie refresh : POST /auth/refresh.
 */
export async function refresh(): Promise<
  { ok: true; accessToken: string; expiresInSeconds: number } | { ok: false }
> {
  const res = await fetch(`${authBase()}/refresh`, {
    ...defaultFetchOptions,
    method: "POST",
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    return { ok: false };
  }

  return {
    ok: true,
    accessToken: (data as { accessToken: string }).accessToken,
    expiresInSeconds: (data as { expiresInSeconds: number }).expiresInSeconds,
  };
}
