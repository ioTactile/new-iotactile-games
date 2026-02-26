"use client";

import { type Language, languages } from "@/i18n/config";
import { useI18n } from "@/i18n/I18nProvider";
import { cn } from "@/lib/utils";

type LanguageSwitcherProps = {
  className?: string;
  variant?: "default" | "dice";
};

export function LanguageSwitcher({
  className,
  variant = "default",
}: LanguageSwitcherProps) {
  const { language, setLanguage } = useI18n();

  const handleClick = (next: Language) => {
    if (next === language) return;
    setLanguage(next);
  };

  const isDice = variant === "dice";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md p-0.5 text-xs",
        isDice
          ? "border border-dice-foreground/20 bg-dice-foreground/10 text-dice-foreground"
          : "border border-border bg-muted/50 text-foreground",
        className,
      )}
    >
      {languages.map((lng) => (
        <button
          key={lng}
          type="button"
          onClick={() => handleClick(lng)}
          className={cn(
            "rounded-sm px-2 py-1 transition-colors",
            lng === language
              ? isDice
                ? "bg-dice-main-tertiary text-dice-tertiary-foreground"
                : "bg-primary text-primary-foreground"
              : isDice
                ? "bg-transparent text-dice-foreground hover:bg-dice-foreground/20"
                : "bg-transparent text-foreground hover:bg-muted",
          )}
          aria-pressed={lng === language}
          aria-label={lng === "fr" ? "Français" : "English"}
        >
          {lng.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
