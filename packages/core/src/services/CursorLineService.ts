import { BaseService } from "./BaseService";

export class CursorLineService extends BaseService {
  private cursorMoving: boolean = false;

  /**
   * 清理事件标识
   */
  clearEventTag() {
    this.cursorMoving = false;
  }

  /**
   * 激活游标线移动
   */
  activateCursorLineMoving() {
    this.cursorMoving = true;
  }

  /**
   * 根据标识更新数据
   */
  triggerUpdateByTag() {
    // 处理游标线移动
    if (this.cursorMoving && this._data.system.mouseEvent) {
      const movedX = this._data.system.mouseEvent.clientX;
      this._data.setCurrentTimeByPixel(movedX);
    }
  }
}
