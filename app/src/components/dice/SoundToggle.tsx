"use client";

import { Volume2, VolumeX } from "lucide-react";

import { useSound } from "@/contexts/sound-context";
import { cn } from "@/lib/utils";

type SoundToggleProps = {
  className?: string;
  iconClassName?: string;
};

export function SoundToggle({ className, iconClassName }: SoundToggleProps) {
  const { muted, toggleMuted } = useSound();
  return (
    <button
      type="button"
      onClick={toggleMuted}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-sm text-dice-foreground transition-colors",
        muted
          ? "bg-dice-main-tertiary/80 hover:bg-dice-main-tertiary"
          : "bg-dice-foreground/10 hover:bg-dice-foreground/20",
        className,
      )}
      aria-label={muted ? "Activer le son" : "Couper le son"}
    >
      {muted ? (
        <VolumeX className={cn("h-5 w-5", iconClassName)} />
      ) : (
        <Volume2 className={cn("h-5 w-5", iconClassName)} />
      )}
    </button>
  );
}
