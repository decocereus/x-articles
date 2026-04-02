"use client";

import {
  startTransition,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { prepareWithSegments } from "@chenglou/pretext";
import { motion, useReducedMotion, type PanInfo } from "motion/react";
import { useTheme } from "next-themes";

import { manuscriptDisplay } from "@/lib/fonts";
import {
  buildSceneLayout,
  getArtBounds,
  getArtDimensions,
  splitDecoratedLead,
  type ArtPosition,
  type BlockRect,
  type SceneLayout,
} from "@/lib/pretext-scene-layout";
import {
  SCENE_CONFIGS,
  clamp,
  parseAsciiArt,
  type SceneThemeMode,
  type SceneVariant,
} from "@/lib/pretext-scene";
import { cn } from "@/lib/utils";

type SceneViewportProps = {
  className?: string;
  isActive: boolean;
  value: string;
  variant: SceneVariant;
};

type SceneArtProps = {
  artHeight: number;
  artLeft: number;
  artTop: number;
  artWidth: number;
  motionEnabled: boolean;
  onPan: (
    event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => void;
  onPanEnd: () => void;
  onPanStart: () => void;
  onReset: () => void;
};

function ManuscriptDragon({
  artHeight,
  artLeft,
  motionEnabled,
  artTop,
  artWidth,
  onPan,
  onPanEnd,
  onPanStart,
  onReset,
}: SceneArtProps) {
  const shellStyle = {
    height: artHeight,
    left: artLeft,
    top: artTop,
    width: artWidth,
  } as CSSProperties;
  const emberOffsets = [
    [0, 0, 0.88],
    [14, -10, 0.78],
    [28, 8, 0.72],
    [44, -5, 0.84],
    [58, 6, 0.68],
    [72, -12, 0.58],
  ] as const;

  return (
    <motion.div
      aria-hidden="true"
      className="scene-dragon"
      style={shellStyle}
      onDoubleClick={onReset}
      onPan={onPan}
      onPanEnd={onPanEnd}
      onPanStart={onPanStart}
      animate={
        motionEnabled
          ? {
              rotate: [-14, -11.5, -14],
              y: [0, -3, 0],
            }
          : {
              rotate: -14,
              y: 0,
            }
      }
      transition={
        motionEnabled
          ? {
              duration: 5.8,
              ease: "easeInOut",
              repeat: Number.POSITIVE_INFINITY,
            }
          : { duration: 0 }
      }
    >
      <svg
        className="scene-dragon-svg"
        viewBox="0 0 760 430"
        preserveAspectRatio="xMidYMid meet"
      >
        <motion.g
          className="scene-dragon-wing scene-dragon-wing--rear"
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
          animate={
            motionEnabled
              ? {
                  rotate: [0, 2.5, 0],
                  y: [0, 2, 0],
                }
              : {
                  rotate: 0,
                  y: 0,
                }
          }
          transition={
            motionEnabled
              ? {
                  duration: 3.4,
                  ease: "easeInOut",
                  repeat: Number.POSITIVE_INFINITY,
                }
              : { duration: 0 }
          }
        >
          <path
            d="M291 213 C264 171 231 138 204 124 C180 112 156 114 142 129 C129 143 130 165 147 178 C165 192 194 196 221 197 C242 197 265 202 291 213 Z"
            fill="currentColor"
          />
        </motion.g>
        <motion.g
          className="scene-dragon-wing scene-dragon-wing--front"
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
          animate={
            motionEnabled
              ? {
                  rotate: [0, -5, 0],
                  y: [0, -3, 0],
                }
              : {
                  rotate: 0,
                  y: 0,
                }
          }
          transition={
            motionEnabled
              ? {
                  duration: 2.8,
                  ease: "easeInOut",
                  repeat: Number.POSITIVE_INFINITY,
                }
              : { duration: 0 }
          }
        >
          <path
            d="M313 206 C330 164 362 126 396 101 C428 77 464 70 486 85 C503 96 507 118 496 136 C485 152 462 166 437 179 C409 193 364 204 313 206 Z"
            fill="currentColor"
          />
        </motion.g>
        <motion.g
          className="scene-dragon-body"
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
          animate={
            motionEnabled
              ? {
                  rotate: [0.4, -0.6, 0.4],
                  x: [0, 1.5, 0],
                }
              : {
                  rotate: 0,
                  x: 0,
                }
          }
          transition={
            motionEnabled
              ? {
                  duration: 5.2,
                  ease: "easeInOut",
                  repeat: Number.POSITIVE_INFINITY,
                }
              : { duration: 0 }
          }
        >
          <path
            d="M102 316 C74 348 58 376 64 400 C68 415 83 414 90 391 C99 363 108 333 132 308 C162 276 208 253 262 235 C315 218 362 205 418 181 C474 157 532 127 594 124 C622 123 646 130 661 145 C678 162 679 182 671 198 C664 211 651 220 632 223 C608 228 589 225 574 214 C565 207 564 198 570 191 C579 181 594 183 604 193 C611 199 625 200 633 193 C642 185 640 172 628 162 C613 150 584 149 553 160 C515 174 474 205 439 226 C404 247 360 264 309 279 C244 299 188 322 151 349 C131 365 118 347 102 316 Z"
            fill="currentColor"
          />
        </motion.g>
        <path
          d="M246 223 C221 238 202 259 189 286 C176 314 170 341 166 367"
          fill="none"
          stroke="var(--scene-paper-line)"
          strokeLinecap="round"
          strokeWidth="5"
        />
        <path
          d="M318 208 C334 196 353 186 372 178 C400 166 428 150 449 127"
          fill="none"
          stroke="var(--scene-paper-line)"
          strokeLinecap="round"
          strokeWidth="5"
        />
        <path
          d="M332 218 C352 234 367 252 375 271"
          fill="none"
          stroke="var(--scene-paper-line)"
          strokeLinecap="round"
          strokeWidth="4"
        />
        <path
          d="M561 165 C584 152 616 151 634 164 C648 174 651 190 640 202 C630 213 607 216 589 208"
          fill="none"
          stroke="var(--scene-paper-line)"
          strokeLinecap="round"
          strokeWidth="4"
        />
        <path
          d="M106 316 C94 296 88 269 93 244 C98 221 111 201 130 188"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="14"
        />
        <path
          d="M144 347 C132 362 127 381 129 398"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="11"
        />
        <circle cx="617" cy="183" r="6" fill="var(--scene-accent)" />
      </svg>

      <motion.div
        className="scene-dragon-fire"
        animate={
          motionEnabled
            ? {
                x: [0, 6, 0],
                opacity: [0.82, 1, 0.82],
              }
            : {
                x: 0,
                opacity: 0.9,
              }
        }
        transition={
          motionEnabled
            ? {
                duration: 2.4,
                ease: "easeInOut",
                repeat: Number.POSITIVE_INFINITY,
              }
            : { duration: 0 }
        }
      >
        {emberOffsets.map(([left, top, scale], index) => (
          <motion.span
            key={`${left}-${top}-${index}`}
            className="scene-dragon-ember"
            style={{
              left: `calc(83% + ${left}px)`,
              opacity: scale,
              top: `calc(31% + ${top}px)`,
              transform: `rotate(${index % 2 === 0 ? -18 : 14}deg) scale(${scale})`,
            }}
            animate={
              motionEnabled
                ? {
                    scale: [scale, scale * 1.14, scale],
                    y: [0, index % 2 === 0 ? -5 : 4, 0],
                  }
                : {
                    scale,
                    y: 0,
                  }
            }
            transition={{
              duration: 1.6 + index * 0.12,
              ease: "easeInOut",
              repeat: motionEnabled ? Number.POSITIVE_INFINITY : 0,
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}

function CodexRelic({
  artHeight,
  artLeft,
  motionEnabled,
  artTop,
  artWidth,
  onPan,
  onPanEnd,
  onPanStart,
  onReset,
}: SceneArtProps) {
  return (
    <motion.div
      aria-hidden="true"
      className="scene-codex"
      style={{
        height: artHeight,
        left: artLeft,
        top: artTop,
        width: artWidth,
      }}
      onDoubleClick={onReset}
      onPan={onPan}
      onPanEnd={onPanEnd}
      onPanStart={onPanStart}
      animate={
        motionEnabled
          ? {
              rotate: [-5, -2.5, -5],
              y: [0, -3, 0],
            }
          : {
              rotate: -5,
              y: 0,
            }
      }
      transition={
        motionEnabled
          ? {
              duration: 6.2,
              ease: "easeInOut",
              repeat: Number.POSITIVE_INFINITY,
            }
          : { duration: 0 }
      }
    >
      <svg
        className="scene-codex-svg"
        viewBox="0 0 420 290"
        preserveAspectRatio="xMidYMid meet"
      >
        <motion.g
          className="scene-codex-shell"
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
          animate={
            motionEnabled
              ? {
                  rotate: [0, 1.4, 0],
                }
              : {
                  rotate: 0,
                }
          }
          transition={
            motionEnabled
              ? {
                  duration: 4.8,
                  ease: "easeInOut",
                  repeat: Number.POSITIVE_INFINITY,
                }
              : { duration: 0 }
          }
        >
          <rect
            x="46"
            y="54"
            width="274"
            height="180"
            rx="28"
            fill="currentColor"
          />
          <rect
            x="82"
            y="82"
            width="210"
            height="124"
            rx="18"
            fill="none"
            stroke="var(--scene-paper-line)"
            strokeWidth="7"
          />
          <path
            d="M330 86 L366 118 L366 194 L330 224 Z"
            fill="currentColor"
          />
          <path
            d="M324 112 L354 132"
            fill="none"
            stroke="var(--scene-paper-line)"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M324 166 L354 184"
            fill="none"
            stroke="var(--scene-paper-line)"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </motion.g>
        <motion.g
          className="scene-codex-glyph"
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
          animate={
            motionEnabled
              ? {
                  scale: [1, 1.04, 1],
                  opacity: [0.92, 1, 0.92],
                }
              : {
                  scale: 1,
                  opacity: 0.96,
                }
          }
          transition={{
            duration: 4.4,
            ease: "easeInOut",
            repeat: motionEnabled ? Number.POSITIVE_INFINITY : 0,
          }}
        >
          <path
            d="M132 144 H242"
            fill="none"
            stroke="var(--scene-paper-line)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M132 118 H226"
            fill="none"
            stroke="var(--scene-paper-line)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M132 170 H212"
            fill="none"
            stroke="var(--scene-paper-line)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <circle cx="268" cy="144" r="13" fill="var(--scene-accent)" />
        </motion.g>
      </svg>
    </motion.div>
  );
}

function JsonCore({
  artHeight,
  artLeft,
  motionEnabled,
  artTop,
  artWidth,
  onPan,
  onPanEnd,
  onPanStart,
  onReset,
}: SceneArtProps) {
  return (
    <motion.div
      aria-hidden="true"
      className="scene-core"
      style={{
        height: artHeight,
        left: artLeft,
        top: artTop,
        width: artWidth,
      }}
      onDoubleClick={onReset}
      onPan={onPan}
      onPanEnd={onPanEnd}
      onPanStart={onPanStart}
      animate={
        motionEnabled
          ? {
              scale: [1, 1.025, 1],
              y: [0, -2, 0],
            }
          : {
              scale: 1,
              y: 0,
            }
      }
      transition={{
        duration: 5.2,
        ease: "easeInOut",
        repeat: motionEnabled ? Number.POSITIVE_INFINITY : 0,
      }}
    >
      <svg
        className="scene-core-svg"
        viewBox="0 0 340 320"
        preserveAspectRatio="xMidYMid meet"
      >
        <circle
          className="scene-core-ring"
          cx="170"
          cy="160"
          r="96"
          fill="none"
          stroke="currentColor"
          strokeWidth="14"
        />
        <motion.g
          style={{ transformOrigin: "170px 160px" }}
          animate={motionEnabled ? { rotate: 360 } : { rotate: 0 }}
          transition={{
            duration: 13,
            ease: "linear",
            repeat: motionEnabled ? Number.POSITIVE_INFINITY : 0,
          }}
        >
          <circle
            className="scene-core-ring scene-core-ring--inner"
            cx="170"
            cy="160"
            r="56"
            fill="none"
            stroke="var(--scene-paper-line)"
            strokeWidth="10"
            strokeDasharray="14 20"
          />
        </motion.g>
        <rect
          x="126"
          y="116"
          width="88"
          height="88"
          rx="18"
          fill="currentColor"
        />
        <path
          d="M146 158 h14 a12 12 0 0 1 0 24 h-14"
          fill="none"
          stroke="var(--scene-paper-line)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M194 158 h-14 a12 12 0 0 0 0 24 h14"
          fill="none"
          stroke="var(--scene-paper-line)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          className="scene-core-node"
          cx="170"
          cy="54"
          r="11"
          fill="var(--scene-accent)"
        />
        <motion.g
          style={{ transformOrigin: "170px 160px" }}
          animate={motionEnabled ? { rotate: 360 } : { rotate: 0 }}
          transition={{
            duration: 9,
            ease: "linear",
            repeat: motionEnabled ? Number.POSITIVE_INFINITY : 0,
          }}
        >
          <circle
            className="scene-core-node scene-core-node--orbit"
            cx="270"
            cy="160"
            r="10"
            fill="var(--scene-accent)"
          />
        </motion.g>
      </svg>
    </motion.div>
  );
}

export function PretextScene({
  className,
  isActive,
  value,
  variant,
}: SceneViewportProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const currentLayoutRef = useRef<SceneLayout | null>(null);
  const dragOriginRef = useRef<ArtPosition | null>(null);
  const [layout, setLayout] = useState<SceneLayout | null>(null);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [scrollTop, setScrollTop] = useState(0);
  const [fontVersion, setFontVersion] = useState(0);
  const [artPosition, setArtPosition] = useState<ArtPosition | null>(null);
  const [isDraggingArt, setIsDraggingArt] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const { resolvedTheme } = useTheme();
  const isBrowser = typeof window !== "undefined";
  const themeMode: SceneThemeMode =
    resolvedTheme === "dark" ? "dark" : "light";
  const config = SCENE_CONFIGS[variant];
  const theme = config.themes[themeMode];
  const isManuscript = config.initialMode === "manuscript";
  const isCompact = viewportSize.width > 0 && viewportSize.width < 560;
  const typography = isCompact ? config.compact : config.desktop;
  const decoratedLead = useMemo(
    () => (isManuscript ? splitDecoratedLead(value) : { initial: null, remainder: value }),
    [isManuscript, value],
  );
  const initialFont = isManuscript
    ? `400 ${isCompact ? 68 : 96}px ${manuscriptDisplay.style.fontFamily}, serif`
    : typography.textFont;
  const sceneStyle = {
    "--scene-accent": theme.accent,
    "--scene-art-glow": theme.artGlow,
    "--scene-art-ink": theme.artInk,
    "--scene-badge": theme.badge,
    "--scene-bg-end": theme.backgroundEnd,
    "--scene-bg-start": theme.backgroundStart,
    "--scene-grid": theme.grid,
    "--scene-haze": theme.haze,
    "--scene-line-muted": theme.lineMuted,
    "--scene-line": theme.lineColor,
    "--scene-paper-line":
      themeMode === "dark"
        ? "rgba(229, 232, 237, 0.84)"
        : "rgba(241, 235, 225, 0.92)",
  } as CSSProperties;

  useEffect(() => {
    currentLayoutRef.current = layout;
  }, [layout]);

  useEffect(() => {
    if (!isBrowser || viewportRef.current === null) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];

      if (!entry) {
        return;
      }

      const nextWidth = Math.round(entry.contentRect.width);
      const nextHeight = Math.round(entry.contentRect.height);

      setViewportSize((current) =>
        current.width === nextWidth && current.height === nextHeight
          ? current
          : {
              width: nextWidth,
              height: nextHeight,
            },
      );
    });

    observer.observe(viewportRef.current);

    return () => observer.disconnect();
  }, [isBrowser]);

  useEffect(() => {
    if (!isBrowser || !("fonts" in document)) {
      return;
    }

    let cancelled = false;

    document.fonts.ready.then(() => {
      if (!cancelled) {
        setFontVersion((current) => current + 1);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isBrowser]);

  const prepared = useMemo(() => {
    if (!isBrowser) {
      return null;
    }

    void fontVersion;

    try {
      return prepareWithSegments(decoratedLead.remainder, typography.textFont, {
        whiteSpace: "pre-wrap",
      });
    } catch {
      return null;
    }
  }, [decoratedLead.remainder, fontVersion, isBrowser, typography.textFont]);

  const initialWidth = useMemo(() => {
    if (!isBrowser || decoratedLead.initial === null) {
      return null;
    }

    void fontVersion;

    try {
      const preparedGlyph = prepareWithSegments(decoratedLead.initial, initialFont);
      return preparedGlyph.widths[0] ?? (isCompact ? 42 : 58);
    } catch {
      return isCompact ? 42 : 58;
    }
  }, [decoratedLead.initial, fontVersion, initialFont, isBrowser, isCompact]);

  const artMask = useMemo(() => parseAsciiArt(theme.ascii), [theme.ascii]);

  const artCellWidth = useMemo(() => {
    if (!isBrowser) {
      return null;
    }

    void fontVersion;

    try {
      const preparedGlyph = prepareWithSegments("M", typography.artFont);
      return preparedGlyph.widths[0] ?? typography.artLineHeight * 0.64;
    } catch {
      return typography.artLineHeight * 0.64;
    }
  }, [fontVersion, isBrowser, typography.artFont, typography.artLineHeight]);

  const artSize = useMemo(() => {
    if (viewportSize.width === 0 || artCellWidth === null) {
      return null;
    }

    return getArtDimensions({
      artCellWidth,
      artMask,
      config,
      isCompact,
      typography,
      viewportWidth: viewportSize.width,
    });
  }, [
    artCellWidth,
    artMask,
    config,
    isCompact,
    typography,
    viewportSize.width,
  ]);

  const shouldAnimateScene =
    isActive &&
    isBrowser &&
    !prefersReducedMotion &&
    scrollTop < Math.max(360, viewportSize.height * 0.7);
  const shouldAutoDrift = shouldAnimateScene && artPosition === null && !isDraggingArt;
  const shouldAnimateArt = shouldAnimateScene && !isDraggingArt;
  const blockedRects = useMemo(() => {
    if (!isManuscript || decoratedLead.initial === null || initialWidth === null) {
      return [] as BlockRect[];
    }

    const lineSpan = isCompact ? 3.6 : 4.2;

    return [
      {
        bottom: typography.paddingTop + typography.lineHeight * lineSpan,
        left: typography.paddingX - 6,
        right: typography.paddingX + initialWidth + (isCompact ? 16 : 22),
        top: typography.paddingTop - 8,
      },
    ];
  }, [
    decoratedLead.initial,
    initialWidth,
    isCompact,
    isManuscript,
    typography.lineHeight,
    typography.paddingTop,
    typography.paddingX,
  ]);

  const handleArtPanStart = () => {
    const currentLayout = currentLayoutRef.current;

    if (!currentLayout) {
      return;
    }

    dragOriginRef.current = {
      left: currentLayout.artLeft,
      top: currentLayout.artTop,
    };
    setIsDraggingArt(true);
  };

  const handleArtPan = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    const origin = dragOriginRef.current;

    if (
      origin === null ||
      artSize === null ||
      viewportSize.width === 0 ||
      viewportSize.height === 0
    ) {
      return;
    }

    const bounds = getArtBounds({
      artHeight: artSize.artHeight,
      artWidth: artSize.artWidth,
      isCompact,
      mode: "drag",
      typography,
      viewportHeight: viewportSize.height,
      viewportWidth: viewportSize.width,
    });

    setArtPosition({
      left: clamp(origin.left + info.offset.x, bounds.minLeft, bounds.maxLeft),
      top: clamp(origin.top + info.offset.y, bounds.minTop, bounds.maxTop),
    });
  };

  const handleArtPanEnd = () => {
    dragOriginRef.current = null;
    setIsDraggingArt(false);
  };

  const resetArtPosition = () => {
    dragOriginRef.current = null;
    setArtPosition(null);
    setIsDraggingArt(false);
  };

  useEffect(() => {
    if (
      prepared === null ||
      artCellWidth === null ||
      viewportSize.width === 0 ||
      viewportSize.height === 0
    ) {
      return;
    }

    let frameId = 0;
    let cancelled = false;
    let lastTick = -Infinity;

    const render = (nowMs: number) => {
      if (cancelled) {
        return;
      }

      if (shouldAutoDrift && nowMs - lastTick < 84) {
        frameId = window.requestAnimationFrame(render);
        return;
      }

      lastTick = nowMs;

      const nextLayout = buildSceneLayout({
        artCellWidth,
        artMask,
        nowMs: shouldAutoDrift ? nowMs : 0,
        positionOverride: artPosition,
        prepared,
        variant,
        blockedRects,
        viewportHeight: viewportSize.height,
        viewportWidth: viewportSize.width,
      });

      startTransition(() => {
        if (!cancelled) {
          setLayout(nextLayout);
        }
      });

      if (shouldAutoDrift) {
        frameId = window.requestAnimationFrame(render);
      }
    };

    render(window.performance.now());

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(frameId);
    };
  }, [
    artCellWidth,
    artMask,
    artPosition,
    blockedRects,
    prepared,
    shouldAutoDrift,
    variant,
    viewportSize.height,
    viewportSize.width,
  ]);

  return (
    <div
      className={cn("scene-shell h-full", `scene-shell--${variant}`, className)}
      style={sceneStyle}
    >
      <div
        ref={viewportRef}
        className="scene-viewport"
        onScroll={(event) => {
          startTransition(() => {
            setScrollTop(event.currentTarget.scrollTop);
          });
        }}
      >
        {layout === null ? (
          <pre
            className="scene-fallback"
            style={{
              font: typography.textFont,
              lineHeight: `${typography.lineHeight}px`,
            }}
          >
            {value}
          </pre>
        ) : (
          <div
            className="scene-content"
            style={{ height: layout.contentHeight }}
          >
            <div className="scene-overlay" aria-hidden="true" />
            <div className="scene-meta" aria-hidden="true">
              <div className="scene-meta-stack">
                {config.metaMode === "minimal" ? (
                  <p className="scene-rubric">{theme.title}</p>
                ) : config.metaMode === "none" ? null : (
                  <>
                    <span className="scene-badge">{theme.title}</span>
                    <p className="scene-kicker">
                      {config.label} scene
                      <span className="scene-divider" />
                      {theme.kicker}
                    </p>
                  </>
                )}
              </div>
            </div>

            {config.artMode === "dragon" ? (
              <ManuscriptDragon
                artHeight={layout.artHeight}
                artLeft={layout.artLeft}
                motionEnabled={shouldAnimateArt}
                onPan={handleArtPan}
                onPanEnd={handleArtPanEnd}
                onPanStart={handleArtPanStart}
                onReset={resetArtPosition}
                artTop={layout.artTop}
                artWidth={layout.artWidth}
              />
            ) : config.artMode === "codex" ? (
              <CodexRelic
                artHeight={layout.artHeight}
                artLeft={layout.artLeft}
                motionEnabled={shouldAnimateArt}
                onPan={handleArtPan}
                onPanEnd={handleArtPanEnd}
                onPanStart={handleArtPanStart}
                onReset={resetArtPosition}
                artTop={layout.artTop}
                artWidth={layout.artWidth}
              />
            ) : config.artMode === "core" ? (
              <JsonCore
                artHeight={layout.artHeight}
                artLeft={layout.artLeft}
                motionEnabled={shouldAnimateArt}
                onPan={handleArtPan}
                onPanEnd={handleArtPanEnd}
                onPanStart={handleArtPanStart}
                onReset={resetArtPosition}
                artTop={layout.artTop}
                artWidth={layout.artWidth}
              />
            ) : (
              <pre
                aria-hidden="true"
                className="scene-art"
                style={{
                  font: typography.artFont,
                  left: layout.artLeft,
                  lineHeight: `${typography.artLineHeight}px`,
                  top: layout.artTop,
                }}
              >
                {artMask.rows.join("\n")}
              </pre>
            )}

            {isManuscript && decoratedLead.initial !== null ? (
              <div
                aria-hidden="true"
                className="scene-initial"
                data-shadow={decoratedLead.initial}
                style={{
                  font: initialFont,
                  left: typography.paddingX - (isCompact ? 2 : 4),
                  top: typography.paddingTop - (isCompact ? 16 : 24),
                }}
              >
                {decoratedLead.initial}
              </div>
            ) : null}

            {layout.fragments.map((fragment) => (
              <div
                key={fragment.id}
                dir="auto"
                className={cn("scene-line", isManuscript && "scene-line--manuscript")}
                style={{
                  font: typography.textFont,
                  left: fragment.left,
                  lineHeight: `${typography.lineHeight}px`,
                  top: fragment.top,
                  width: fragment.width,
                }}
              >
                {fragment.text}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
