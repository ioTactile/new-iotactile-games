import type {
  DiceSessionDto,
  DiceSessionViewDto,
} from "@/types/dice";
import { getApiUrl, defaultFetchOptions } from "./api-client";

const diceBase = () => `${getApiUrl()}/dice`;

function authHeaders(accessToken: string | null): HeadersInit {
  const headers: Record<string, string> = {
    ...(defaultFetchOptions.headers as Record<string, string>),
  };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  return headers;
}

export interface CreateSessionParams {
  name: string;
  displayName?: string;
  guestId?: string | null;
  accessToken?: string | null;
}

export async function createDiceSession(
  params: CreateSessionParams,
): Promise<
  | { ok: true; data: DiceSessionDto }
  | { ok: false; error: string; details?: Record<string, unknown> }
> {
  const body: { name: string; displayName?: string; guestId?: string } = {
    name: params.name,
  };
  if (params.displayName?.trim()) body.displayName = params.displayName.trim();
  if (params.guestId) body.guestId = params.guestId;

  const res = await fetch(`${diceBase()}/sessions`, {
    ...defaultFetchOptions,
    method: "POST",
    headers: authHeaders(params.accessToken ?? null),
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    return {
      ok: false,
      error: (data?.error as string) ?? "Erreur lors de la création.",
      details: data?.details as Record<string, unknown> | undefined,
    };
  }
  return { ok: true, data: data as DiceSessionDto };
}

export interface JoinSessionParams {
  sessionId: string;
  displayName?: string;
  guestId?: string | null;
  accessToken?: string | null;
}

export async function joinDiceSession(
  params: JoinSessionParams,
): Promise<
  | { ok: true }
  | { ok: false; error: string; details?: Record<string, unknown> }
> {
  const body: { displayName?: string; guestId?: string } = {};
  if (params.displayName?.trim()) body.displayName = params.displayName.trim();
  if (params.guestId) body.guestId = params.guestId;

  const res = await fetch(`${diceBase()}/sessions/${params.sessionId}/join`, {
    ...defaultFetchOptions,
    method: "POST",
    headers: authHeaders(params.accessToken ?? null),
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    return {
      ok: false,
      error: (data?.error as string) ?? "Erreur lors de la connexion.",
      details: data?.details as Record<string, unknown> | undefined,
    };
  }
  return { ok: true };
}

export interface LeaveSessionParams {
  sessionId: string;
  guestId?: string | null;
  accessToken?: string | null;
}

export async function leaveDiceSession(
  params: LeaveSessionParams,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const res = await fetch(
    `${diceBase()}/sessions/${params.sessionId}/leave`,
    {
      ...defaultFetchOptions,
      method: "POST",
      headers: authHeaders(params.accessToken ?? null),
      body: JSON.stringify(params.guestId ? { guestId: params.guestId } : {}),
    },
  );
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    return {
      ok: false,
      error: (data?.error as string) ?? "Erreur lors de la sortie.",
    };
  }
  return { ok: true };
}

export interface StartSessionParams {
  sessionId: string;
  guestId?: string | null;
  accessToken?: string | null;
}

export async function startDiceSession(
  params: StartSessionParams,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const res = await fetch(
    `${diceBase()}/sessions/${params.sessionId}/start`,
    {
      ...defaultFetchOptions,
      method: "POST",
      headers: authHeaders(params.accessToken ?? null),
      body: JSON.stringify(params.guestId ? { guestId: params.guestId } : {}),
    },
  );
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    return {
      ok: false,
      error: (data?.error as string) ?? "Erreur au démarrage de la partie.",
    };
  }
  return { ok: true };
}

export async function getDiceSession(
  sessionId: string,
): Promise<
  | { ok: true; data: DiceSessionViewDto }
  | { ok: false; error: string; status?: number }
> {
  const res = await fetch(`${diceBase()}/sessions/${sessionId}`, {
    ...defaultFetchOptions,
    method: "GET",
  });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    return {
      ok: false,
      error: (data?.error as string) ?? "Session introuvable.",
      status: res.status,
    };
  }
  return { ok: true, data: data as DiceSessionViewDto };
}
