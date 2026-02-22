"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  DICE_FACE_IMAGES,
  DICE_FACE_IMAGES_WHITE,
} from "@/constants/assets.constant";

type DiceFaceProps = {
  face: number; // 1-6
  locked: boolean;
  onClick: () => void;
  disabled?: boolean;
  useWhite?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "w-12 h-12",
  md: "w-14 h-14 sm:w-16 sm:h-16",
  lg: "w-16 h-16 sm:w-20 sm:h-20",
};

export function DiceFace({
  face,
  locked,
  onClick,
  disabled = false,
  useWhite = false,
  size = "md",
  className,
}: DiceFaceProps) {
  const images = useWhite ? DICE_FACE_IMAGES_WHITE : DICE_FACE_IMAGES;
  const src = images[Math.max(0, Math.min(face - 1, 5))];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={locked}
      aria-label={`Dé ${face}${locked ? ", verrouillé" : ""}`}
      className={cn(
        "relative rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        locked && "ring-2 ring-primary opacity-90",
        !disabled && "cursor-pointer hover:scale-105 active:scale-95",
        disabled && "cursor-not-allowed opacity-70",
        sizeClasses[size],
        className,
      )}
    >
      <Image
        src={src}
        alt=""
        width={64}
        height={64}
        className={cn("h-full w-full select-none object-contain", sizeClasses[size])}
        unoptimized
      />
      {locked && (
        <span
          className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground"
          aria-hidden
        >
          ✓
        </span>
      )}
    </button>
  );
}
