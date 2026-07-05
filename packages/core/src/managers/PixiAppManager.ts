import type { ApplicationOptions } from "pixi.js";

import { Application, extensions, CullerPlugin, ResizePlugin } from "pixi.js";

/**
 * Pixi 应用管理器
 * 负责 Pixi 应用的生命周期管理
 */
export class PixiAppManager {
  private app: Application;
  private initialized: boolean = false;
  private el: HTMLElement | null = null;

  /**
   * 是否已初始化
   */
  get isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * 获取 Pixi 应用实例
   */
  get appInstance(): Application {
    return this.app;
  }

  constructor() {
    this.app = new Application();
  }

  /**
   * 初始化 Pixi 应用
   * @param el DOM 容器元素
   * @param options Pixi 应用配置选项
   */
  async init(el: HTMLElement, options?: Partial<ApplicationOptions>): Promise<void> {
    if (this.initialized) {
      return console.warn("PixiAppManager has already been initialized");
    }

    if (!el) {
      throw new Error("HTMLElement is null");
    }

    this.el = el;
    await this.app.init({ ...options, resizeTo: this.el });

    this.registerExtensions();

    this.el.appendChild(this.app.canvas);
    this.initialized = true;
  }

  /**
   * 注册 Pixi 插件
   */
  private registerExtensions(): void {
    // 自动缩放插件
    extensions.add(ResizePlugin);
    // 离屏自动剔除渲染插件
    extensions.add(CullerPlugin);
  }

  /**
   * 销毁 Pixi 应用
   */
  destroy(): void {
    if (this.app) {
      this.app.destroy(true, { children: true, texture: true });
      this.app = new Application();
      this.initialized = false;
      this.el = null;
    }
  }
}
