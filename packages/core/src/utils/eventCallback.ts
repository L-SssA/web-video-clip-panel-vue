/**
 * 事件回调管理器
 */
export class EventCallback {
  // 回调函数集合
  private callbacks = new Map<Function, Function>();

  /**
   * 检查是否存在回调函数
   * @param callback
   */
  hasEvent(callback: Function): boolean {
    return this.callbacks.has(callback);
  }

  /**
   * 添加回调函数
   * @param callback 回调函数
   * @param trigger 是否立即触发
   * @param args 触发参数
   */
  onEvent(callback: any): void {
    this.callbacks.set(callback, callback);
  }

  /**
   * 移除回调函数
   * @param callback 回调函数
   */
  offEvent(callback: any): void {
    this.callbacks.delete(callback);
  }

  /**
   * 触发回调函数
   * @param args 触发参数
   */
  triggerEvent(...args: any[]): void {
    this.callbacks.forEach((callback) => callback(...args));
  }

  /**
   * 清空回调函数
   */
  clearEvent(): void {
    this.callbacks.clear();
  }
}
