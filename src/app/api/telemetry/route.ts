import { after, NextResponse } from "next/server";

import {
  logError,
  parseClientErrorTelemetryPayload,
  sanitizeUserAgent,
} from "@/lib/telemetry";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const payload = parseClientErrorTelemetryPayload(body);

  if (!payload) {
    return new NextResponse(null, { status: 204 });
  }

  const userAgent = sanitizeUserAgent(request.headers.get("user-agent"));

  after(() => {
    logError("client_runtime_error", {
      ...payload,
      userAgent,
    });
  });

  return new NextResponse(null, { status: 204 });
}
