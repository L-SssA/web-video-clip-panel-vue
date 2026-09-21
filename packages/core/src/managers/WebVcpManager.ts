import type { WebVcpManagerOptions } from "@/types/webvcp";

import { useWindowResize } from "@/hooks/useWindowResize";

import { DataManager } from "./DataManager";

export class WebVcpManager {
  public data: DataManager;

  private unbindWindowResize?: () => void;

  constructor(options: Partial<WebVcpManagerOptions> = {}) {
    const { data: dataOptions } = options;
    // 数据
    this.data = new DataManager(dataOptions);
    // 绑定事件
    this.bindEvents();
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
   * 绑定相关事件
   */
  bindEvents() {
    this.unbindWindowResize = useWindowResize(this.handleWindowResize.bind(this));
  }

  /**
   * 处理窗口大小变化事件
   */
  handleWindowResize() {
    this.data.triggerUpdate();
  }

  /**
   * 销毁
   */
  public destroy() {
    this.data.release();
    this.unbindEvents();
  }

  /**
   * 解除绑定相关事件
   */
  unbindEvents() {
    this.unbindWindowResize?.();
  }
}
