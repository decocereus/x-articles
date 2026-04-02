import { headers } from "next/headers";

export const APP_NAME = "xtract";
export const APP_DESCRIPTION =
  "Paste a public X post or article URL and get clean, agent-ready markdown in one click.";
export const APP_X_HANDLE = "@decocereus";
export const APP_REPOSITORY_URL = "https://github.com/decocereus/xtract";

const SITE_URL_ENV_KEYS = [
  "NEXT_PUBLIC_SITE_URL",
  "SITE_URL",
  "VERCEL_PROJECT_PRODUCTION_URL",
  "VERCEL_URL",
] as const;
const LOCAL_DEV_SITE_URL = "http://localhost:3000/";

export const APP_KEYWORDS = [
  "x extractor",
  "x post extractor",
  "x article extractor",
  "article to markdown",
  "web article extractor",
  "agent-ready markdown",
];

function getSiteUrlFromEnv() {
  for (const key of SITE_URL_ENV_KEYS) {
    const value = process.env[key];

    if (value) {
      return value;
    }
  }

  return undefined;
}

function normalizeSiteUrl(rawUrl: string) {
  const normalizedUrl =
    rawUrl.startsWith("http://") || rawUrl.startsWith("https://")
      ? rawUrl
      : `https://${rawUrl}`;

  try {
    const url = new URL(normalizedUrl);
    url.pathname = "/";
    url.search = "";
    url.hash = "";
    return url;
  } catch {
    return undefined;
  }
}

export function getSiteUrl() {
  const rawUrl =
    getSiteUrlFromEnv() ??
    (process.env.NODE_ENV === "production" ? undefined : LOCAL_DEV_SITE_URL);

  if (!rawUrl) {
    return undefined;
  }

  return normalizeSiteUrl(rawUrl);
}

export function getAbsoluteUrl(path = "/") {
  const siteUrl = getSiteUrl();

  if (!siteUrl) {
    return undefined;
  }

  return new URL(path, siteUrl).toString();
}

export async function getRequestSiteUrl() {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");

  if (!host) {
    return undefined;
  }

  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") || host.startsWith("127.0.0.1")
      ? "http"
      : "https");

  return normalizeSiteUrl(`${protocol}://${host}`);
}

export async function resolveSiteUrl() {
  return getSiteUrl() ?? (await getRequestSiteUrl());
}

export async function resolveAbsoluteUrl(path = "/") {
  const absoluteUrl = getAbsoluteUrl(path);

  if (absoluteUrl) {
    return absoluteUrl;
  }

  const siteUrl = await resolveSiteUrl();

  if (!siteUrl) {
    return undefined;
  }

  return new URL(path, siteUrl).toString();
}
