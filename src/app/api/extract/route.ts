import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { after } from "next/server";

import { ExtractError } from "@/lib/extract/errors";
import type { ExtractResponse } from "@/lib/extract/types";
import {
  getTelemetryUrlMetadata,
  logError,
  logInfo,
} from "@/lib/telemetry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const requestId = randomUUID();
  const startedAt = performance.now();
  let requestedUrl = "";

  try {
    const bodyPromise = request.json() as Promise<{ url?: unknown }>;
    const extractModulePromise = import("@/lib/extract");
    const body = await bodyPromise;
    const url = typeof body.url === "string" ? body.url : "";
    requestedUrl = url;

    if (!url.trim()) {
      const response: ExtractResponse = {
        ok: false,
        message: "Paste a public article or X post URL to extract it.",
      };

      after(() => {
        logError("extract_request_invalid", {
          durationMs: Math.round(performance.now() - startedAt),
          requestId,
          reason: "missing_url",
        });
      });

      return NextResponse.json(response, {
        headers: { "x-request-id": requestId },
        status: 400,
      });
    }

    const { extractFromUrl } = await extractModulePromise;
    const document = await extractFromUrl(url);
    const response: ExtractResponse = { ok: true, document };

    after(() => {
      logInfo("extract_request_succeeded", {
        ...getTelemetryUrlMetadata(url),
        durationMs: Math.round(performance.now() - startedAt),
        requestId,
        sourceType: document.sourceType,
        wordCount: document.wordCount,
      });
    });

    return NextResponse.json(response, {
      headers: { "x-request-id": requestId },
    });
  } catch (error) {
    const message =
      error instanceof ExtractError
        ? error.message
        : error instanceof SyntaxError
          ? "The request body must be valid JSON."
          : "We couldn't extract this URL yet. Try a public article page or a public X post.";

    const response: ExtractResponse = { ok: false, message };
    const status =
      error instanceof ExtractError || error instanceof SyntaxError ? 400 : 500;

    after(() => {
      logError("extract_request_failed", {
        ...getTelemetryUrlMetadata(requestedUrl),
        durationMs: Math.round(performance.now() - startedAt),
        errorName: error instanceof Error ? error.name : "UnknownError",
        message,
        requestId,
        status,
      });
    });

    return NextResponse.json(response, {
      headers: { "x-request-id": requestId },
      status,
    });
  }
}
