import type { WebVcpManagerOptions } from "@/types/manager";

import { DataManager } from "./DataManager";
import { UserEventManager } from "./UserEventManager";

export class WebVcpManager {
  public data: DataManager;

  private userEvents: UserEventManager;

  constructor(options: Partial<WebVcpManagerOptions> = {}) {
    const { data: dataOptions } = options;
    // 数据
    this.data = new DataManager(dataOptions);
    // 事件管理器
    this.userEvents = new UserEventManager(this.data);
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
    this.userEvents.setElementToListenMouseMove(el);
  }

  /**
   * 销毁
   */
  public destroy() {
    this.data.release();
    this.userEvents.release();
  }
}
