import type { BitmapText } from "pixi.js";

import { Container, Graphics } from "pixi.js";

import type { TimelineStyles } from "@/types/timeline";

import { buildCursorLine, buildTimelineGapsAndLabels, buildTimelineHead } from "@/utils/timeline";

import type { PixiHelper } from "./pixiHelper";
import type { Timeline } from "./timeline";

export class TimelinePixiHelper {
  private pixiHelper: PixiHelper;
  // 数据缓存，用于对比决定更新
  private dataCache: Record<string, any> = {};
  // 实例缓存，用于销毁
  private instanceCache: Record<string, any> = {};

  constructor(pixiHelper: PixiHelper) {
    this.pixiHelper = pixiHelper;
  }

  /**
   * 绘制时间线
   * @param ctx
   * @param styles
   */
  drawTimeline(ctx: typeof Timeline.prototype.ctx, styles: Partial<TimelineStyles> = {}) {
    const { redrawTimelineHead, redrawTimeline, redrawCursorLine } = this.checkTimelineUpdate(
      ctx,
      styles,
    );
    // 绘制顶部横线
    this.drawTimelineHead(styles, redrawTimelineHead);
    // 绘制刻度线
    this.drawTimelineGapsAndLabels(ctx, styles, redrawTimeline);
    // 绘制游标线
    this.drawCursorLine(ctx, styles, redrawCursorLine);
    this.dataCache.timeline = { ctx, styles };
  }

  /**
   * 检查时间线是否需要更新
   * @param ctx
   * @param styles
   */
  checkTimelineUpdate(ctx: typeof Timeline.prototype.ctx, styles: Partial<TimelineStyles> = {}) {
    // 未缓存，直接更新
    if (!this.dataCache.timeline) {
      return { redrawTimelineHead: true, redrawTimeline: true, redrawCursorLine: true };
    }
    const checkers = {
      redrawTimelineHead: false,
      redrawTimeline: false,
      redrawCursorLine: false,
    };
    const { ctx: cacheCtx, styles: cacheStyles } = this.dataCache.timeline;
    // 样式不一致需要重建
    if (styles.lineColor !== cacheStyles.lineColor || styles.lineWidth !== cacheStyles.lineWidth) {
      checkers.redrawTimelineHead = true;
      checkers.redrawTimeline = true;
    }
    if (styles.fontColor !== cacheStyles.fontColor || styles.fontSize !== cacheStyles.fontSize) {
      checkers.redrawTimeline = true;
    }
    if (
      styles.cursorLineColor !== cacheStyles.cursorLineColor ||
      styles.cursorLineWidth !== cacheStyles.cursorLineWidth
    ) {
      checkers.redrawCursorLine = true;
    }

    // 时间线相关属性改变需要重建
    if (
      ctx.fps !== cacheCtx.fps ||
      ctx.scale !== cacheCtx.scale ||
      ctx.gapWidth !== cacheCtx.gapWidth ||
      ctx.gapsPerLabel !== cacheCtx.gapsPerLabel ||
      ctx.framesPerGap !== cacheCtx.framesPerGap ||
      ctx.defaultOffset !== cacheCtx.defaultOffset
    )
      checkers.redrawTimeline = true;

    return checkers;
  }

  /**
   * 绘制时间线顶部横线
   * @param styles
   */
  drawTimelineHead(styles: Partial<TimelineStyles> = {}, redraw: boolean = false) {
    if (!this.instanceCache.tlHead) {
      // 创建实例
      const graphics = new Graphics();
      buildTimelineHead(graphics, this.pixiHelper.pixiApp, styles);
      this.instanceCache.tlHead = graphics;
      // 绘制
      this.pixiHelper.draw(graphics);
    } else if (redraw && this.instanceCache.tlHead) {
      this.instanceCache.tlHead.clear();
      buildTimelineHead(this.instanceCache.tlHead, this.pixiHelper.pixiApp, styles);
    }
  }

  /**
   * 绘制时间线刻度线和标签
   * @param ctx
   * @param styles
   */
  drawTimelineGapsAndLabels(
    ctx: typeof Timeline.prototype.ctx,
    styles: Partial<TimelineStyles> = {},
    redraw: boolean = false,
  ) {
    if (!this.instanceCache.tlGapsAndLabels) {
      const container = new Container();
      const graphics = new Graphics();
      container.addChild(graphics);
      buildTimelineGapsAndLabels(container, graphics, this.pixiHelper.pixiApp, ctx, styles);
      this.instanceCache.tlGapsAndLabelsContainer = container;
      this.instanceCache.tlGapsAndLabels = graphics;
      this.pixiHelper.draw(container);
    } else if (redraw && this.instanceCache.tlGapsAndLabels) {
      this.instanceCache.tlGapsAndLabelsContainer.children
        .slice(1)
        .forEach((child: BitmapText) => child.destroy());
      this.instanceCache.tlGapsAndLabels.clear();
      buildTimelineGapsAndLabels(
        this.instanceCache.tlGapsAndLabelsContainer,
        this.instanceCache.tlGapsAndLabels,
        this.pixiHelper.pixiApp,
        ctx,
        styles,
      );
    }
  }

  /**
   * 绘制游标线
   * @param ctx
   * @param styles
   * @param redraw
   */
  drawCursorLine(
    ctx: typeof Timeline.prototype.ctx,
    styles: Partial<TimelineStyles> = {},
    redraw: boolean = false,
  ) {
    // 如果游标线位置小于0则不绘制
    if (ctx.cursorLinePosition < 0) return;
    // 如果未创建实例，则先创建实例
    if (!this.instanceCache.tlCursorLine) {
      const graphics = new Graphics();
      buildCursorLine(graphics, this.pixiHelper.pixiApp, ctx, styles);
      this.instanceCache.tlCursorLine = graphics;
      this.pixiHelper.draw(graphics);
    } else if (redraw && this.instanceCache.tlCursorLine) {
      this.instanceCache.tlCursorLine.clear();
      buildCursorLine(this.instanceCache.tlCursorLine, this.pixiHelper.pixiApp, ctx, styles);
    } else {
      // 如果有缓存，则只更新位置
      this.instanceCache.tlCursorLine.position.set(ctx.cursorLinePosition + ctx.defaultOffset, 0);
    }
  }
}
