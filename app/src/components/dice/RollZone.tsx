"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { DICE_ASSETS } from "@/constants/assets.constant";
import { DICE_FACE_IMAGES_WHITE } from "@/constants/assets.constant";
import type { DiceState } from "./DiceRow";

const SHAKE_DURATION_MS = 800;

/** Positions fixes bien espacées pour que les 5 dés restent tous visibles (pas de chevauchement). */
const SCATTER_POSITIONS = [
  { left: 18, top: 28 },
  { left: 50, top: 22 },
  { left: 82, top: 30 },
  { left: 25, top: 62 },
  { left: 75, top: 68 },
];

function randomPositions() {
  return SCATTER_POSITIONS.map(({ left, top }) => ({
    left,
    top,
    rotate: (Math.random() - 0.5) * 25,
  }));
}

type RollZoneProps = {
  rolling: boolean;
  dices: DiceState[];
  onRollEnd?: () => void;
  onToggleLock?: (index: number) => void;
  disabled?: boolean;
  className?: string;
};

export function RollZone({
  rolling,
  dices,
  onRollEnd,
  onToggleLock,
  disabled = false,
  className,
}: RollZoneProps) {
  const [positions, setPositions] = useState(randomPositions);

  const hasRolled = dices.some((d) => d.face !== undefined);

  useEffect(() => {
    if (!rolling) return;
    const t = setTimeout(() => {
      setPositions(randomPositions());
      onRollEnd?.();
    }, SHAKE_DURATION_MS);
    return () => clearTimeout(t);
  }, [rolling, onRollEnd]);

  return (
    <div
      className={cn(
        "relative flex min-h-[200px] flex-1 items-center justify-center overflow-hidden rounded-xl bg-dice-main-primary/60",
        className,
      )}
    >
      {rolling && (
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center transition-opacity",
            rolling && "animate-dice-shake",
          )}
        >
          <Image
            src={rolling ? DICE_ASSETS.CUP_ANIMATION : DICE_ASSETS.CUP}
            alt=""
            width={140}
            height={120}
            className="h-auto w-32 select-none object-contain sm:w-40"
            unoptimized
          />
        </div>
      )}
      {!rolling && hasRolled && (
        <div className="absolute inset-0">
          {dices.map(
            (d, i) =>
              d.face !== undefined &&
              !d.locked && (
                <button
                  key={i}
                  type="button"
                  onClick={() => !disabled && onToggleLock?.(i)}
                  disabled={disabled}
                  className="absolute h-12 w-12 -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-110 disabled:cursor-not-allowed sm:h-14 sm:w-14"
                  style={{
                    left: `${positions[i]?.left ?? 50}%`,
                    top: `${positions[i]?.top ?? 50}%`,
                    transform: `translate(-50%, -50%) rotate(${positions[i]?.rotate ?? 0}deg)`,
                  }}
                  aria-label={`Sélectionner le dé ${d.face}`}
                >
                  <Image
                    src={DICE_FACE_IMAGES_WHITE[Math.max(0, d.face - 1)]}
                    alt=""
                    width={48}
                    height={48}
                    className="h-full w-full select-none object-contain"
                    unoptimized
                  />
                </button>
              ),
          )}
        </div>
      )}
      <button
        type="button"
        className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-dice-main-tertiary text-white hover:opacity-90"
        aria-label="Aide"
      >
        <span className="text-lg">?</span>
      </button>
    </div>
  );
}
