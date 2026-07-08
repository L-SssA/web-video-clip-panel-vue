import type { Application, Container } from "pixi.js";

/**
 * 渲染器接口
 */
export interface IRenderer {
  /**
   * 初始化渲染器
   * @param app Pixi应用实例
   * @param container 可选的容器
   */
  init(app: Application, container?: Container): void;

  /**
   * 执行渲染
   * @param data 渲染数据
   * @param styles 渲染样式
   */
  render(data: any, styles: any): void;

  /**
   * 清理资源
   */
  destroy(): void;

  /**
   * 是否已初始化
   */
  isInitialized: boolean;
}
