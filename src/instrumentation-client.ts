import {
  getErrorMessage,
  reportClientError,
} from "@/lib/client-error-reporting";

function getSourcePath(filename?: string) {
  if (!filename) {
    return undefined;
  }

  try {
    return new URL(filename).pathname;
  } catch {
    return filename;
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("error", (event) => {
    reportClientError({
      colno: event.colno,
      lineno: event.lineno,
      message: event.message || getErrorMessage(event.error),
      pathname: window.location.pathname,
      source: getSourcePath(event.filename),
      type: "error",
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    reportClientError({
      message: getErrorMessage(event.reason),
      pathname: window.location.pathname,
      type: "unhandledrejection",
    });
  });
}
