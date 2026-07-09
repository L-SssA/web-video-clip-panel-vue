import type { IData } from "@/types/data";

import { EventCallback } from "@/utils/eventCallback";

export class BaseData implements IData {
  // 更新事件管理
  protected updateEvent = new EventCallback();

  /**
   * 添加更新回调
   * @param callback 回调函数
   */
  onUpdate(callback: Function): void {
    if (this.updateEvent.hasEvent(callback)) return;
    this.updateEvent.onEvent(callback);
  }

  /**
   * 移除更新回调
   * @param callback 回调函数
   */
  offUpdate(callback: Function): void {
    this.updateEvent.offEvent(callback);
  }

  /**
   * 释放资源
   */
  release(): void {
    this.updateEvent.clearEvent();
  }
}
