import { type ApplicationOptions, type ContainerChild } from "pixi.js";
import {
  Application,
  extensions,
  CullerPlugin,
  ResizePlugin,
  BitmapText,
  Container,
  Graphics,
} from "pixi.js";

import type { TimelineStyles } from "@/types/timeline";

import { getTrackDurationFormatted } from "@/utils/tools";

import type { Timeline } from "./timeline";

export class PixiHelper {
  // 是否初始化完成
  private initialized = false;
  // dom 容器
  private el: HTMLElement | null = null;
  // pixi 应用
  private app: Application;

  // 是否初始化完成
  get isInitialized() {
    return this.initialized;
  }

  get pixiApp() {
    return this.app;
  }

  constructor() {
    this.app = new Application();
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
  registerExtensions() {
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
}

export function createTimelineInPixi(
  app: Application,
  ctx: typeof Timeline.prototype.ctx,
  styles: Partial<TimelineStyles> = {},
) {
  const container = new Container();
  const graphics = new Graphics();
  const { lineColor = "#555555", lineWidth = 2, fontColor = "#888888", fontSize = 12 } = styles;
  // 绘制顶部横线
  graphics.moveTo(0, 0).lineTo(app.screen.width, 0).stroke({ color: lineColor, width: lineWidth });
  // 绘制刻度线
  const gapCounts = Math.floor(app.screen.width / ctx.gapWidth);
  for (let i = 0; i < gapCounts; i++) {
    const offsetX = Math.floor(i * ctx.gapWidth) + 60;
    graphics
      .moveTo(offsetX, 0)
      .lineTo(offsetX, i % ctx.gapsPerLabel === 0 ? 20 : 6)
      .stroke({ color: lineColor, width: lineWidth });
    // 绘制刻度标签
    if (i % ctx.gapsPerLabel === 0 && i !== 0) {
      const text = new BitmapText({
        text: getTrackDurationFormatted(i * ctx.framesPerGap),
        style: {
          fontFamily: "ui-monospace",
          fontSize: `${fontSize}px`,
          fill: fontColor,
        },
      });
      text.position.set(offsetX + 6, 20 - fontSize);
      container.addChild(text);
    }
  }
  container.addChild(graphics);
  return container;
}
