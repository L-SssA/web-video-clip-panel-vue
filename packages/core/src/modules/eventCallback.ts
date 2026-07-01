export class EventCallback {
  // 回调函数集合
  private callbacks = new Map<Function, Function>();

  /**
   * 检查是否存在回调函数
   * @param callback
   */
  hasEvent(callback: Function) {
    return this.callbacks.has(callback);
  }

  /**
   * 添加回调函数
   * @param callback
   * @param args
   */
  onEvent(callback: any, trigger: boolean, ...args: any[]) {
    this.callbacks.set(callback, callback);
    if (trigger) callback(...args);
  }

  /**
   * 移除回调函数
   * @param callback
   */
  offEvent(callback: any) {
    this.callbacks.delete(callback);
  }

  /**
   * 触发回调函数
   * @param args
   */
  triggerEvent(...args: any[]) {
    this.callbacks.forEach((callback) => callback(...args));
  }

  /**
   * 清空回调函数
   */
  clearEvent() {
    this.callbacks.clear();
  }
}
