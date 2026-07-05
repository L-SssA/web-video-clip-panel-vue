import type { ApplicationOptions } from "pixi.js";

import type { IRenderer } from "@/types/renderer";

import { PixiAppManager } from "./PixiAppManager";

/**
 * 渲染器管理器
 * 统一管理所有渲染器的注册、初始化和调用
 */
export class RendererManager {
  private pixiAppManager: PixiAppManager;
  private renderers: Map<string, IRenderer> = new Map();

  constructor() {
    this.pixiAppManager = new PixiAppManager();
  }

  /**
   * 注册渲染器
   * @param name 渲染器名称
   * @param renderer 渲染器实例
   */
  register(name: string, renderer: IRenderer): void {
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
  unregister(name: string): void {
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

    for (const [name, renderer] of this.renderers) {
      try {
        await renderer.init(app);
      } catch (error) {
        console.error(`Failed to initialize renderer "${name}":`, error);
      }
    }
  }

  /**
   * 触发指定渲染器进行渲染
   * @param name 渲染器名称
   * @param data 渲染数据
   * @param styles 渲染样式
   */
  render(name: string, data: any, styles: any): void {
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
      renderer.render(data, styles);
    } catch (error) {
      console.error(`Failed to render with "${name}":`, error);
    }
  }

  /**
   * 触发所有渲染器进行渲染
   * @param data 渲染数据
   * @param styles 渲染样式
   */
  renderAll(dataMap: any = {}, stylesMap: any = {}): void {
    for (const [name, renderer] of this.renderers) {
      if (renderer.isInitialized) {
        try {
          renderer.render(dataMap[name] || {}, stylesMap[name] || {});
        } catch (error) {
          console.error(`Failed to render with "${name}":`, error);
        }
      }
    }
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
