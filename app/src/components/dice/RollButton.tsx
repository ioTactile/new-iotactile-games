"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { DICE_ASSETS } from "@/constants/assets.constant";
import { useDiceSounds } from "@/hooks/use-dice-sounds";

type RollButtonProps = {
  onRoll: () => void;
  disabled?: boolean;
  triesLeft: number;
  rolling?: boolean;
  className?: string;
};

const SHAKE_DURATION_MS = 800;

export function RollButton({
  onRoll,
  disabled = false,
  triesLeft,
  rolling = false,
  className,
}: RollButtonProps) {
  const [shaking, setShaking] = useState(false);
  const { playShakeAndRoll } = useDiceSounds();

  const handleClick = useCallback(() => {
    if (disabled || shaking || rolling || triesLeft <= 0) return;
    setShaking(true);
    playShakeAndRoll();
    onRoll();
    const t = setTimeout(() => setShaking(false), SHAKE_DURATION_MS);
    return () => clearTimeout(t);
  }, [disabled, shaking, rolling, triesLeft, onRoll, playShakeAndRoll]);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled || shaking || rolling || triesLeft <= 0}
      aria-label={`Lancer les dés${triesLeft > 0 ? ` (${triesLeft} restants)` : ""}`}
      className={cn(
        "relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-dice-main-tertiary text-white shadow-lg transition-opacity hover:opacity-95 disabled:opacity-50 sm:h-16 sm:w-16",
        shaking && "animate-dice-shake",
        className,
      )}
    >
      <Image
        src={shaking ? DICE_ASSETS.CUP_ANIMATION : DICE_ASSETS.CUP}
        alt=""
        width={48}
        height={42}
        className="h-10 w-10 object-contain sm:h-12 sm:w-12"
        unoptimized
      />
      <span
        className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-dice-main-secondary text-xs font-bold text-white"
        aria-hidden
      >
        {triesLeft}
      </span>
    </button>
  );
}
