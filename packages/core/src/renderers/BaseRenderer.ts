import type { Application, Container } from "pixi.js";

import type { IRenderer } from "@/types/renderer";

/**
 * 渲染器基类
 * 提供通用的初始化和销毁逻辑
 */
export abstract class BaseRenderer implements IRenderer {
  protected app: Application | null = null;
  protected container: Container | null = null;
  protected _isInitialized: boolean = false;

  get isInitialized(): boolean {
    return this._isInitialized;
  }

  /**
   * 初始化渲染器
   * @param app Pixi应用实例
   * @param container 可选的容器
   */
  init(app: Application, container?: Container): void {
    if (this._isInitialized) {
      console.warn("Renderer has already been initialized");
      return;
    }

    this.app = app;
    this.container = container || app.stage;
    this._isInitialized = true;

    this.onInit();
  }

  /**
   * 执行渲染（子类必须实现）
   * @param data 渲染数据
   * @param styles 渲染样式
   */
  abstract render(data: any, styles: any): void;

  /**
   * 清理资源
   */
  destroy(): void {
    this.onDestroy();
    this.app = null;
    this.container = null;
    this._isInitialized = false;
  }

  /**
   * 初始化钩子（子类可选实现）
   */
  protected onInit(): void {
    // 子类可以重写此方法添加自定义初始化逻辑
  }

  /**
   * 销毁钩子（子类可选实现）
   */
  protected onDestroy(): void {
    // 子类可以重写此方法添加自定义清理逻辑
  }
}
