type ThemeMode = "dark" | "light";

type ViewTransitionHandle = {
  finished: Promise<void>;
};

type DocumentWithViewTransition = Document & {
  startViewTransition?: (
    callback: () => void | Promise<void>,
  ) => ViewTransitionHandle;
};

type ThemeTransitionGeometry = {
  originX: number;
  originY: number;
  radius: number;
};

const themeTransitionStyleKeys = [
  "--theme-transition-x",
  "--theme-transition-y",
  "--theme-transition-radius",
] as const;

export function applyTheme(root: HTMLElement, nextTheme: ThemeMode) {
  root.classList.toggle("dark", nextTheme === "dark");
  root.style.colorScheme = nextTheme;
}

export function clearThemeTransitionStyles(root: HTMLElement) {
  for (const styleKey of themeTransitionStyleKeys) {
    root.style.removeProperty(styleKey);
  }
}

export function getNextTheme(root: HTMLElement): ThemeMode {
  return root.classList.contains("dark") ? "light" : "dark";
}

export function getThemeTransitionGeometry(
  button: HTMLElement,
  event: Pick<MouseEvent, "clientX" | "clientY">,
): ThemeTransitionGeometry {
  const rect = button.getBoundingClientRect();
  const originX = event.clientX === 0 ? rect.left + rect.width / 2 : event.clientX;
  const originY = event.clientY === 0 ? rect.top + rect.height / 2 : event.clientY;
  const maxX = Math.max(originX, window.innerWidth - originX);
  const maxY = Math.max(originY, window.innerHeight - originY);

  return {
    originX,
    originY,
    radius: Math.hypot(maxX, maxY),
  };
}

export function getViewTransition(documentRef: Document) {
  return (documentRef as DocumentWithViewTransition).startViewTransition;
}

export function setThemeTransitionStyles(
  root: HTMLElement,
  geometry: ThemeTransitionGeometry,
) {
  root.style.setProperty("--theme-transition-x", `${geometry.originX}px`);
  root.style.setProperty("--theme-transition-y", `${geometry.originY}px`);
  root.style.setProperty(
    "--theme-transition-radius",
    `${geometry.radius}px`,
  );
}

export function shouldReduceThemeMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
