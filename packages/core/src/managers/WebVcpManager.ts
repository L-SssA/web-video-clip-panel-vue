import type { WebVcpManagerOptions } from "@/types/manager";

import { DataManager } from "./DataManager";

export class WebVcpManager {
  public data: DataManager;

  constructor(options: Partial<WebVcpManagerOptions> = {}) {
    // 数据
    this.data = new DataManager(options.data);
  }

  /**
   * 设置主题
   * @param themeTag
   */
  setTheme(themeTag: string) {
    this.data.setTheme(themeTag);
  }

  /**
   * 添加源
   * @param type
   * @param source
   * @param opts
   */
  async addSource(type: string, source: string, opts: any = {}) {
    return await this.data.addSource(type, source, opts);
  }

  /**
   * 设置用于监听鼠标移动事件的元素
   * @param el 页面元素
   */
  setElementToListenMouseMove(el: HTMLElement | null) {
    this.data.setElementToListenMouseMove(el);
  }

  /**
   * 监听鼠标接近边缘
   */
  onMouseCloseEdge(func: (edgeSide: string) => void) {
    this.data.onMouseCloseEdge(func);
  }

  /**
   * 销毁
   */
  public destroy() {
    this.data.release();
  }
}
