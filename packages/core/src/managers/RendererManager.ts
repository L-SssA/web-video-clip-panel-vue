import type { ApplicationOptions } from "pixi.js";

import type { IRenderer } from "@/types/renderer";

import type { DataManager } from "./DataManager";

import { PixiAppManager } from "./PixiAppManager";

/**
 * 渲染器管理器
 * 统一管理所有渲染器的注册、初始化和调用
 */
export class RendererManager {
  private pixiAppManager: PixiAppManager;
  private renderers: Map<string | Symbol, IRenderer> = new Map();

  constructor() {
    this.pixiAppManager = new PixiAppManager();
  }

  /**
   * 注册渲染器
   * @param name 渲染器名称
   * @param renderer 渲染器实例
   */
  register(name: string | Symbol, renderer: IRenderer): void {
    if (this.renderers.has(name)) {
      console.warn(`Renderer "${name}" has already been registered`);
      return;
    }

    this.renderers.set(name, renderer);
  }

  /**
   * 注销渲染器
   * @param name 渲染器名称
   */
  unregister(name: string | Symbol): void {
    const renderer = this.renderers.get(name);
    if (renderer) {
      renderer.destroy();
      this.renderers.delete(name);
    }
  }

  /**
   * 初始化渲染器
   * @param el 容器元素
   * @param options 初始化参数
   */
  async init(el: HTMLElement, options?: Partial<ApplicationOptions>): Promise<void> {
    await this.pixiAppManager.init(el, options);
    await this.initAllRenderers();
  }

  /**
   * 初始化所有已注册的渲染器
   */
  async initAllRenderers(): Promise<void> {
    if (!this.pixiAppManager.isInitialized) {
      throw new Error("PixiAppManager must be initialized before initializing renderers");
    }

    const app = this.pixiAppManager.appInstance;

    await Promise.allSettled(
      Array.from(this.renderers.entries()).map(async ([name, renderer]) =>
        renderer
          .init(app)
          .catch((error) => Promise.reject(`Failed to initialize renderer "${name}": ${error}`)),
      ),
    );
  }

  /**
   * 触发指定渲染器进行渲染
   * @param name 渲染器名称
   * @param data 渲染数据
   * @param styles 渲染样式
   */
  async render(name: string | Symbol, data: DataManager["ctx"]): Promise<void> {
    const renderer = this.renderers.get(name);
    if (!renderer) {
      console.warn(`Renderer "${name}" is not registered`);
      return;
    }

    if (!renderer.isInitialized) {
      console.warn(`Renderer "${name}" is not initialized`);
      return;
    }

    try {
      await renderer.render(data);
    } catch (error) {
      console.error(`Failed to render with "${name}":`, error);
    }
  }

  /**
   * 触发所有渲染器进行渲染
   * @param data 渲染数据
   * @param styles 渲染样式
   */
  async renderAll(data: DataManager["ctx"]): Promise<void> {
    const promises = [];
    for (const [name, renderer] of this.renderers) {
      if (renderer.isInitialized) {
        try {
          promises.push(renderer.render(data || {}));
        } catch (error) {
          console.error(`Failed to render with "${name}":`, error);
        }
      }
    }
    await Promise.allSettled(promises);
  }

  /**
   * 销毁所有渲染器
   */
  destroyAllRenderers(): void {
    for (const [name, renderer] of this.renderers) {
      try {
        renderer.destroy();
      } catch (error) {
        console.error(`Failed to destroy renderer "${name}":`, error);
      }
    }
    this.renderers.clear();
  }

  /**
   * 销毁渲染器
   * @param name 渲染器名称
   */
  destroy() {
    this.pixiAppManager.destroy();
    this.destroyAllRenderers();
  }

  /**
   * 获取已注册的渲染器数量
   */
  get rendererCount(): number {
    return this.renderers.size;
  }
}
