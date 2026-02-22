"use client";

import { useDiceSounds } from "@/hooks/use-dice-sounds";
import { DiceFace } from "./DiceFace";
import type { DiceState } from "./DiceRow";

type DiceSlotsProps = {
  dices: DiceState[];
  onToggleLock: (index: number) => void;
  disabled?: boolean;
  useWhiteTheme?: boolean;
};

export function DiceSlots({
  dices,
  onToggleLock,
  disabled = false,
  useWhiteTheme = true,
}: DiceSlotsProps) {
  const { playRollDice } = useDiceSounds();

  const handleClick = (index: number) => {
    onToggleLock(index);
    playRollDice();
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      {Array.from({ length: 5 }).map((_, i) => {
        const d = dices[i];
        const isSelected = d?.locked && d?.face !== undefined;
        return (
          <div
            key={i}
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border-2 border-white/20 bg-white/10 sm:h-18 sm:w-18 sm:rounded-2xl"
          >
            {isSelected ? (
              <DiceFace
                face={d.face!}
                locked
                onClick={() => handleClick(i)}
                disabled={disabled}
                useWhite={useWhiteTheme}
                size="md"
              />
            ) : (
              <div className="h-12 w-12 rounded-lg bg-white/5 sm:h-14 sm:w-14" />
            )}
          </div>
        );
      })}
    </div>
  );
}
