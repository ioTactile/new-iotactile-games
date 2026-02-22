"use client";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export function UserMenu() {
  const { user, isAuthenticated, logoutMutation } = useAuth();

  if (!isAuthenticated || !user) return null;

  return (
    <div className="flex items-center gap-4 rounded-lg border bg-card px-4 py-3">
      <div className="flex flex-col">
        <span className="text-sm font-medium ">{user.username}</span>
        <span className="text-xs text-muted-foreground ">{user.email}</span>
      </div>
      <Button
        variant="outline"
        onClick={() => logoutMutation.mutate()}
        disabled={logoutMutation.isPending}
      >
        Déconnexion
      </Button>
    </div>
  );
}
