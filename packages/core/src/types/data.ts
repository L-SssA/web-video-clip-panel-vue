export interface IData {
  /**
   * 添加更新回调
   * @param callback 回调函数
   */
  onUpdate(callback: Function): void;
  /**
   * 移除更新回调
   * @param callback 回调函数
   */
  offUpdate(callback: Function): void;
  /**
   * 释放资源
   */
  release(): void;
}
