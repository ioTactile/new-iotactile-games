"use client";

import { useState } from "react";
import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import { UserMenu } from "@/components/auth/user-menu";
import { useAuth } from "@/hooks/use-auth";

export default function Home() {
  const { isAuthenticated, isInitialized } = useAuth();
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [loginEmailPrefill, setLoginEmailPrefill] = useState<string | null>(
    null,
  );

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 font-sans dark:bg-zinc-950">
      <main className="flex w-full max-w-md flex-col items-center gap-8 py-12">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          IoTactile Games
        </h1>
        <Link
          href="/dice"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Jouer au Dice
        </Link>

        {!isInitialized ? (
          <p className="text-zinc-500 dark:text-zinc-400">Chargement…</p>
        ) : isAuthenticated ? (
          <UserMenu />
        ) : authMode === "login" ? (
          <LoginForm
            defaultEmail={loginEmailPrefill ?? undefined}
            onSwitchToRegister={() => {
              setLoginEmailPrefill(null);
              setAuthMode("register");
            }}
          />
        ) : (
          <RegisterForm
            onSwitchToLogin={(email) => {
              setLoginEmailPrefill(email ?? null);
              setAuthMode("login");
            }}
          />
        )}
      </main>
    </div>
  );
}
