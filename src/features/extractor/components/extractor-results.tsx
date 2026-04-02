"use client";

import dynamic from "next/dynamic";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  EXTRACTOR_TABS,
  type ExtractorTabValue,
} from "@/features/extractor/constants";
import type { ExtractedDocument } from "@/lib/extract/types";

const PretextScene = dynamic(
  () => import("@/components/pretext-scene").then((mod) => mod.PretextScene),
  {
    ssr: false,
    loading: () => (
      <div className="h-full p-3">
        <Skeleton className="h-full w-full rounded-[1.1rem]" />
      </div>
    ),
  },
);

type ExtractorResultsProps = {
  activePreviewValue: string;
  activeTab: ExtractorTabValue;
  copiedTab: ExtractorTabValue | null;
  onCopy: () => void;
  onTabChange: (value: string) => void;
  result: ExtractedDocument;
  resultMeta: string[];
};

export function ExtractorResults({
  activePreviewValue,
  activeTab,
  copiedTab,
  onCopy,
  onTabChange,
  result,
  resultMeta,
}: ExtractorResultsProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 flex min-h-0 flex-col gap-3 pt-3 duration-300">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-col gap-1.5">
          {resultMeta.length > 0 ? (
            <p className="text-sm text-muted-foreground">
              {resultMeta.join(" · ")}
            </p>
          ) : null}

          <h2 className="font-heading text-[2rem] leading-tight tracking-[-0.04em] text-balance text-foreground sm:text-[2.4rem]">
            {result.title}
          </h2>
        </div>

        <Button type="button" variant="outline" size="sm" onClick={onCopy}>
          {copiedTab === activeTab ? (
            <>
              <Check className="size-4" />
              Copied
            </>
          ) : (
            <>
              <Copy className="size-4" />
              Copy
            </>
          )}
        </Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={onTabChange}
        className="flex min-h-0 flex-1 gap-2.5"
      >
        <TabsList variant="line">
          {EXTRACTOR_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent
          key={activeTab}
          value={activeTab}
          className="animate-in fade-in slide-in-from-bottom-1 min-h-0 duration-200"
        >
          <div className="soft-outline h-[min(44vh,24rem)] overflow-hidden rounded-[1.35rem] border border-white/70 bg-background/72 transition-[border-color,transform,box-shadow] duration-300 ease-out dark:border-white/[0.08] dark:bg-black/10 md:h-full md:min-h-0">
            <PretextScene
              isActive
              value={activePreviewValue}
              variant={activeTab}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
