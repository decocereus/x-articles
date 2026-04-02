export const EXTRACTOR_TABS = [
  { value: "markdown", label: "For agent" },
  { value: "text", label: "Text" },
  { value: "json", label: "JSON" },
] as const;

export type ExtractorTabValue = (typeof EXTRACTOR_TABS)[number]["value"];

export const DEFAULT_EXTRACTOR_TAB: ExtractorTabValue = "markdown";

export const COPY_RESET_DELAY_MS = 1_800;

export const OSS_REPO_URL = "https://github.com/decocereus/xtract";
export const X_PROFILE_URL = "https://x.com/decocereus";

export const EXTRACTOR_URL_PLACEHOLDER =
  "Paste an X post or X article URL";

export const EMPTY_URL_MESSAGE =
  "Paste a public article or X post URL to extract it.";
export const DEFAULT_EXTRACTION_ERROR_MESSAGE =
  "We couldn't extract that URL yet.";
export const INTERNAL_RESPONSE_ERROR_MESSAGE =
  "The server hit an internal error while extracting this URL.";
export const NETWORK_ERROR_MESSAGE =
  "The extractor could not reach the server. Try again in a moment.";
export const UNEXPECTED_RESPONSE_ERROR_MESSAGE =
  "The extractor returned an unexpected response for this URL.";
