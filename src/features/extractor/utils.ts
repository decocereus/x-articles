import type { ExtractedDocument } from "@/lib/extract/types";

import type { ExtractorTabValue } from "@/features/extractor/constants";

const publishedDateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
});

type ExtractorTabContent = {
  clipboard: string;
  preview: string;
};

export type ExtractorTabContentMap = Record<
  ExtractorTabValue,
  ExtractorTabContent
>;

export function formatPublishedDate(value?: string) {
  if (!value) {
    return null;
  }

  return publishedDateFormatter.format(new Date(value));
}

export function getSourceLabel(result: ExtractedDocument) {
  if (result.sourceType === "x_article") {
    return "X article";
  }

  if (result.sourceType === "x_post") {
    return "X post";
  }

  return "Article";
}

export function getExtractorTabContent(
  document: ExtractedDocument,
): ExtractorTabContentMap {
  const jsonPreview = JSON.stringify(document, null, 2);

  return {
    markdown: {
      clipboard: document.markdown,
      preview: document.contentMarkdown,
    },
    text: {
      clipboard: document.plainText,
      preview: document.contentText,
    },
    json: {
      clipboard: jsonPreview,
      preview: jsonPreview,
    },
  };
}

export function getExtractorResultMeta(document: ExtractedDocument) {
  return [
    getSourceLabel(document),
    document.byline,
    formatPublishedDate(document.publishedAt),
  ].filter((value): value is string => Boolean(value));
}
