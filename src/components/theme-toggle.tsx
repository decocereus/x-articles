"use client";

import { startTransition } from "react";
import { MoonStar, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  applyTheme,
  clearThemeTransitionStyles,
  getNextTheme,
  getThemeTransitionGeometry,
  getViewTransition,
  setThemeTransitionStyles,
  shouldReduceThemeMotion,
} from "@/lib/theme-transition";

export function ThemeToggle() {
  const { setTheme } = useTheme();

  function handleToggle(event: React.MouseEvent<HTMLButtonElement>) {
    const root = document.documentElement;
    const nextTheme = getNextTheme(root);
    const geometry = getThemeTransitionGeometry(
      event.currentTarget,
      event.nativeEvent,
    );

    const commitTheme = () => {
      applyTheme(root, nextTheme);

      startTransition(() => {
        setTheme(nextTheme);
      });
    };

    const startViewTransition = getViewTransition(document);

    if (!startViewTransition || shouldReduceThemeMotion()) {
      commitTheme();
      return;
    }

    setThemeTransitionStyles(root, geometry);

    const transition = startViewTransition.call(document, () => {
      commitTheme();
    });

    transition.finished.finally(() => {
      clearThemeTransitionStyles(root);
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleToggle}
      className="ink-action h-9 rounded-full border-white/65 bg-background/78 px-3 shadow-sm shadow-black/5 backdrop-blur dark:border-white/[0.08] dark:bg-white/[0.035] dark:text-foreground/88 dark:shadow-black/25 dark:hover:border-primary/30 dark:hover:bg-white/[0.06] dark:hover:text-foreground"
      aria-label="Toggle color mode"
      title="Toggle color mode"
    >
      <span className="relative grid size-4 place-items-center">
        <SunMedium
          aria-hidden="true"
          className="absolute size-4 rotate-0 scale-100 transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] dark:-rotate-90 dark:scale-0 dark:opacity-0"
        />
        <MoonStar
          aria-hidden="true"
          className="absolute size-4 rotate-90 scale-0 opacity-0 transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] dark:rotate-0 dark:scale-100 dark:opacity-100"
        />
      </span>
      <span>Theme</span>
    </Button>
  );
}
