import { Application, BitmapText, Container, Graphics } from "pixi.js";

import type { TimelineContext } from "@/types/renderer";
import type { TimelineStyles } from "@/types/timeline";

import { buildCursorLine, buildTimelineGapsAndLabels, buildTimelineHead } from "@/utils/timeline";

import { BaseRenderer } from "./BaseRenderer";

/**
 * 时间线渲染器
 * 负责时间线相关的所有渲染（顶部横线、刻度、标签、游标）
 */
export class TimelineRenderer extends BaseRenderer {
  // 缓存 Graphics 实例
  private headGraphics: Graphics | null = null;
  private gapsContainer: Container | null = null;
  private gapsGraphics: Graphics | null = null;
  private cursorGraphics: Graphics | null = null;

  // 数据缓存（用于对比是否需要重绘）
  private dataCache: {
    timeline?: {
      ctx: TimelineContext;
      styles: Partial<TimelineStyles>;
      app: { width: number; height: number };
    };
  } = {};

  init(app: Application, container?: Container): void {
    super.init(app, container);
  }

  /**
   * 执行渲染
   * @param ctx 时间线上下文数据
   * @param styles 时间线样式
   */
  render(ctx: TimelineContext, styles: Partial<TimelineStyles> = {}): void {
    if (!this.isInitialized || !this.app) {
      console.warn("TimelineRenderer is not initialized");
      return;
    }

    const { redrawTimelineHead, redrawTimeline, redrawCursorLine } = this.checkTimelineUpdate(
      ctx,
      styles,
    );

    // 绘制顶部横线
    this.drawHead(styles, redrawTimelineHead);
    // 绘制刻度线
    this.drawGapsAndLabels(ctx, styles, redrawTimeline);
    // 绘制游标线
    this.drawCursorLine(ctx, styles, redrawCursorLine);

    // 更新缓存
    this.dataCache.timeline = {
      ctx,
      styles,
      app: {
        width: this.app.screen.width,
        height: this.app.screen.height,
      },
    };
  }

  /**
   * 清理资源
   */
  destroy(): void {
    // 销毁所有 Graphics 实例
    if (this.headGraphics) {
      this.headGraphics.destroy();
      this.headGraphics = null;
    }
    if (this.gapsContainer) {
      this.gapsContainer.destroy({ children: true });
      this.gapsContainer = null;
      this.gapsGraphics = null;
    }
    if (this.cursorGraphics) {
      this.cursorGraphics.destroy();
      this.cursorGraphics = null;
    }

    // 清空缓存
    this.dataCache = {};

    super.destroy();
  }

  /**
   * 检查时间线是否需要更新
   * @param ctx 时间线上下文
   * @param styles 时间线样式
   */
  private checkTimelineUpdate(
    ctx: TimelineContext,
    styles: Partial<TimelineStyles> = {},
  ): {
    redrawTimelineHead: boolean;
    redrawTimeline: boolean;
    redrawCursorLine: boolean;
  } {
    // 未缓存，直接更新
    if (!this.dataCache.timeline) {
      return { redrawTimelineHead: true, redrawTimeline: true, redrawCursorLine: true };
    }

    const { ctx: cacheCtx, styles: cacheStyles, app: cacheApp } = this.dataCache.timeline;

    // app 大小改变需要重建
    if (this.app?.screen.width !== cacheApp.width || this.app?.screen.height !== cacheApp.height) {
      return { redrawTimelineHead: true, redrawTimeline: true, redrawCursorLine: true };
    }

    const checkers = {
      redrawTimelineHead: false,
      redrawTimeline: false,
      redrawCursorLine: false,
    };

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
    ) {
      checkers.redrawTimeline = true;
    }

    return checkers;
  }

  /**
   * 绘制时间线顶部横线
   * @param styles 时间线样式
   * @param redraw 是否重新绘制
   */
  private drawHead(styles: Partial<TimelineStyles> = {}, redraw: boolean = false): void {
    if (!this.app) return;

    if (!this.headGraphics) {
      // 创建实例
      const graphics = new Graphics();
      buildTimelineHead(graphics, this.app, styles);
      this.headGraphics = graphics;
      // 绘制到容器
      this.container?.addChild(graphics);
    } else if (redraw && this.headGraphics) {
      this.headGraphics.clear();
      buildTimelineHead(this.headGraphics, this.app, styles);
    }
  }

  /**
   * 绘制时间线刻度线和标签
   * @param ctx 时间线上下文
   * @param styles 时间线样式
   * @param redraw 是否重新绘制
   */
  private drawGapsAndLabels(
    ctx: TimelineContext,
    styles: Partial<TimelineStyles> = {},
    redraw: boolean = false,
  ): void {
    if (!this.app) return;

    if (!this.gapsContainer) {
      const container = new Container();
      const graphics = new Graphics();
      container.addChild(graphics);
      buildTimelineGapsAndLabels(container, graphics, this.app, ctx, styles);
      this.gapsContainer = container;
      this.gapsGraphics = graphics;
      this.container?.addChild(container);
    } else if (redraw && this.gapsGraphics && this.gapsContainer) {
      // 清除旧的文本标签（保留 graphics）
      this.gapsContainer.children.slice(1).forEach((child) => {
        if (child instanceof BitmapText) {
          child.destroy();
        }
      });
      this.gapsGraphics.clear();
      buildTimelineGapsAndLabels(this.gapsContainer, this.gapsGraphics, this.app, ctx, styles);
    }
  }

  /**
   * 绘制游标线
   * @param ctx 时间线上下文
   * @param styles 时间线样式
   * @param redraw 是否重新绘制
   */
  private drawCursorLine(
    ctx: TimelineContext,
    styles: Partial<TimelineStyles> = {},
    redraw: boolean = false,
  ): void {
    if (!this.app) return;

    // 如果游标线位置小于0则不绘制
    if (ctx.cursorLinePosition < 0) return;

    // 如果未创建实例，则先创建实例
    if (!this.cursorGraphics) {
      const graphics = new Graphics();
      buildCursorLine(graphics, this.app, ctx, styles);
      this.cursorGraphics = graphics;
      this.container?.addChild(graphics);
    } else if (redraw && this.cursorGraphics) {
      this.cursorGraphics.clear();
      buildCursorLine(this.cursorGraphics, this.app, ctx, styles);
    } else {
      // 如果有缓存，则只更新位置
      this.cursorGraphics.position.set(ctx.cursorLinePosition + ctx.defaultOffset, 0);
    }
  }
}
