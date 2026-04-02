"use client";

import { startTransition, useEffect, useMemo, useRef, useState } from "react";

import { requestExtraction } from "@/features/extractor/api";
import {
  COPY_RESET_DELAY_MS,
  DEFAULT_EXTRACTOR_TAB,
  EMPTY_URL_MESSAGE,
  type ExtractorTabValue,
} from "@/features/extractor/constants";
import {
  getExtractorResultMeta,
  getExtractorTabContent,
} from "@/features/extractor/utils";
import type { ExtractedDocument } from "@/lib/extract/types";

export function useExtractor() {
  const [url, setUrl] = useState("");
  const [activeTab, setActiveTab] =
    useState<ExtractorTabValue>(DEFAULT_EXTRACTOR_TAB);
  const [result, setResult] = useState<ExtractedDocument | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedTab, setCopiedTab] = useState<ExtractorTabValue | null>(null);
  const copyTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current !== null) {
        window.clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const tabContent = useMemo(
    () => (result ? getExtractorTabContent(result) : null),
    [result],
  );
  const resultMeta = useMemo(
    () => (result ? getExtractorResultMeta(result) : []),
    [result],
  );

  const hasActiveDocument = isSubmitting || result !== null;
  const isSubmitDisabled = isSubmitting || url.trim().length === 0;
  const activeClipboardValue = tabContent?.[activeTab].clipboard ?? "";
  const activePreviewValue = tabContent?.[activeTab].preview ?? "";

  function handleUrlChange(nextUrl: string) {
    setUrl(nextUrl);

    if (error) {
      setError(null);
    }
  }

  function handleTabChange(value: string) {
    startTransition(() => {
      setActiveTab(value as ExtractorTabValue);
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      setError(EMPTY_URL_MESSAGE);
      return;
    }

    setIsSubmitting(true);
    setCopiedTab(null);
    setError(null);
    setResult(null);

    try {
      const payload = await requestExtraction(trimmedUrl);

      if (!payload.ok) {
        setError(payload.message);
        return;
      }

      startTransition(() => {
        setResult(payload.document);
        setActiveTab(DEFAULT_EXTRACTOR_TAB);
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCopy() {
    if (!activeClipboardValue) {
      return;
    }

    try {
      await navigator.clipboard.writeText(activeClipboardValue);
      setCopiedTab(activeTab);

      if (copyTimeoutRef.current !== null) {
        window.clearTimeout(copyTimeoutRef.current);
      }

      copyTimeoutRef.current = window.setTimeout(() => {
        setCopiedTab(null);
        copyTimeoutRef.current = null;
      }, COPY_RESET_DELAY_MS);
    } catch {
      setError(
        "Clipboard access failed. You can still select and copy the output manually.",
      );
    }
  }

  return {
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
  };
}
