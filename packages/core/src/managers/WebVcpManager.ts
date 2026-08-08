import type { ApplicationOptions } from "pixi.js";

import { TIMELINE_RENDERER_SYMBOL, TRACKLINE_RENDERER_SYMBOL } from "@/config/symbol";
import { useWindowResize } from "@/hooks/useWindowResize";
import { TimelineRenderer } from "@/renderers/TimelineRenderer";
import { TrackLineRenderer } from "@/renderers/TrackLineRenderer";

import { DataManager } from "./DataManager";
import { RendererManager } from "./RendererManager";

export class WebVcpManager {
  public renderer: RendererManager;
  public data: DataManager;

  public timeline: TimelineRenderer;
  public trackline: TrackLineRenderer;

  private unlistenResize: Function | null = null;

  constructor() {
    this.renderer = new RendererManager();
    this.data = new DataManager();

    // 注册时间线渲染器
    const timelineRenderer = new TimelineRenderer();
    this.renderer.register(TIMELINE_RENDERER_SYMBOL, timelineRenderer);
    this.timeline = timelineRenderer;
    // 注册轨道渲染器
    const trackLineRenderer = new TrackLineRenderer();
    this.renderer.register(TRACKLINE_RENDERER_SYMBOL, trackLineRenderer);
    this.trackline = trackLineRenderer;
  }

  /**
   * 初始化
   * @param el
   * @param options
   */
  async init(el: HTMLElement, options?: Partial<ApplicationOptions>) {
    await this.renderer.init(el, options);
    await this.renderAll();

    this.bindEvents();
  }

  /**
   * 重新渲染
   */
  async renderAll() {
    await this.renderer.renderAll(this.data.ctx);
  }

  /**
   * 销毁
   */
  public destroy() {
    this.unbindEvents();
    this.renderer.destroy();
    this.data.release();
  }

  /**
   * 绑定事件
   */
  private bindEvents() {
    // 数据变化时重新渲染
    this.data.onUpdate(this.renderAll.bind(this));

    // 时间线交互事件
    this.timeline.on("timelineClick", this.updateCurrentTime.bind(this));
    this.timeline.on("cursorLineMove", this.updateCurrentTime.bind(this));

    // 窗口resize时重新渲染
    this.unlistenResize = useWindowResize(this.renderAll.bind(this));
  }

  /**
   * 解绑事件
   */
  private unbindEvents() {
    this.data.offUpdate(this.renderAll);

    this.timeline.off("timelineClick", this.updateCurrentTime);
    this.timeline.off("cursorLineMove", this.updateCurrentTime);

    if (this.unlistenResize) {
      this.unlistenResize();
    }
  }

  /**
   * 更新当前时间
   * @param event
   */
  private updateCurrentTime(event: any) {
    this.data.setCurrentTimeByPixel(event.global.x);
  }
}
