import type { WebVcpManagerOptions } from "@/types/webvcp";

import { DataManager } from "./DataManager";

export class WebVcpManager {
  public data: DataManager;

  constructor(options: Partial<WebVcpManagerOptions> = {}) {
    const { data: dataOptions } = options;
    // 数据
    this.data = new DataManager(dataOptions);
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
   * 销毁
   */
  public destroy() {
    this.data.release();
  }
}
