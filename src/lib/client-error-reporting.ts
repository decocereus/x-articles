import type { ClientErrorTelemetryPayload } from "@/lib/telemetry";

const ERROR_DEDUP_WINDOW_MS = 60_000;
const recentErrors = new Map<string, number>();

function buildSignature(payload: ClientErrorTelemetryPayload) {
  return [
    payload.type,
    payload.pathname ?? "",
    payload.source ?? "",
    payload.message,
    payload.lineno ?? "",
    payload.colno ?? "",
  ].join("|");
}

function shouldSkip(payload: ClientErrorTelemetryPayload) {
  const signature = buildSignature(payload);
  const now = Date.now();

  for (const [key, timestamp] of recentErrors.entries()) {
    if (now - timestamp > ERROR_DEDUP_WINDOW_MS) {
      recentErrors.delete(key);
    }
  }

  const lastSeenAt = recentErrors.get(signature);

  if (lastSeenAt && now - lastSeenAt < ERROR_DEDUP_WINDOW_MS) {
    return true;
  }

  recentErrors.set(signature, now);
  return false;
}

function send(payload: ClientErrorTelemetryPayload) {
  const body = JSON.stringify(payload);

  if ("sendBeacon" in navigator) {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon("/api/telemetry", blob);
    return;
  }

  void fetch("/api/telemetry", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body,
    keepalive: true,
  });
}

export function reportClientError(payload: ClientErrorTelemetryPayload) {
  if (shouldSkip(payload)) {
    return;
  }

  send(payload);
}

export function getErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "string" && error.trim().length > 0) {
    return error;
  }

  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown client error";
  }
}
