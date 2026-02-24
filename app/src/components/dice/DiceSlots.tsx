"use client";

import { useDiceSounds } from "@/hooks/use-dice-sounds";
import { DiceFace } from "./DiceFace";
import type { DiceState } from "./DiceRow";

type DiceSlotsProps = {
  dices: DiceState[];
  lockedOrder: number[];
  showDices?: boolean;
  onUnlockSlot: (slotIndex: number, diceIndex: number) => void;
  disabled?: boolean;
  useWhiteTheme?: boolean;
};

export function DiceSlots({
  dices,
  lockedOrder,
  showDices = true,
  onUnlockSlot,
  disabled = false,
  useWhiteTheme = true,
}: DiceSlotsProps) {
  const { playRollDice } = useDiceSounds();

  const handleClick = (slotIndex: number, diceIndex: number) => {
    onUnlockSlot(slotIndex, diceIndex);
    playRollDice();
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-3">
      {Array.from({ length: 5 }).map((_, slotIndex) => {
        const diceIndex = lockedOrder[slotIndex];
        const d = diceIndex !== undefined ? dices[diceIndex] : undefined;
        const isSelected = showDices && d?.locked && d?.face !== undefined;
        return (
          <div
            key={slotIndex}
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-md border-2 border-white/20 bg-white/10 sm:h-18 sm:w-18"
          >
            {isSelected ? (
              <DiceFace
                face={d.face!}
                locked
                onClick={() =>
                  diceIndex !== undefined && handleClick(slotIndex, diceIndex)
                }
                disabled={disabled}
                useWhite={useWhiteTheme}
                size="md"
              />
            ) : (
              <div className="h-12 w-12 rounded-sm bg-white/5 sm:h-14 sm:w-14" />
            )}
          </div>
        );
      })}
    </div>
  );
}
