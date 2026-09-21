import type { IData } from "@/types/data";

import { EventCallback } from "@/utils/eventCallback";

export class BaseData implements IData {
  // 更新事件管理
  protected updateEvent = new EventCallback();

  // 监听器，用于停止watch
  protected unwatch?: Function;

  public get ctx(): any {
    return {};
  }
  /**
   * 触发更新
   */
  triggerUpdate() {
    this.updateEvent.triggerEvent(this.ctx);
  }

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
    this.unwatch?.();
    this.updateEvent.clearEvent();
  }
}
