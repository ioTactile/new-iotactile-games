"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { getOrCreateGuestId } from "@/lib/guest-id";
import { createDiceSession, joinDiceSession } from "@/lib/dice-api";

export default function DiceLobbyPage() {
  const router = useRouter();
  const { accessToken, user, isInitialized } = useAuth();
  const [createName, setCreateName] = useState("");
  const [createDisplayName, setCreateDisplayName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [joinDisplayName, setJoinDisplayName] = useState("");
  const [loading, setLoading] = useState<"create" | "join" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const defaultDisplayName = user?.username ?? "";

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
      displayName: displayName || undefined,
      guestId: accessToken ? undefined : getOrCreateGuestId(),
      accessToken: accessToken ?? null,
    });
    setLoading(null);
    if (result.ok) {
      router.push(`/dice/${result.data.id}`);
    } else {
      setError(result.error);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const sessionId = joinCode.trim();
    if (!sessionId) {
      setError("Entre le code de la partie.");
      return;
    }
    const displayName = (joinDisplayName || defaultDisplayName).trim();
    if (!displayName) {
      setError("Indique ton pseudo (ou connecte-toi).");
      return;
    }
    setLoading("join");
    const result = await joinDiceSession({
      sessionId,
      displayName: displayName || undefined,
      guestId: accessToken ? undefined : getOrCreateGuestId(),
      accessToken: accessToken ?? null,
    });
    setLoading(null);
    if (result.ok) {
      router.push(`/dice/${sessionId}`);
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
            <button
              type="submit"
              disabled={loading !== null}
              className="rounded-lg bg-dice-main-tertiary px-4 py-2 font-medium text-white hover:opacity-90 disabled:opacity-50"
            >
              {loading === "create" ? "Création…" : "Créer la partie"}
            </button>
          </form>

          <form
            onSubmit={handleJoin}
            className="flex flex-col gap-3 rounded-xl bg-dice-main-primary/60 p-4"
          >
            <h2 className="font-medium text-white">Rejoindre une partie</h2>
            <input
              type="text"
              placeholder="Code de la partie"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 font-mono text-white placeholder:text-white/50"
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
