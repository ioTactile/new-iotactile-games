"use client";

import { useCallback, useEffect, useRef } from "react";
import { DICE_ASSETS } from "@/constants/assets.constant";

/**
 * Hook pour jouer les sons des dés.
 */
export function useDiceSounds() {
  const rollDiceRef = useRef<HTMLAudioElement | null>(null);
  const shakeAndRollRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    rollDiceRef.current = new Audio(DICE_ASSETS.ROLL_DICE);
    shakeAndRollRef.current = new Audio(DICE_ASSETS.SHAKE_AND_ROLL);
    shakeAndRollRef.current.load();
    rollDiceRef.current.load();
    return () => {
      rollDiceRef.current = null;
      shakeAndRollRef.current = null;
    };
  }, []);

  const playRollDice = useCallback(() => {
    if (typeof window === "undefined" || !rollDiceRef.current) return;
    rollDiceRef.current.currentTime = 0;
    rollDiceRef.current.play().catch(() => {});
  }, []);

  const playShakeAndRoll = useCallback(() => {
    if (typeof window === "undefined" || !shakeAndRollRef.current) return;
    shakeAndRollRef.current.currentTime = 0;
    shakeAndRollRef.current.play().catch(() => {});
  }, []);

  const stopShakeAndRoll = useCallback(() => {
    if (shakeAndRollRef.current) {
      shakeAndRollRef.current.pause();
      shakeAndRollRef.current.currentTime = 0;
    }
  }, []);

  return { playRollDice, playShakeAndRoll, stopShakeAndRoll };
}
