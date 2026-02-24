"use client";

import { useState } from "react";
import Link from "next/link";
import { Dices, Gamepad2, LogIn, type LucideIcon } from "lucide-react";
import { games } from "@/lib/games";
import { useAuth } from "@/hooks/use-auth";
import { AuthModal } from "@/components/home/AuthModal";
import { UserMenu } from "@/components/auth/user-menu";
import { Button } from "@/components/ui/button";

const GAME_ICONS: Record<string, LucideIcon> = {
  Dices,
  Gamepad2,
};

function GameCardIcon({ icon }: { icon?: string }) {
  const Icon = icon ? GAME_ICONS[icon] : Dices;
  return <Icon className="size-6" />;
}

export default function Home() {
  const { isAuthenticated, isInitialized } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[linear-gradient(160deg,var(--home-bg-top)_0%,var(--home-bg-bottom)_100%)]">
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold tracking-tight text-white"
          >
            <span className="text-xl">IoTactile Games</span>
          </Link>
          <div className="flex items-center gap-3">
            {!isInitialized ? (
              <span className="text-sm text-white/60">Chargement…</span>
            ) : isAuthenticated ? (
              <UserMenu />
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAuthModalOpen(true)}
                className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              >
                <LogIn className="size-4" />
                Se connecter
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
        <section className="mb-14 text-center">
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Choisissez un jeu
          </h1>
          <p className="text-lg text-white/70">
            Créez une partie ou rejoignez vos amis en un clic.
          </p>
        </section>

        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <Link
              key={game.id}
              href={game.href}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-lg backdrop-blur-sm transition-all duration-200 hover:border-white/20 hover:bg-white/10 hover:shadow-xl"
            >
              <div className="mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-white/10 text-white transition-colors group-hover:bg-white/20">
                <GameCardIcon icon={game.icon} />
              </div>
              <h2 className="mb-2 text-xl font-semibold text-white">
                {game.name}
              </h2>
              <p className="text-sm leading-relaxed text-white/70">
                {game.description}
              </p>
              <span className="mt-4 inline-block text-sm font-medium text-white/90 underline-offset-4 group-hover:underline">
                Jouer
              </span>
            </Link>
          ))}
        </section>
      </main>

      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  );
}
