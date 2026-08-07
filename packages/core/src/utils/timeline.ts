import type { Application } from "pixi.js";

import { BitmapText, Rectangle, Graphics, Container } from "pixi.js";

import type { DataManagerContext } from "@/types/data";
import type { TimelineStyles } from "@/types/timeline";

import { getTrackDurationFormatted } from "./tools";

/**
 * 构建时间线顶部横线上下文
 * @param styles 时间线样式
 */
export function buildTimelineHead(
  app: Application,
  styles: Partial<TimelineStyles> = {},
  graphics: Graphics = new Graphics(),
) {
  // 先做清理
  graphics.clear();

  const { lineColor = "#555555", lineWidth = 2 } = styles;
  // 绘制顶部横线
  graphics.moveTo(0, 0).lineTo(app.screen.width, 0).stroke({ color: lineColor, width: lineWidth });

  return {
    timelineHead: graphics,
  };
}

/**
 * 构建时间线刻度和标签上下文
 * @param styles 时间线样式
 */
export function buildTimelineGapsAndLabels(
  app: Application,
  ctx: DataManagerContext,
  styles: Partial<TimelineStyles> = {},
  container: Container = new Container(),
  linegraphics: Graphics = new Graphics(),
  textList: BitmapText[] = [],
) {
  // 先做清理
  linegraphics.clear();
  textList.forEach((child) => child.destroy());
  textList.splice(0);

  const { fps, gapWidth, gapsPerLabel, framesPerGap, marginLeft } = ctx.timeline;
  const { lineColor = "#555555", lineWidth = 2, fontColor = "#888888", fontSize = 12 } = styles;
  const gapCounts = Math.floor(app.screen.width / gapWidth);
  for (let i = 0; i < gapCounts; i++) {
    // 绘制刻度
    const offsetX = Math.floor(i * gapWidth) + marginLeft;
    linegraphics
      .moveTo(offsetX, 0)
      .lineTo(offsetX, i % gapsPerLabel === 0 ? 20 : 6)
      .stroke({ color: lineColor, width: lineWidth });
    // 绘制刻度标签
    if (i % gapsPerLabel === 0 && i !== 0) {
      const text = new BitmapText({
        text: getTrackDurationFormatted(i * framesPerGap, fps),
        style: {
          fontFamily: "ui-monospace",
          fontSize: `${fontSize}px`,
          fill: fontColor,
        },
      });
      text.position.set(offsetX + 6, 20 - fontSize);
      textList.push(text);
    }
  }
  container.hitArea = new Rectangle(marginLeft, 0, app.screen.width - marginLeft, 30);
  container.addChild(linegraphics, ...textList);

  return {
    timelineGapsAndLabels: container,
    timelineGaps: linegraphics,
    textList: textList,
  };
}

/**
 * 构建游标线上下文
 * @param styles 游标线样式
 */
export function buildCursorLine(
  app: Application,
  ctx: DataManagerContext,
  styles: Partial<TimelineStyles> = {},
  graphics: Graphics = new Graphics(),
) {
  // 先做清理
  graphics.clear();

  const { cursorLineColor = "#f5f5f5", cursorLineWidth = 2 } = styles;
  const { cursorLinePosition, marginLeft } = ctx.timeline;
  // 游标线
  graphics
    .moveTo(0, 0)
    .lineTo(0, app.screen.height)
    .stroke({ color: cursorLineColor, width: cursorLineWidth });
  // 游标
  const path = [
    cursorLineWidth / 2 + 4,
    0,
    cursorLineWidth / 2 + 4,
    10,
    0,
    16,
    -cursorLineWidth / 2 - 4,
    10,
    -cursorLineWidth / 2 - 4,
    0,
  ];
  graphics.poly(path).fill({ color: cursorLineColor });
  graphics.position.set(cursorLinePosition + marginLeft, 0);
  graphics.zIndex = 100;
  return {
    cursorLine: graphics,
  };
}
