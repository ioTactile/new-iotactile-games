"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { getOrCreateGuestId } from "@/lib/guest-id";
import {
  createDiceSession,
  joinDiceSession,
  joinDiceSessionByCode,
  getMyDiceSessions,
  getPublicDiceSessions,
} from "@/lib/dice-api";
import { queryKeys } from "@/lib/query-keys";
import type { DiceSessionStatusType } from "@/types/dice";

function statusLabel(status: DiceSessionStatusType): string {
  switch (status) {
    case "WAITING":
      return "En attente";
    case "PLAYING":
      return "En cours";
    case "FINISHED":
      return "Terminée";
    default:
      return status;
  }
}

export default function DiceLobbyPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { accessToken, user, isInitialized } = useAuth();
  const [createName, setCreateName] = useState("");
  const [createDisplayName, setCreateDisplayName] = useState("");
  const [createIsPublic, setCreateIsPublic] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joinDisplayName, setJoinDisplayName] = useState("");
  const [loading, setLoading] = useState<"create" | "join" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const defaultDisplayName = user?.username ?? "";
  const guestId = accessToken ? undefined : getOrCreateGuestId();
  const { data: mySessions = [] } = useQuery({
    queryKey: queryKeys.dice.mySessions(guestId, accessToken ?? null),
    queryFn: async () => {
      const res = await getMyDiceSessions({
        guestId: guestId ?? null,
        accessToken: accessToken ?? null,
      });
      if (!res.ok) return [];
      return res.data;
    },
    enabled: isInitialized,
  });

  const { data: publicSessions = [] } = useQuery({
    queryKey: queryKeys.dice.publicSessions(),
    queryFn: async () => {
      const res = await getPublicDiceSessions();
      if (!res.ok) return [];
      return res.data;
    },
    enabled: isInitialized,
  });

  const mySessionIds = useMemo(
    () => new Set(mySessions.map((s) => s.id)),
    [mySessions],
  );
  const publicSessionsToShow = useMemo(
    () => publicSessions.filter((s) => !mySessionIds.has(s.id)),
    [publicSessions, mySessionIds],
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const name = createName.trim();
    if (!name) {
      setError("Donne un nom à la partie.");
      return;
    }
    const displayName = (createDisplayName || defaultDisplayName).trim();
    if (!displayName) {
      setError("Indique ton pseudo (ou connecte-toi).");
      return;
    }
    setLoading("create");
    const result = await createDiceSession({
      name,
      isPublic: createIsPublic,
      displayName: displayName || undefined,
      guestId: accessToken ? undefined : getOrCreateGuestId(),
      accessToken: accessToken ?? null,
    });
    setLoading(null);
    if (result.ok) {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.dice.mySessions(guestId, accessToken ?? null),
      });
      if (createIsPublic) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.dice.publicSessions(),
        });
      }
      router.push(`/dice/${result.data.id}`);
    } else {
      setError(result.error);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const codeInput = joinCode.trim();
    if (!codeInput) {
      setError("Entre le code de la partie (6 caractères).");
      return;
    }
    const displayName = (joinDisplayName || defaultDisplayName).trim();
    if (!displayName) {
      setError("Indique ton pseudo (ou connecte-toi).");
      return;
    }
    setLoading("join");
    const isShortCode =
      codeInput.length >= 4 &&
      codeInput.length <= 10 &&
      /^[A-Za-z0-9]+$/.test(codeInput);
    const result = isShortCode
      ? await joinDiceSessionByCode({
          joinCode: codeInput,
          displayName: displayName || undefined,
          guestId: accessToken ? undefined : getOrCreateGuestId(),
          accessToken: accessToken ?? null,
        })
      : await joinDiceSession({
          sessionId: codeInput,
          displayName: displayName || undefined,
          guestId: accessToken ? undefined : getOrCreateGuestId(),
          accessToken: accessToken ?? null,
        });
    setLoading(null);
    if (result.ok) {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.dice.mySessions(guestId, accessToken ?? null),
      });
      const targetId =
        isShortCode && "sessionId" in result ? result.sessionId : codeInput;
      router.push(`/dice/${targetId}`);
    } else {
      setError(result.error);
    }
  };

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-dice-main-secondary">
        <p className="text-white/80">Chargement…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-dice-main-secondary">
      <header className="border-b border-white/10 bg-dice-main-primary/80 px-4 py-3">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-dice-main-tertiary text-white hover:opacity-90"
            aria-label="Retour"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Link>
          <h1 className="text-lg font-semibold text-white">Dice</h1>
          <div className="w-10" />
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-8 p-6">
        <p className="text-center text-white/90">
          Crée une partie ou rejoins-en une avec un code.
        </p>

        {publicSessionsToShow.length > 0 && (
          <section
            className="flex w-full max-w-sm flex-col gap-2 rounded-xl bg-dice-main-primary/60 p-4"
            aria-label="Parties publiques"
          >
            <h2 className="font-medium text-white">Parties publiques</h2>
            <p className="text-sm text-white/70">
              Partie en attente de joueurs — clique pour remplir le code.
            </p>
            <ul className="flex flex-col gap-2">
              {publicSessionsToShow.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setJoinCode(s.joinCode ?? "");
                      setError(null);
                      const joinForm = document.getElementById("join-form");
                      joinForm?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="flex w-full items-center justify-between rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-left text-white hover:bg-white/20"
                  >
                    <span className="truncate font-medium">{s.name}</span>
                    <span className="ml-2 shrink-0 text-xs text-white/70">
                      {s.joinCode ?? "—"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {mySessions.length > 0 && (
          <section
            className="flex w-full max-w-sm flex-col gap-2 rounded-xl bg-dice-main-primary/60 p-4"
            aria-label="Parties en cours"
          >
            <h2 className="font-medium text-white">Parties en cours</h2>
            <ul className="flex flex-col gap-2">
              {mySessions.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/dice/${s.id}`}
                    className="flex items-center justify-between rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white hover:bg-white/20"
                  >
                    <span className="truncate font-medium">{s.name}</span>
                    <span className="ml-2 shrink-0 text-xs text-white/70">
                      {statusLabel(s.status)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {error && (
          <div
            className="w-full max-w-sm rounded-lg border border-red-400/50 bg-red-500/20 px-4 py-2 text-center text-sm text-red-200"
            role="alert"
          >
            {error}
          </div>
        )}

        <div className="flex w-full max-w-sm flex-col gap-6">
          <form
            onSubmit={handleCreate}
            className="flex flex-col gap-3 rounded-xl bg-dice-main-primary/60 p-4"
          >
            <h2 className="font-medium text-white">Créer une partie</h2>
            <input
              type="text"
              placeholder="Nom de la partie"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/50"
              maxLength={100}
            />
            {!accessToken && (
              <input
                type="text"
                placeholder="Ton pseudo"
                value={createDisplayName}
                onChange={(e) => setCreateDisplayName(e.target.value)}
                className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/50"
                maxLength={50}
              />
            )}
            <label className="flex cursor-pointer items-center gap-2 text-sm text-white/90">
              <input
                type="checkbox"
                checked={createIsPublic}
                onChange={(e) => setCreateIsPublic(e.target.checked)}
                className="rounded border-white/30 bg-white/10 text-dice-main-tertiary focus:ring-dice-main-tertiary"
              />
              Partie publique (visible dans le salon)
            </label>
            <button
              type="submit"
              disabled={loading !== null}
              className="rounded-lg bg-dice-main-tertiary px-4 py-2 font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {loading === "create" ? "Création…" : "Créer la partie"}
            </button>
          </form>

          <form
            id="join-form"
            onSubmit={handleJoin}
            className="flex flex-col gap-3 rounded-xl bg-dice-main-primary/60 p-4"
          >
            <h2 className="font-medium text-white">Rejoindre une partie</h2>
            <p className="text-sm text-white/70">
              Demande le code à 6 caractères à l’organisateur (ex: A3B9K2).
            </p>
            <input
              type="text"
              placeholder="Code à 6 caractères (ex: A3B9K2)"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              maxLength={10}
              className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/50"
            />
            {!accessToken && (
              <input
                type="text"
                placeholder="Ton pseudo"
                value={joinDisplayName}
                onChange={(e) => setJoinDisplayName(e.target.value)}
                className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/50"
                maxLength={50}
              />
            )}
            <button
              type="submit"
              disabled={loading !== null}
              className="rounded-lg bg-dice-main-tertiary px-4 py-2 font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {loading === "join" ? "Connexion…" : "Rejoindre"}
            </button>
          </form>
        </div>

        <Link href="/" className="text-sm text-white/70 hover:text-white">
          Retour à l&apos;accueil
        </Link>
      </main>
    </div>
  );
}
