"use client";

import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { DICE_ASSETS } from "@/constants/assets.constant";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { XIcon } from "lucide-react";

const DICE_FACES = [
  DICE_ASSETS.ONE,
  DICE_ASSETS.TWO,
  DICE_ASSETS.THREE,
  DICE_ASSETS.FOUR,
  DICE_ASSETS.FIVE,
  DICE_ASSETS.SIX,
] as const;

const NUMBER_RULES = [
  { label: "NOMBRE DE 1", faceIndex: 0 },
  { label: "NOMBRE DE 2", faceIndex: 1 },
  { label: "NOMBRE DE 3", faceIndex: 2 },
  { label: "NOMBRE DE 4", faceIndex: 3 },
  { label: "NOMBRE DE 5", faceIndex: 4 },
  { label: "NOMBRE DE 6", faceIndex: 5 },
] as const;

const COMBO_RULES = [
  {
    icon: DICE_ASSETS.THREE_OF_A_KIND,
    img: DICE_ASSETS.THREE_OF_A_KIND,
    label: "BRELAN",
  },
  {
    icon: DICE_ASSETS.FOUR_OF_A_KIND,
    img: DICE_ASSETS.FOUR_OF_A_KIND,
    label: "CARRÉ",
  },
  {
    icon: DICE_ASSETS.FULL_HOUSE,
    img: DICE_ASSETS.FULL_HOUSE,
    label: "FULL HOUSE",
  },
  {
    icon: DICE_ASSETS.SMALL_STRAIGHT,
    img: DICE_ASSETS.SMALL_STRAIGHT,
    label: "SUITE DE 4 DÉS",
  },
  {
    icon: DICE_ASSETS.LARGE_STRAIGHT,
    img: DICE_ASSETS.LARGE_STRAIGHT,
    label: "SUITE DE 5 DÉS",
  },
  {
    icon: DICE_ASSETS.FIVE_OF_A_KIND,
    img: DICE_ASSETS.FIVE_OF_A_KIND,
    label: "5 DÉS IDENTIQUES",
  },
  { icon: DICE_ASSETS.CHANCE, img: DICE_ASSETS.CHANCE, label: "CHANCE" },
] as const;

const COMBO_EXAMPLES = [
  {
    icon: DICE_ASSETS.THREE_OF_A_KIND,
    imgs: [DICE_ASSETS.FOUR, DICE_ASSETS.FOUR, DICE_ASSETS.FOUR],
  },
  {
    icon: DICE_ASSETS.FOUR_OF_A_KIND,
    imgs: [DICE_ASSETS.TWO, DICE_ASSETS.TWO, DICE_ASSETS.TWO, DICE_ASSETS.TWO],
  },
  {
    icon: DICE_ASSETS.FULL_HOUSE,
    imgs: [
      DICE_ASSETS.TWO,
      DICE_ASSETS.TWO,
      DICE_ASSETS.THREE,
      DICE_ASSETS.THREE,
      DICE_ASSETS.THREE,
    ],
  },
  {
    icon: DICE_ASSETS.SMALL_STRAIGHT,
    imgs: [
      DICE_ASSETS.ONE,
      DICE_ASSETS.TWO,
      DICE_ASSETS.THREE,
      DICE_ASSETS.FOUR,
    ],
  },
  {
    icon: DICE_ASSETS.LARGE_STRAIGHT,
    imgs: [
      DICE_ASSETS.ONE,
      DICE_ASSETS.TWO,
      DICE_ASSETS.THREE,
      DICE_ASSETS.FOUR,
      DICE_ASSETS.FIVE,
    ],
  },
  {
    icon: DICE_ASSETS.FIVE_OF_A_KIND,
    imgs: [
      DICE_ASSETS.SIX,
      DICE_ASSETS.SIX,
      DICE_ASSETS.SIX,
      DICE_ASSETS.SIX,
      DICE_ASSETS.SIX,
    ],
  },
  {
    icon: DICE_ASSETS.CHANCE,
    imgs: [
      DICE_ASSETS.ONE,
      DICE_ASSETS.TWO,
      DICE_ASSETS.THREE,
      DICE_ASSETS.FOUR,
      DICE_ASSETS.FIVE,
    ],
  },
] as const;

type RulesModalProps = {
  open: boolean;
  onClose: () => void;
};

export function RulesModal({ open, onClose }: RulesModalProps) {
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={false}
        aria-describedby={undefined}
        className={cn(
          "max-w-lg gap-0 overflow-hidden rounded-2xl p-0",
          "text-dice-main-secondary",
        )}
      >
        <div className="flex items-center justify-end p-2 pr-3 pt-3">
          <DialogClose asChild>
            <Button
              type="button"
              variant="dice"
              className="rounded-lg p-0"
              aria-label="Fermer les règles"
            >
              <XIcon className="h-5 w-5" />
              <span className="sr-only">Fermer les règles</span>
            </Button>
          </DialogClose>
        </div>

        <div className="px-4 pb-2">
          <DialogTitle className="sr-only">Règles du jeu</DialogTitle>
          <DialogDescription className="sr-only">
            Combinaisons et bonus du jeu de dés.
          </DialogDescription>

          <div className="grid grid-cols-2 gap-6 sm:gap-8">
            <div className="flex flex-col justify-between">
              {NUMBER_RULES.map(({ label, faceIndex }) => (
                <div key={label} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Image
                      src={DICE_FACES[faceIndex]}
                      alt=""
                      width={24}
                      height={24}
                      className="h-6 w-6 shrink-0 object-contain"
                      unoptimized
                    />
                    <div className="flex gap-0.5">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <Image
                          key={i}
                          src={DICE_FACES[faceIndex]}
                          alt=""
                          width={20}
                          height={20}
                          className="h-5 w-5 object-contain"
                          unoptimized
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-sm font-medium text-dice-main-secondary">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              {COMBO_RULES.map(({ icon, img, label }) => (
                <div key={label} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center text-sm font-bold text-dice-main-secondary"
                      aria-hidden
                    >
                      <Image
                        src={icon}
                        alt=""
                        width={24}
                        height={24}
                        className="h-6 w-6 shrink-0 object-contain"
                        unoptimized
                      />
                    </span>
                    <div className="flex gap-0.5">
                      {COMBO_EXAMPLES.find(
                        (example) => example.icon === icon,
                      )?.imgs.map((img, index) => (
                        <Image
                          key={index}
                          src={img}
                          alt=""
                          width={20}
                          height={20}
                          className="h-5 w-5 object-contain"
                          unoptimized
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-sm font-medium text-dice-main-secondary">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="mt-4 text-center text-sm font-medium text-dice-main-tertiary">
            BONUS +35 : OBTENIR 63 POINTS DANS LA COLONNE DES NOMBRES
          </p>

          <div className="mt-4 flex justify-center pb-2">
            <DialogClose asChild>
              <Button
                type="button"
                variant="dice"
                className="rounded-xl px-8"
                aria-label="Compris !"
              >
                COMPRIS !
              </Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
