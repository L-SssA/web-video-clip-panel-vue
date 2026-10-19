import type { CursorLineServiceContext } from "@/types/data";

import { BaseService } from "./BaseService";

export class CursorLineService extends BaseService {
  private _cursorMoving: boolean = false;

  get ctx(): CursorLineServiceContext {
    return {
      cursorMoving: this._cursorMoving,
    };
  }

  /**
   * 停用事件
   */
  deactiveEvents() {
    this.deactivateCursorLineMoving();
  }

  /**
   * 激活游标线移动
   */
  activateCursorLineMoving() {
    this._cursorMoving = true;
  }

  /**
   * 停用游标线移动
   */
  deactivateCursorLineMoving() {
    this._cursorMoving = false;
  }

  /**
   * 根据标识更新数据
   */
  triggerUpdateByTag() {
    // 处理游标线移动
    if (this._cursorMoving && this._data.system.mouseEvent) {
      const movedX = this._data.system.mouseEvent.clientX;
      this._data.setCurrentTimeByPixel(movedX);
    }
  }
}
