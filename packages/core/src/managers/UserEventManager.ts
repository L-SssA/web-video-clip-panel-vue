import { EventCallback } from "@/utils/eventCallback";

import type { DataManager } from "./DataManager";

export class UserEventManager {
  private _data: DataManager;
  private _el: HTMLElement | null = null;
  private mouseMoveEvents = new EventCallback();
  private mouseUpEvents = new EventCallback();
  private mouseLeaveEvents = new EventCallback();
  private windowResizeEvents = new EventCallback();

  constructor(data: DataManager) {
    this._data = data;
    this.bindEvents();
  }

  /**
   * 设置用于监听鼠标移动事件的元素
   * @param el 页面元素
   */
  setElementToListenMouseMove(el: HTMLElement | null) {
    // 解绑旧事件
    if (this._el) {
      this._el.removeEventListener("mousemove", this.mouseMoveEvents);
      this._el.removeEventListener("mouseup", this.mouseUpEvents);
      this._el.removeEventListener("mouseleave", this.mouseLeaveEvents);
    }

    // 保存页面元素
    this._el = el;

    // 绑定新事件
    if (this._el) {
      this._el.addEventListener("mousemove", this.mouseMoveEvents);
      this._el.addEventListener("mouseup", this.mouseUpEvents);
      this._el.addEventListener("mouseleave", this.mouseLeaveEvents);
    }
  }

  /**
   * 处理鼠标移动事件
   * @param event 鼠标事件
   */
  handleMouseMove(event: MouseEvent) {
    this._data.system.mouseEvent = event;
    this._data.triggerUpdateByTag();
  }

  /**
   * 处理鼠标抬起事件
   * @param event 鼠标事件
   */
  handleMouseUp(_event: MouseEvent) {
    this._data.clearEventTag();
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    // 绑定鼠标移动事件
    this.mouseMoveEvents.onEvent(this.handleMouseMove.bind(this));
    // 绑定鼠标抬起事件
    this.mouseUpEvents.onEvent(this.handleMouseUp.bind(this));
    // 绑定鼠标离开事件
    this.mouseLeaveEvents.onEvent(this.handleMouseUp.bind(this));
    // 绑定窗口大小变化事件
    window.addEventListener("resize", this.windowResizeEvents);
    this.windowResizeEvents.onEvent(this._data.triggerUpdate.bind(this._data));
  }

  /**
   * 解绑事件
   */
  unbindEvents() {
    this.mouseMoveEvents.clearEvent();
    this.mouseUpEvents.clearEvent();
    this.mouseLeaveEvents.clearEvent();
    this.windowResizeEvents.clearEvent();
  }

  /**
   * 释放资源
   */
  release(): void {
    this.unbindEvents();
    this.setElementToListenMouseMove(null);
  }
}
