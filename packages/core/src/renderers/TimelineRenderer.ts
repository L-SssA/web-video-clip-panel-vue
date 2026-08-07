import { Application, BitmapText, Container, Graphics } from "pixi.js";

import type { DataManagerContext } from "@/types/data";
import type { TimelineEvents } from "@/types/events";

import { EventCallback } from "@/utils/eventCallback";
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
  private timelineLabels: BitmapText[] = [];

  private eventsMap = new Map<string, EventCallback>();
  private dragCursorLine = false;

  // 数据缓存（用于对比是否需要重绘）
  private dataCache?: {
    ctx: DataManagerContext;
    app: { width: number; height: number };
  };

  async init(app: Application, container?: Container): Promise<void> {
    await super.init(app, container);
  }

  /**
   * 执行渲染
   * @param ctx 时间线上下文数据
   * @param styles 时间线样式
   */
  async render(ctx: DataManagerContext): Promise<void> {
    if (!this.isInitialized || !this.app) {
      console.warn("TimelineRenderer is not initialized");
      return;
    }

    const { redrawTimelineHead, redrawTimeline, redrawCursorLine } = this.checkTimelineUpdate(ctx);

    // 绘制顶部横线
    this.drawTimelineHead(ctx, redrawTimelineHead);
    // 绘制刻度线
    this.drawGapsAndLabels(ctx, redrawTimeline);
    // 绘制游标线
    this.drawCursorLine(ctx, redrawCursorLine);

    if (!this.dataCache) {
      // 表示第一次渲染
      // 绑定事件
      this.mountEvents();
    }

    // 更新缓存
    this.dataCache = {
      ctx,
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
    this.dataCache = undefined;

    // 清理事件
    this.eventsMap.forEach((eventCallback) => eventCallback.clearEvent());
    this.eventsMap.clear();

    super.destroy();
  }

  /**
   * 检查时间线是否需要更新
   * @param ctx 时间线上下文
   */
  private checkTimelineUpdate(ctx: DataManagerContext): {
    redrawTimelineHead: boolean;
    redrawTimeline: boolean;
    redrawCursorLine: boolean;
  } {
    // 未缓存，直接更新
    if (!this.dataCache) {
      return { redrawTimelineHead: true, redrawTimeline: true, redrawCursorLine: true };
    }

    const { ctx: cacheCtx, app: cacheApp } = this.dataCache;

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
    if (
      ctx.timeline.styles.lineColor !== cacheCtx.timeline.styles.lineColor ||
      ctx.timeline.styles.lineWidth !== cacheCtx.timeline.styles.lineWidth
    ) {
      checkers.redrawTimelineHead = true;
      checkers.redrawTimeline = true;
    }
    if (
      ctx.timeline.styles.fontColor !== cacheCtx.timeline.styles.fontColor ||
      ctx.timeline.styles.fontSize !== cacheCtx.timeline.styles.fontSize
    ) {
      checkers.redrawTimeline = true;
    }
    if (
      ctx.timeline.styles.cursorLineColor !== cacheCtx.timeline.styles.cursorLineColor ||
      ctx.timeline.styles.cursorLineWidth !== cacheCtx.timeline.styles.cursorLineWidth
    ) {
      checkers.redrawCursorLine = true;
    }

    // 时间线相关属性改变需要重建
    if (
      ctx.timeline.fps !== cacheCtx.timeline.fps ||
      ctx.timeline.scale !== cacheCtx.timeline.scale ||
      ctx.timeline.gapWidth !== cacheCtx.timeline.gapWidth ||
      ctx.timeline.gapsPerLabel !== cacheCtx.timeline.gapsPerLabel ||
      ctx.timeline.framesPerGap !== cacheCtx.timeline.framesPerGap ||
      ctx.timeline.marginLeft !== cacheCtx.timeline.marginLeft
    ) {
      checkers.redrawTimeline = true;
    }

    return checkers;
  }

  /**
   * 绘制时间线顶部横线
   * @param ctx 时间线上下文
   * @param redraw 是否重新绘制
   */
  private drawTimelineHead(ctx: DataManagerContext, redraw: boolean = false): void {
    if (!this.app) return;

    if (!this.headGraphics) {
      const { timelineHead } = buildTimelineHead(this.app, ctx);
      this.headGraphics = timelineHead;
      this.container?.addChild(timelineHead);
    } else if (redraw && this.headGraphics) {
      buildTimelineHead(this.app, ctx, this.headGraphics);
    }
  }

  /**
   * 绘制时间线刻度线和标签
   * @param ctx 时间线上下文
   * @param redraw 是否重新绘制
   */
  private drawGapsAndLabels(ctx: DataManagerContext, redraw: boolean = false): void {
    if (!this.app) return;

    if (!this.gapsContainer) {
      const { timelineGapsAndLabels, timelineGaps, textList } = buildTimelineGapsAndLabels(
        this.app,
        ctx,
      );
      this.gapsContainer = timelineGapsAndLabels;
      this.gapsGraphics = timelineGaps;
      this.timelineLabels = textList;
      this.container?.addChild(timelineGapsAndLabels);
    } else if (redraw && this.gapsGraphics && this.gapsContainer) {
      buildTimelineGapsAndLabels(
        this.app,
        ctx,
        this.gapsContainer,
        this.gapsGraphics,
        this.timelineLabels,
      );
    }
  }

  /**
   * 绘制游标线
   * @param ctx 时间线上下文
   * @param redraw 是否重新绘制
   */
  private drawCursorLine(ctx: DataManagerContext, redraw: boolean = false): void {
    if (!this.app) return;

    // 如果游标线位置小于0则不绘制
    if (ctx.timeline.cursorLinePosition < 0) return;

    // 如果未创建实例，则先创建实例
    if (!this.cursorGraphics) {
      const { cursorLine } = buildCursorLine(this.app, ctx);
      this.cursorGraphics = cursorLine;
      this.container?.addChild(cursorLine);
    } else if (redraw && this.cursorGraphics) {
      buildCursorLine(this.app, ctx, this.cursorGraphics);
    } else {
      // 如果有缓存，则只更新位置
      this.cursorGraphics.position.set(
        ctx.timeline.cursorLinePosition + ctx.timeline.marginLeft,
        0,
      );
    }
  }

  /**
   * 绑定事件
   */
  mountEvents() {
    // 全局事件
    if (this.app) {
      this.app.stage.eventMode = "static";
      this.app.stage.on("pointermove", (event) => {
        this.dragCursorLine && this.triggerEvent("cursorLineMove", event);
      });
      this.app.stage.on("pointerup", () => {
        this.dragCursorLine = false;
      });
      this.app.stage.on("pointerupoutside", () => {
        this.dragCursorLine = false;
      });
    }

    /* 绑定时间线相关事件 */
    if (this.gapsContainer) {
      this.gapsContainer.eventMode = "static";
      this.gapsContainer.on("pointerdown", (event) => this.triggerEvent("timelineClick", event));
    }

    /* 绑定游标线相关事件 */
    if (this.cursorGraphics) {
      this.cursorGraphics.eventMode = "static";
      this.cursorGraphics.on("pointerdown", () => {
        this.dragCursorLine = true;
      });
    }
  }

  /**
   * 绑定事件
   * @param event 事件名
   * @param func 回调函数
   */
  public on<K extends keyof TimelineEvents>(event: K, func: TimelineEvents[K]) {
    if (!this.eventsMap.has(event)) {
      this.eventsMap.set(event, new EventCallback());
    }
    this.eventsMap.get(event)?.onEvent(func);
  }

  /**
   * 解绑事件
   * @param event 事件名
   * @param func 回调函数
   */
  public off<K extends keyof TimelineEvents>(event: K, func: TimelineEvents[K]) {
    if (this.eventsMap.has(event)) {
      this.eventsMap.get(event)?.offEvent(func);
    }
  }

  /**
   * 触发事件
   * @param event 事件名
   * @param data 事件数据
   */
  private triggerEvent<K extends keyof TimelineEvents>(
    event: K,
    ...args: Parameters<TimelineEvents[K]>
  ) {
    if (this.eventsMap.has(event)) {
      this.eventsMap.get(event)?.triggerEvent(...args);
    }
  }
}
