"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { getOrCreateGuestId } from "@/lib/guest-id";
import {
  getDiceSession,
  leaveDiceSession,
  startDiceSession,
} from "@/lib/dice-api";
import { queryKeys } from "@/lib/query-keys";
import { useDiceWs } from "@/hooks/use-dice-ws";
import {
  viewToPlayers,
  viewToCurrentPlayerId,
  viewToDices,
  viewToScoresByPlayer,
  viewToTriesLeft,
  isGameOver,
} from "@/lib/dice-view-mappers";
import { DiceSlots } from "@/components/dice/DiceSlots";
import { ScoreGrid } from "@/components/dice/ScoreGrid";
import { PlayerBar } from "@/components/dice/PlayerBar";
import { RollZone } from "@/components/dice/RollZone";
import { RollButton } from "@/components/dice/RollButton";
import type { DiceSessionViewDto } from "@/types/dice";
import type { ScoreKey } from "@/lib/dice-scores";

function getMyPlayerId(
  view: DiceSessionViewDto | null,
  userId: string | null,
  guestId: string | null,
): string | null {
  if (!view) return null;
  const me = view.players.find(
    (p) =>
      (userId && p.userId === userId) || (guestId && p.guestId === guestId),
  );
  return me?.id ?? null;
}

function isCreator(view: DiceSessionViewDto | null, myPlayerId: string | null): boolean {
  if (!view || !myPlayerId) return false;
  const first = [...view.players].sort((a, b) => a.orderIndex - b.orderIndex)[0];
  return first?.id === myPlayerId;
}

export default function DiceRoomPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  const { accessToken, user } = useAuth();
  const guestId = typeof window !== "undefined" ? getOrCreateGuestId() : "";

  const {
    data: sessionData,
    isLoading: sessionLoading,
    error: sessionError,
    refetch: refetchSession,
  } = useQuery({
    queryKey: queryKeys.dice.session(sessionId),
    queryFn: async () => {
      const res = await getDiceSession(sessionId);
      if (!res.ok) throw new Error(res.error);
      return res.data;
    },
    enabled: Boolean(sessionId),
    refetchInterval: (query) => {
      const status = query.state.data?.session.status;
      return status === "WAITING" ? 2000 : false;
    },
  });

  const viewFromWs = useDiceWs({
    sessionId,
    accessToken: accessToken ?? null,
    guestId: accessToken ? null : guestId,
    enabled:
      Boolean(sessionId) &&
      Boolean(sessionData?.session.status === "PLAYING" || sessionData?.session.status === "FINISHED"),
  });

  const view = useMemo(() => {
    if (viewFromWs.view) return viewFromWs.view;
    if (sessionData && (sessionData.session.status === "PLAYING" || sessionData.session.status === "FINISHED"))
      return sessionData;
    return sessionData ?? null;
  }, [sessionData, viewFromWs.view]);

  const myPlayerId = getMyPlayerId(
    view ?? sessionData ?? null,
    user?.id ?? null,
    accessToken ? null : guestId,
  );
  const creator = isCreator(sessionData ?? null, myPlayerId);
  const [leaving, setLeaving] = useState(false);
  const [startLoading, setStartLoading] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [rolling, setRolling] = useState(false);

  useEffect(() => {
    if (sessionError) {
      router.replace("/dice");
    }
  }, [sessionError, router]);

  const handleLeave = useCallback(async () => {
    if (!sessionId || leaving) return;
    setLeaving(true);
    const result = await leaveDiceSession({
      sessionId,
      guestId: accessToken ? undefined : getOrCreateGuestId(),
      accessToken: accessToken ?? null,
    });
    setLeaving(false);
    if (result.ok) router.replace("/dice");
  }, [sessionId, leaving, accessToken, router]);

  const handleStart = useCallback(async () => {
    if (!sessionId) return;
    setStartError(null);
    setStartLoading(true);
    const result = await startDiceSession({
      sessionId,
      guestId: accessToken ? undefined : getOrCreateGuestId(),
      accessToken: accessToken ?? null,
    });
    setStartLoading(false);
    if (result.ok) {
      await refetchSession();
    } else {
      setStartError(result.error);
    }
  }, [sessionId, accessToken, refetchSession]);

  const handleChooseScore = useCallback(
    (key: ScoreKey) => {
      viewFromWs.sendChooseScore(key);
    },
    [viewFromWs],
  );

  const handleRoll = useCallback(() => {
    setRolling(true);
    viewFromWs.sendRoll();
    setTimeout(() => setRolling(false), 900);
  }, [viewFromWs]);

  if (!sessionId) {
    router.replace("/dice");
    return null;
  }

  if (sessionLoading && !sessionData) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-dice-main-secondary">
        <p className="text-white/80">Chargement de la partie…</p>
      </div>
    );
  }

  const data = sessionData ?? view ?? null;
  if (!data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-dice-main-secondary">
        <p className="text-white/80">Partie introuvable.</p>
        <Link href="/dice" className="text-dice-main-tertiary hover:underline">
          Retour au menu
        </Link>
      </div>
    );
  }

  const status = data.session.status;

  if (status === "WAITING") {
    const players = viewToPlayers(data);
    return (
      <div className="flex min-h-screen flex-col bg-dice-main-secondary">
        <header className="border-b border-white/10 bg-dice-main-primary/80 px-4 py-3">
          <div className="flex items-center justify-between">
            <Link
              href="/dice"
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
            <h1 className="text-lg font-semibold text-white">
              {data.session.name}
            </h1>
            <div className="w-10" />
          </div>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
          <p className="text-white/90">
            En attente de joueurs… ({players.length}/4)
          </p>
          <ul className="flex flex-col gap-2 rounded-xl bg-dice-main-primary/60 p-4 w-full max-w-xs">
            {players.map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-white"
              >
                <span className="h-2 w-2 rounded-full bg-green-400" />
                {p.name}
              </li>
            ))}
          </ul>
          {startError && (
            <p className="text-sm text-red-300">{startError}</p>
          )}
          <div className="flex flex-wrap gap-3">
            {creator && (
              <button
                type="button"
                onClick={handleStart}
                disabled={startLoading || players.length < 2}
                className="rounded-lg bg-dice-main-tertiary px-4 py-2 font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                {startLoading ? "Démarrage…" : "Démarrer la partie"}
              </button>
            )}
            <button
              type="button"
              onClick={handleLeave}
              disabled={leaving}
              className="rounded-lg border border-white/30 bg-white/10 px-4 py-2 font-medium text-white hover:bg-white/20 disabled:opacity-50"
            >
              {leaving ? "Sortie…" : "Quitter"}
            </button>
          </div>
          <Link href="/dice" className="text-sm text-white/70 hover:text-white">
            ← Retour au menu
          </Link>
        </main>
      </div>
    );
  }

  if (status !== "PLAYING" && status !== "FINISHED") {
    return null;
  }

  const gameView = view ?? data;
  const players = viewToPlayers(gameView);
  const currentPlayerId = viewToCurrentPlayerId(gameView);
  const dices = viewToDices(gameView);
  const scoresByPlayer = viewToScoresByPlayer(gameView);
  const triesLeft = viewToTriesLeft(gameView);
  const gameOver = isGameOver(gameView);
  const isMyTurn = myPlayerId === currentPlayerId;
  const canChoose = isMyTurn && triesLeft < 3;

  if (gameOver) {
    return (
      <div className="flex min-h-screen flex-col bg-dice-main-secondary">
        <PlayerBar
          players={players}
          currentPlayerId={currentPlayerId}
          backHref="/dice"
        />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
          <p className="text-center text-white/90">
            Partie terminée. Consulte la feuille de score.
          </p>
          <Link
            href="/dice"
            className="rounded-lg bg-dice-main-tertiary px-4 py-2 font-medium text-white hover:opacity-90"
          >
            Retour au menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-dice-main-secondary">
      <PlayerBar
      players={players}
      currentPlayerId={currentPlayerId}
      backHref="/dice"
    />

      <div className="flex flex-1 flex-col gap-4 p-3 sm:flex-row sm:p-4">
        <aside className="w-full shrink-0 sm:w-64">
          <ScoreGrid
            players={players}
            currentPlayerId={currentPlayerId}
            scoresByPlayer={scoresByPlayer}
            dices={dices}
            onChooseScore={handleChooseScore}
            canChoose={canChoose}
            className="max-h-[calc(100vh-12rem)] overflow-y-auto"
          />
        </aside>

        <div className="flex flex-1 flex-col gap-4">
          <RollZone
            rolling={rolling}
            dices={dices}
            onRollEnd={() => setRolling(false)}
            onToggleLock={(i) => viewFromWs.sendLock(i)}
            disabled={!isMyTurn || triesLeft <= 0}
          />

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-dice-main-primary/60 p-3">
            <div />
            <DiceSlots
              dices={dices}
              onToggleLock={(i) => viewFromWs.sendLock(i)}
              disabled={!isMyTurn || triesLeft <= 0}
              useWhiteTheme
            />
            <RollButton
              onRoll={handleRoll}
              disabled={!isMyTurn || triesLeft <= 0}
              triesLeft={triesLeft}
              rolling={rolling}
            />
          </div>
          {viewFromWs.error && (
            <p className="text-sm text-red-300">{viewFromWs.error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
