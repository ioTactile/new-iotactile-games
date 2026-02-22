"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";

export type Player = { id: string; name: string };

type PlayerBarProps = {
  players: Player[];
  currentPlayerId: string;
  backHref?: string;
  className?: string;
};

export function PlayerBar({
  players,
  currentPlayerId,
  backHref = "/",
  className,
}: PlayerBarProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 border-b border-white/10 bg-dice-main-primary/80 px-3 py-2",
        className,
      )}
    >
      <Link
        href={backHref}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-dice-main-tertiary text-white hover:opacity-90"
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

      {players.map((p) => (
        <button
          key={p.id}
          type="button"
          className={cn(
            "rounded-lg px-4 py-2 text-sm font-medium transition-colors",
            p.id === currentPlayerId
              ? "bg-dice-main-tertiary text-white"
              : "bg-white/10 text-white hover:bg-white/20",
          )}
        >
          {p.name}
        </button>
      ))}
      <div className="ml-auto flex items-center gap-1">
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20"
          aria-label="Son"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.076L4.235 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.235l4.148-3.924zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white hover:bg-white/20"
          aria-label="Chat"
        >
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
