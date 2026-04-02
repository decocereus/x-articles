"use client";

import { cn } from "@/lib/utils";

import { ExtractorForm } from "@/features/extractor/components/extractor-form";
import { ExtractorHeader } from "@/features/extractor/components/extractor-header";
import { ExtractorResults } from "@/features/extractor/components/extractor-results";
import { ResultSkeleton } from "@/features/extractor/components/result-skeleton";
import { useExtractor } from "@/features/extractor/hooks/use-extractor";

export function ExtractorShell() {
  const {
    activePreviewValue,
    activeTab,
    copiedTab,
    error,
    handleCopy,
    handleSubmit,
    handleTabChange,
    handleUrlChange,
    hasActiveDocument,
    isSubmitDisabled,
    isSubmitting,
    result,
    resultMeta,
    url,
  } = useExtractor();

  return (
    <div
      className={cn(
        "min-h-screen",
        hasActiveDocument && "md:h-screen md:overflow-hidden",
      )}
    >
      <main
        className={cn(
          "mx-auto flex w-full max-w-5xl flex-col px-5 sm:px-8",
          hasActiveDocument
            ? "min-h-screen py-3 sm:py-4 md:h-full md:max-h-full"
            : "min-h-screen py-6 sm:py-10",
        )}
      >
        <ExtractorHeader hasActiveDocument={hasActiveDocument} />

        <section
          className={cn(
            "flex min-h-0 flex-1 flex-col",
            hasActiveDocument
              ? "gap-3 pt-3 sm:gap-4 sm:pt-4"
              : "gap-10 pt-16 sm:gap-12 sm:pt-24",
          )}
        >
          <div
            className={cn(
              "flex max-w-3xl flex-col",
              hasActiveDocument ? "gap-1.5" : "gap-4",
            )}
          >
            <h1
              className={cn(
                "font-heading leading-[0.94] tracking-[-0.05em] text-balance text-foreground transition-[font-size,opacity,transform] duration-300 ease-out",
                hasActiveDocument
                  ? "text-[2.1rem] sm:text-[2.5rem] lg:text-[2.7rem]"
                  : "text-5xl sm:text-6xl lg:text-7xl",
              )}
            >
              Paste an X link.
              <br />
              <span className="text-primary">Get the actual text.</span>
            </h1>
            <p
              className={cn(
                "max-w-2xl text-pretty text-muted-foreground transition-[opacity,transform] duration-300 ease-out",
                hasActiveDocument ? "hidden" : "text-base leading-7 sm:text-lg",
              )}
            >
              Posts and long-form X articles, formatted for agents.
            </p>
          </div>

          <div
            className={cn(
              "panel-shell surface-shadow relative isolate flex min-h-0 flex-col overflow-hidden rounded-[1.85rem] border border-white/70 bg-card/92 backdrop-blur dark:border-white/[0.08] dark:bg-card/[0.82]",
              hasActiveDocument ? "flex-1 p-3 sm:p-3.5" : "p-4 sm:p-5",
            )}
          >
            <ExtractorForm
              error={error}
              isSubmitDisabled={isSubmitDisabled}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
              onUrlChange={handleUrlChange}
              url={url}
            />

            {isSubmitting ? <ResultSkeleton /> : null}

            {result ? (
              <ExtractorResults
                activePreviewValue={activePreviewValue}
                activeTab={activeTab}
                copiedTab={copiedTab}
                onCopy={handleCopy}
                onTabChange={handleTabChange}
                result={result}
                resultMeta={resultMeta}
              />
            ) : null}
          </div>
        </section>
      </main>
    </div>
  );
}
