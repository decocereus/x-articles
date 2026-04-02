import type { ExtractResponse } from "@/lib/extract/types";

import {
  DEFAULT_EXTRACTION_ERROR_MESSAGE,
  INTERNAL_RESPONSE_ERROR_MESSAGE,
  NETWORK_ERROR_MESSAGE,
  UNEXPECTED_RESPONSE_ERROR_MESSAGE,
} from "@/features/extractor/constants";

export async function requestExtraction(url: string): Promise<ExtractResponse> {
  try {
    const response = await fetch("/api/extract", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    });
    const contentType = response.headers.get("content-type") ?? "";

    if (!contentType.includes("application/json")) {
      return {
        ok: false,
        message:
          response.status >= 500
            ? INTERNAL_RESPONSE_ERROR_MESSAGE
            : UNEXPECTED_RESPONSE_ERROR_MESSAGE,
      };
    }

    const payload = (await response.json()) as ExtractResponse;

    if (!response.ok || !payload.ok) {
      return {
        ok: false,
        message: payload.ok
          ? DEFAULT_EXTRACTION_ERROR_MESSAGE
          : payload.message,
      };
    }

    return payload;
  } catch {
    return {
      ok: false,
      message: NETWORK_ERROR_MESSAGE,
    };
  }
}
