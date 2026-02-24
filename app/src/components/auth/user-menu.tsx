"use client";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export function UserMenu() {
  const { user, isAuthenticated, logoutMutation } = useAuth();

  if (!isAuthenticated || !user) return null;

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm font-medium text-white">{user.username}</span>
      <Button
        variant="outline"
        onClick={() => logoutMutation.mutate()}
        disabled={logoutMutation.isPending}
        className="border-white/20 bg-white/5 text-white"
      >
        Déconnexion
      </Button>
    </div>
  );
}
