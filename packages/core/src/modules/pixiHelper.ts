import type { ApplicationOptions, ContainerChild } from "pixi.js";

import { Application, extensions, CullerPlugin, ResizePlugin, Container } from "pixi.js";

import type { TimelineStyles } from "@/types/timeline";

import type { Timeline } from "./timeline";

import { TimelinePixiHelper } from "./timelinePixiHelper";

export class PixiHelper {
  // 是否初始化完成
  private initialized = false;
  // dom 容器
  private el: HTMLElement | null = null;
  // pixi 应用
  private app: Application;
  // timeline pixi 助手
  private timelinePixiHelper: TimelinePixiHelper;

  // 是否初始化完成
  get isInitialized() {
    return this.initialized;
  }

  get pixiApp() {
    return this.app;
  }

  constructor() {
    this.app = new Application();
    this.timelinePixiHelper = new TimelinePixiHelper(this);
  }

  /**
   * 初始化PixiHelper
   * @param el
   * @param pixiAppOptions
   */
  async init(el: HTMLElement, pixiAppOptions?: Partial<ApplicationOptions>) {
    // 如果已经初始化或者el不存在则返回
    if (this.initialized) return console.warn("PixiHelper has already been initialized");
    if (!el) throw new Error("HTMLElement is null");

    this.el = el;
    await this.app.init({ ...pixiAppOptions, resizeTo: this.el });

    this.registerExtensions();

    this.el.appendChild(this.app.canvas);
    this.initialized = true;
  }

  /**
   * 注册插件
   */
  private registerExtensions() {
    // 自动缩放插件
    extensions.add(ResizePlugin);
    // 离屏自动剔除渲染插件
    extensions.add(CullerPlugin);
  }

  /**
   * 绘制子对象
   * @param child
   */
  draw(child: Container<ContainerChild>) {
    this.app.stage.addChild(child);
  }

  /**
   * 绘制时间线
   * @param ctx
   * @param styles
   */
  drawTimeline(ctx: typeof Timeline.prototype.ctx, styles: Partial<TimelineStyles> = {}) {
    this.timelinePixiHelper.drawTimeline(ctx, styles);
  }
}
