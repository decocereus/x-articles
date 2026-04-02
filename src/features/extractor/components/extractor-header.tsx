import { ArrowUpRight, GitBranch } from "lucide-react";

import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import {
  OSS_REPO_URL,
  X_PROFILE_URL,
} from "@/features/extractor/constants";
import { cn } from "@/lib/utils";

type ExtractorHeaderProps = {
  hasActiveDocument: boolean;
};

export function ExtractorHeader({
  hasActiveDocument,
}: ExtractorHeaderProps) {
  return (
    <header>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div
          className={cn(
            "flex flex-col",
            hasActiveDocument ? "gap-1" : "gap-2",
          )}
        >
          <p
            className={cn(
              "font-heading leading-none italic tracking-[-0.04em] text-primary transition-[font-size,opacity] duration-300 ease-out",
              hasActiveDocument
                ? "text-[2rem] sm:text-[2.2rem]"
                : "text-[2.4rem] sm:text-[2.8rem]",
            )}
          >
            xtract
          </p>
          <p
            className={cn(
              "max-w-md text-pretty text-sm leading-6 text-muted-foreground transition-[opacity,transform] duration-300 ease-out",
              hasActiveDocument ? "hidden sm:block sm:text-xs" : "text-sm",
            )}
          >
            Open source extraction for public X posts, X articles, and web
            links.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <a
            href={X_PROFILE_URL}
            target="_blank"
            rel="noreferrer"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "h-9 rounded-full px-3 text-foreground/55 transition-colors hover:bg-transparent hover:text-primary dark:text-foreground/52 dark:hover:text-primary",
            )}
          >
            @decocereus
          </a>
          <a
            href={OSS_REPO_URL}
            target="_blank"
            rel="noreferrer"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "ink-action h-9 rounded-full border-white/65 bg-background/78 px-3 shadow-sm shadow-black/5 backdrop-blur dark:border-white/[0.08] dark:bg-white/[0.035] dark:text-foreground/88 dark:shadow-black/25 dark:hover:border-primary/30 dark:hover:bg-white/[0.06] dark:hover:text-foreground",
            )}
          >
            <GitBranch className="size-4" />
            GitHub
            <ArrowUpRight className="size-3.5 opacity-70" />
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
