"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  SCORE_KEYS,
  SCORE_LABELS,
  computeScore,
  computeBonus,
  computeTotal,
  type ScoreKey,
} from "@/lib/dice-scores";
import { SCORE_INPUT_IMAGES } from "@/constants/assets.constant";
import type { DiceState } from "../dice/DiceRow";

type ScoreGridProps = {
  dices: DiceState[];
  scores: Partial<Record<ScoreKey, number | null>>;
  onChooseScore: (key: ScoreKey) => void;
  canChoose: boolean;
  className?: string;
};

export function ScoreGrid({
  dices,
  scores,
  onChooseScore,
  canChoose,
  className,
}: ScoreGridProps) {
  return <div>ScoreGrid</div>;
}
