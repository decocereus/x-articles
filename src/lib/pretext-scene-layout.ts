import {
  layoutNextLine,
  type LayoutCursor,
  type PreparedTextWithSegments,
} from "@chenglou/pretext";

import {
  SCENE_CONFIGS,
  carveTextLineSlots,
  clamp,
  mergeIntervals,
  type AsciiMask,
  type Interval,
  type SceneVariant,
} from "@/lib/pretext-scene";

export type SceneFragment = {
  id: string;
  left: number;
  top: number;
  width: number;
  text: string;
};

export type SceneLayout = {
  fragments: SceneFragment[];
  artLeft: number;
  artTop: number;
  artWidth: number;
  artHeight: number;
  contentHeight: number;
};

export type ArtPosition = {
  left: number;
  top: number;
};

export type BlockRect = {
  bottom: number;
  left: number;
  right: number;
  top: number;
};

type Ellipse = {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
};

function sameCursor(left: LayoutCursor, right: LayoutCursor) {
  return (
    left.segmentIndex === right.segmentIndex &&
    left.graphemeIndex === right.graphemeIndex
  );
}

function getGraphemeSegmenter() {
  return typeof Intl !== "undefined" && "Segmenter" in Intl
    ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
    : null;
}

export function splitDecoratedLead(text: string) {
  const letterMatch = text.match(/\p{Letter}/u);

  if (!letterMatch || letterMatch.index === undefined) {
    return {
      initial: null,
      remainder: text,
    };
  }

  const segmenter = getGraphemeSegmenter();
  const letterIndex = letterMatch.index;

  if (segmenter === null) {
    const initial = letterMatch[0];

    return {
      initial,
      remainder:
        text.slice(0, letterIndex) + text.slice(letterIndex + initial.length),
    };
  }

  let consumed = 0;

  for (const item of segmenter.segment(text)) {
    const { segment } = item;
    const nextConsumed = consumed + segment.length;

    if (letterIndex >= consumed && letterIndex < nextConsumed) {
      return {
        initial: segment,
        remainder: text.slice(0, consumed) + text.slice(nextConsumed),
      };
    }

    consumed = nextConsumed;
  }

  return {
    initial: letterMatch[0],
    remainder:
      text.slice(0, letterIndex) +
      text.slice(letterIndex + letterMatch[0].length),
  };
}

function getBlockedIntervalsForBand(
  mask: AsciiMask,
  artLeft: number,
  artTop: number,
  artCellWidth: number,
  artLineHeight: number,
  bandTop: number,
  bandBottom: number,
  paddingX: number,
  paddingY: number,
) {
  const sampleTop = bandTop - paddingY;
  const sampleBottom = bandBottom + paddingY;

  if (
    sampleBottom <= artTop ||
    sampleTop >= artTop + mask.heightRows * artLineHeight
  ) {
    return [];
  }

  const startRow = clamp(
    Math.floor((sampleTop - artTop) / artLineHeight),
    0,
    mask.heightRows - 1,
  );
  const endRow = clamp(
    Math.ceil((sampleBottom - artTop) / artLineHeight) - 1,
    0,
    mask.heightRows - 1,
  );
  const intervals: Interval[] = [];

  for (let rowIndex = startRow; rowIndex <= endRow; rowIndex += 1) {
    const rowRuns = mask.rowRuns[rowIndex]!;

    for (let runIndex = 0; runIndex < rowRuns.length; runIndex += 1) {
      const run = rowRuns[runIndex]!;

      intervals.push({
        left: artLeft + run.start * artCellWidth - paddingX,
        right: artLeft + run.end * artCellWidth + paddingX,
      });
    }
  }

  return mergeIntervals(intervals);
}

function getRectIntervalsForBand(
  rects: BlockRect[],
  bandTop: number,
  bandBottom: number,
) {
  const intervals: Interval[] = [];

  for (let index = 0; index < rects.length; index += 1) {
    const rect = rects[index]!;

    if (bandBottom <= rect.top || bandTop >= rect.bottom) {
      continue;
    }

    intervals.push({
      left: rect.left,
      right: rect.right,
    });
  }

  return intervals;
}

function ellipseIntervalForBand(
  ellipse: Ellipse,
  bandTop: number,
  bandBottom: number,
  paddingX: number,
  paddingY: number,
) {
  const top = bandTop - paddingY;
  const bottom = bandBottom + paddingY;

  if (bottom <= ellipse.cy - ellipse.ry || top >= ellipse.cy + ellipse.ry) {
    return null;
  }

  const minDy =
    ellipse.cy >= top && ellipse.cy <= bottom
      ? 0
      : ellipse.cy < top
        ? top - ellipse.cy
        : ellipse.cy - bottom;

  if (minDy >= ellipse.ry) {
    return null;
  }

  const normalized = 1 - (minDy * minDy) / (ellipse.ry * ellipse.ry);
  const maxDx = ellipse.rx * Math.sqrt(normalized);

  return {
    left: ellipse.cx - maxDx - paddingX,
    right: ellipse.cx + maxDx + paddingX,
  } satisfies Interval;
}

function getDragonIntervalsForBand(options: {
  artHeight: number;
  artLeft: number;
  artTop: number;
  artWidth: number;
  bandBottom: number;
  bandTop: number;
  paddingX: number;
  paddingY: number;
}) {
  const {
    artHeight,
    artLeft,
    artTop,
    artWidth,
    bandBottom,
    bandTop,
    paddingX,
    paddingY,
  } = options;
  const ellipses: Ellipse[] = [
    {
      cx: artLeft + artWidth * 0.24,
      cy: artTop + artHeight * 0.52,
      rx: artWidth * 0.2,
      ry: artHeight * 0.16,
    },
    {
      cx: artLeft + artWidth * 0.42,
      cy: artTop + artHeight * 0.24,
      rx: artWidth * 0.18,
      ry: artHeight * 0.24,
    },
    {
      cx: artLeft + artWidth * 0.58,
      cy: artTop + artHeight * 0.56,
      rx: artWidth * 0.28,
      ry: artHeight * 0.11,
    },
    {
      cx: artLeft + artWidth * 0.82,
      cy: artTop + artHeight * 0.38,
      rx: artWidth * 0.18,
      ry: artHeight * 0.14,
    },
    {
      cx: artLeft + artWidth * 0.94,
      cy: artTop + artHeight * 0.42,
      rx: artWidth * 0.08,
      ry: artHeight * 0.08,
    },
    {
      cx: artLeft + artWidth * 0.1,
      cy: artTop + artHeight * 0.8,
      rx: artWidth * 0.09,
      ry: artHeight * 0.1,
    },
  ];

  return mergeIntervals(
    ellipses
      .map((ellipse) =>
        ellipseIntervalForBand(
          ellipse,
          bandTop,
          bandBottom,
          paddingX,
          paddingY,
        ),
      )
      .filter((interval): interval is Interval => interval !== null),
  );
}

export function getArtDimensions(options: {
  artCellWidth: number;
  artMask: AsciiMask;
  config: (typeof SCENE_CONFIGS)[SceneVariant];
  isCompact: boolean;
  viewportWidth: number;
  typography: {
    artLineHeight: number;
  };
}) {
  const { artCellWidth, artMask, config, isCompact, viewportWidth, typography } =
    options;

  const artWidth =
    config.artMode !== "ascii" && config.artBox
      ? clamp(
          viewportWidth *
            (isCompact
              ? config.artBox.widthFraction * 0.82
              : config.artBox.widthFraction),
          config.artBox.minWidth * (isCompact ? 0.8 : 1),
          config.artBox.maxWidth * (isCompact ? 0.84 : 1),
        )
      : artMask.widthChars * artCellWidth;
  const artHeight =
    config.artMode !== "ascii" && config.artBox
      ? artWidth / config.artBox.aspectRatio
      : artMask.heightRows * typography.artLineHeight;

  return { artHeight, artWidth };
}

export function getArtBounds(options: {
  artHeight: number;
  artWidth: number;
  isCompact: boolean;
  typography: {
    paddingBottom: number;
    paddingTop: number;
    paddingX: number;
  };
  viewportHeight: number;
  viewportWidth: number;
  mode: "auto" | "drag";
}) {
  const {
    artHeight,
    artWidth,
    isCompact,
    mode,
    typography,
    viewportHeight,
    viewportWidth,
  } = options;
  const minLeft = typography.paddingX + 6;
  const maxLeft = viewportWidth - artWidth - typography.paddingX - 8;
  const minTop = typography.paddingTop + 6;
  const maxTop =
    mode === "drag"
      ? viewportHeight - artHeight - typography.paddingBottom - 10
      : isCompact
        ? 132
        : 176;

  return {
    maxLeft,
    maxTop: Math.max(minTop, maxTop),
    minLeft,
    minTop,
  };
}

function getCodexIntervalsForBand(options: {
  artHeight: number;
  artLeft: number;
  artTop: number;
  artWidth: number;
  bandBottom: number;
  bandTop: number;
  paddingX: number;
  paddingY: number;
}) {
  const {
    artHeight,
    artLeft,
    artTop,
    artWidth,
    bandBottom,
    bandTop,
    paddingX,
    paddingY,
  } = options;

  return mergeIntervals(
    [
      ellipseIntervalForBand(
        {
          cx: artLeft + artWidth * 0.52,
          cy: artTop + artHeight * 0.48,
          rx: artWidth * 0.42,
          ry: artHeight * 0.34,
        },
        bandTop,
        bandBottom,
        paddingX,
        paddingY,
      ),
      ellipseIntervalForBand(
        {
          cx: artLeft + artWidth * 0.77,
          cy: artTop + artHeight * 0.48,
          rx: artWidth * 0.1,
          ry: artHeight * 0.16,
        },
        bandTop,
        bandBottom,
        paddingX,
        paddingY,
      ),
    ].filter((interval): interval is Interval => interval !== null),
  );
}

function getCoreIntervalsForBand(options: {
  artHeight: number;
  artLeft: number;
  artTop: number;
  artWidth: number;
  bandBottom: number;
  bandTop: number;
  paddingX: number;
  paddingY: number;
}) {
  const {
    artHeight,
    artLeft,
    artTop,
    artWidth,
    bandBottom,
    bandTop,
    paddingX,
    paddingY,
  } = options;

  return mergeIntervals(
    [
      ellipseIntervalForBand(
        {
          cx: artLeft + artWidth * 0.5,
          cy: artTop + artHeight * 0.5,
          rx: artWidth * 0.34,
          ry: artHeight * 0.34,
        },
        bandTop,
        bandBottom,
        paddingX,
        paddingY,
      ),
      ellipseIntervalForBand(
        {
          cx: artLeft + artWidth * 0.5,
          cy: artTop + artHeight * 0.5,
          rx: artWidth * 0.5,
          ry: artHeight * 0.12,
        },
        bandTop,
        bandBottom,
        paddingX * 0.5,
        paddingY * 0.6,
      ),
    ].filter((interval): interval is Interval => interval !== null),
  );
}

export function buildSceneLayout(options: {
  artCellWidth: number;
  artMask: AsciiMask;
  blockedRects?: BlockRect[];
  nowMs: number;
  positionOverride?: ArtPosition | null;
  prepared: PreparedTextWithSegments;
  variant: SceneVariant;
  viewportHeight: number;
  viewportWidth: number;
}) {
  const {
    artCellWidth,
    artMask,
    blockedRects = [],
    nowMs,
    positionOverride = null,
    prepared,
    variant,
    viewportHeight,
    viewportWidth,
  } = options;
  const isCompact = viewportWidth < 560;
  const config = SCENE_CONFIGS[variant];
  const typography = isCompact ? config.compact : config.desktop;
  const motionScale = isCompact ? 0.72 : 1;
  const seconds = nowMs / 1000;
  const { artHeight, artWidth } = getArtDimensions({
    artCellWidth,
    artMask,
    config,
    isCompact,
    typography,
    viewportWidth,
  });
  const baseLeft = viewportWidth * config.motion.anchorX - artWidth / 2;
  const baseTop = config.motion.anchorY;
  const autoBounds = getArtBounds({
    artHeight,
    artWidth,
    isCompact,
    mode: "auto",
    typography,
    viewportHeight,
    viewportWidth,
  });
  const dragBounds = getArtBounds({
    artHeight,
    artWidth,
    isCompact,
    mode: "drag",
    typography,
    viewportHeight,
    viewportWidth,
  });
  const artLeft = Math.round(
    clamp(
      positionOverride?.left ??
        (baseLeft +
          Math.sin(seconds * config.motion.speedX + config.motion.phaseX) *
            config.motion.amplitudeX *
            motionScale),
      positionOverride ? dragBounds.minLeft : autoBounds.minLeft,
      positionOverride ? dragBounds.maxLeft : autoBounds.maxLeft,
    ),
  );
  const artTop = Math.round(
    clamp(
      positionOverride?.top ??
        (baseTop +
          Math.cos(seconds * config.motion.speedY + config.motion.phaseY) *
            config.motion.amplitudeY *
            motionScale),
      positionOverride ? dragBounds.minTop : autoBounds.minTop,
      positionOverride ? dragBounds.maxTop : autoBounds.maxTop,
    ),
  );
  const baseSlot = {
    left: typography.paddingX,
    right: viewportWidth - typography.paddingX,
  };
  const wrapMode = config.wrapMode ?? "split";
  const fragments: SceneFragment[] = [];
  let cursor: LayoutCursor = { segmentIndex: 0, graphemeIndex: 0 };
  let lineTop = typography.paddingTop;
  let fragmentCount = 0;
  let safety = 0;

  while (safety < 6000) {
    safety += 1;
    const blocked = mergeIntervals([
      ...(config.artMode === "dragon"
        ? getDragonIntervalsForBand({
            artHeight,
            artLeft,
            artTop,
            artWidth,
            bandBottom: lineTop + typography.lineHeight,
            bandTop: lineTop,
            paddingX: typography.artPaddingX,
            paddingY: typography.artPaddingY,
          })
        : config.artMode === "codex"
          ? getCodexIntervalsForBand({
              artHeight,
              artLeft,
              artTop,
              artWidth,
              bandBottom: lineTop + typography.lineHeight,
              bandTop: lineTop,
              paddingX: typography.artPaddingX,
              paddingY: typography.artPaddingY,
            })
          : config.artMode === "core"
            ? getCoreIntervalsForBand({
                artHeight,
                artLeft,
                artTop,
                artWidth,
                bandBottom: lineTop + typography.lineHeight,
                bandTop: lineTop,
                paddingX: typography.artPaddingX,
                paddingY: typography.artPaddingY,
              })
            : getBlockedIntervalsForBand(
                artMask,
                artLeft,
                artTop,
                artCellWidth,
                typography.artLineHeight,
                lineTop,
                lineTop + typography.lineHeight,
                typography.artPaddingX,
                typography.artPaddingY,
              )),
      ...getRectIntervalsForBand(
        blockedRects,
        lineTop,
        lineTop + typography.lineHeight,
      ),
    ]);
    const slots =
      blocked.length === 0
        ? [baseSlot]
        : carveTextLineSlots(baseSlot, blocked, typography.minSlotWidth);
    const activeSlots =
      wrapMode === "single" && slots.length > 1
        ? [
            [...slots].sort((left, right) => {
              const widthDelta =
                right.right - right.left - (left.right - left.left);

              if (Math.abs(widthDelta) > 8) {
                return widthDelta;
              }

              return left.left - right.left;
            })[0]!,
          ]
        : slots;
    let advancedOnRow = false;

    for (let slotIndex = 0; slotIndex < activeSlots.length; slotIndex += 1) {
      const slot = activeSlots[slotIndex]!;
      const width = slot.right - slot.left;

      if (width < typography.minSlotWidth) {
        continue;
      }

      const line = layoutNextLine(prepared, cursor, width);

      if (line === null) {
        return {
          fragments,
          artLeft,
          artTop,
          artWidth,
          artHeight,
          contentHeight: Math.max(
            viewportHeight,
            Math.ceil(lineTop + typography.paddingBottom),
          ),
        } satisfies SceneLayout;
      }

      if (sameCursor(cursor, line.end)) {
        continue;
      }

      fragments.push({
        id: `fragment-${lineTop}-${fragmentCount}`,
        left: Math.round(slot.left),
        top: Math.round(lineTop),
        width: line.width,
        text: line.text,
      });
      fragmentCount += 1;
      cursor = line.end;
      advancedOnRow = true;
    }

    lineTop += typography.lineHeight;

    if (!advancedOnRow && activeSlots.length === 0) {
      continue;
    }
  }

  return {
    fragments,
    artLeft,
    artTop,
    artWidth,
    artHeight,
    contentHeight: Math.max(
      viewportHeight,
      Math.ceil(lineTop + typography.paddingBottom),
    ),
  } satisfies SceneLayout;
}
