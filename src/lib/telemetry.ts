type LogLevel = "error" | "info";

export type ClientErrorTelemetryPayload = {
  colno?: number;
  lineno?: number;
  message: string;
  pathname?: string;
  source?: string;
  type: "error" | "unhandledrejection";
};

const MAX_MESSAGE_LENGTH = 240;
const MAX_PATH_LENGTH = 160;
const MAX_SOURCE_LENGTH = 200;
const MAX_USER_AGENT_LENGTH = 240;

function limit(value: string, maxLength: number) {
  return value.trim().slice(0, maxLength);
}

export function getTelemetryUrlMetadata(input?: string) {
  if (!input) {
    return {};
  }

  try {
    const url = new URL(input);

    return {
      hostname: limit(url.hostname, 120),
      protocol: url.protocol.replace(":", ""),
    };
  } catch {
    return {};
  }
}

function log(level: LogLevel, event: string, payload: Record<string, unknown>) {
  const message = JSON.stringify({
    event,
    level,
    timestamp: new Date().toISOString(),
    ...payload,
  });

  if (level === "error") {
    console.error(message);
    return;
  }

  console.info(message);
}

export function logError(event: string, payload: Record<string, unknown>) {
  log("error", event, payload);
}

export function logInfo(event: string, payload: Record<string, unknown>) {
  log("info", event, payload);
}

export function parseClientErrorTelemetryPayload(
  value: unknown,
): ClientErrorTelemetryPayload | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Record<string, unknown>;
  const type = candidate.type;
  const message = candidate.message;

  if (
    (type !== "error" && type !== "unhandledrejection") ||
    typeof message !== "string"
  ) {
    return null;
  }

  return {
    colno:
      typeof candidate.colno === "number" ? Math.trunc(candidate.colno) : undefined,
    lineno:
      typeof candidate.lineno === "number" ? Math.trunc(candidate.lineno) : undefined,
    message: limit(message, MAX_MESSAGE_LENGTH),
    pathname:
      typeof candidate.pathname === "string"
        ? limit(candidate.pathname, MAX_PATH_LENGTH)
        : undefined,
    source:
      typeof candidate.source === "string"
        ? limit(candidate.source, MAX_SOURCE_LENGTH)
        : undefined,
    type,
  };
}

export function sanitizeUserAgent(value?: string | null) {
  if (!value) {
    return undefined;
  }

  return limit(value, MAX_USER_AGENT_LENGTH);
}
