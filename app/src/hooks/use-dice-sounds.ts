"use client";

import { useCallback, useRef } from "react";
import { DICE_ASSETS } from "@/constants/assets.constant";

export function useDiceSounds() {
  const rollDiceRef = useRef<HTMLAudioElement | null>(null);
  const shakeAndRollRef = useRef<HTMLAudioElement | null>(null);

  const playRollDice = useCallback(() => {
    if (typeof window === "undefined") return;
    if (!rollDiceRef.current) {
      rollDiceRef.current = new Audio(DICE_ASSETS.ROLL_DICE);
    }
    rollDiceRef.current.currentTime = 0;
    rollDiceRef.current.play().catch(() => {});
  }, []);

  const playShakeAndRoll = useCallback(() => {
    if (typeof window === "undefined") return;
    if (!shakeAndRollRef.current) {
      shakeAndRollRef.current = new Audio(DICE_ASSETS.SHAKE_AND_ROLL);
    }
    shakeAndRollRef.current.currentTime = 0;
    shakeAndRollRef.current.play().catch(() => {});
  }, []);

  return { playRollDice, playShakeAndRoll };
}
