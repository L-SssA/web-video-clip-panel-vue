import { EDGE_SIDE } from "@/config/constant";
import { EventCallback } from "@/utils/EventCallback";

import type { DataManager } from "../managers/DataManager";

import { BaseService } from "./BaseService";

export class ElEventService extends BaseService {
  private _el: HTMLElement | null = null;
  private _mouseMoveEvents = new EventCallback();
  private _mouseUpEvents = new EventCallback();
  private _mouseLeaveEvents = new EventCallback();
  private _windowResizeEvents = new EventCallback();
  private _mouseCloseEdgeEvents = new EventCallback();

  private _domInfo: {
    x: number;
    y: number;
    width: number;
    height: number;
  } | null = null;
  constructor(data: DataManager) {
    super(data);
    this.bindEvents();
  }

  /**
   * 设置用于监听鼠标移动事件的元素
   * @param el 页面元素
   */
  setElementToListenMouseMove(el: HTMLElement | null) {
    // 解绑旧事件
    if (this._el) {
      this._el.removeEventListener("mousemove", this._mouseMoveEvents);
      this._el.removeEventListener("mouseup", this._mouseUpEvents);
      this._el.removeEventListener("mouseleave", this._mouseLeaveEvents);
    }

    // 保存页面元素
    this._el = el;
    this.cacheElRectInfo();

    // 绑定新事件
    if (this._el) {
      this._el.addEventListener("mousemove", this._mouseMoveEvents);
      this._el.addEventListener("mouseup", this._mouseUpEvents);
      this._el.addEventListener("mouseleave", this._mouseLeaveEvents);
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
   * 处理鼠标接近边缘事件
   * @param event 鼠标事件
   */
  handleMouseCloseEdge(event: MouseEvent) {
    if (!this._domInfo) return;
    const { clientX: mouseX, clientY: mouseY } = event;
    const { x: domX, y: domY, width: domW, height: domH } = this._domInfo;
    const { marginLeft } = this._data.timeline.ctx;
    const { closeEdgeDistance } = this._data.system.ctx;
    if (mouseX < domX + marginLeft + closeEdgeDistance) {
      // 接近左侧边缘
      this._mouseCloseEdgeEvents.triggerEvent(EDGE_SIDE.LEFT);
    }
    if (mouseX > domX + domW - closeEdgeDistance) {
      // 接近右侧边缘
      this._mouseCloseEdgeEvents.triggerEvent(EDGE_SIDE.RIGHT);
    }
    if (mouseY < domY + closeEdgeDistance) {
      // 接近上侧边缘
      this._mouseCloseEdgeEvents.triggerEvent(EDGE_SIDE.TOP);
    }
    if (mouseY > domY + domH - closeEdgeDistance) {
      // 接近下侧边缘
      this._mouseCloseEdgeEvents.triggerEvent(EDGE_SIDE.BOTTOM);
    }
  }

  /**
   * 处理鼠标抬起事件
   * @param event 鼠标事件
   */
  handleMouseUp(_event: MouseEvent) {
    this._data.deactiveEvents();
  }

  /**
   * 缓存元素尺寸位置信息
   */
  cacheElRectInfo() {
    if (this._el) {
      const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = this._el;
      this._domInfo = {
        x: offsetLeft,
        y: offsetTop,
        width: offsetWidth,
        height: offsetHeight,
      };
    } else {
      this._domInfo = null;
    }
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    // 绑定鼠标移动事件
    this._mouseMoveEvents.onEvent(this.handleMouseMove.bind(this));
    this._mouseMoveEvents.onEvent(this.handleMouseCloseEdge.bind(this));
    // 绑定鼠标抬起事件
    this._mouseUpEvents.onEvent(this.handleMouseUp.bind(this));
    // 绑定鼠标离开事件
    this._mouseLeaveEvents.onEvent(this.handleMouseUp.bind(this));
    // 绑定窗口大小变化事件
    window.addEventListener("resize", this._windowResizeEvents);
    this._windowResizeEvents.onEvent(this._data.triggerUpdate.bind(this._data));
    this._windowResizeEvents.onEvent(this.cacheElRectInfo.bind(this));
  }

  /**
   * 解绑事件
   */
  unbindEvents() {
    this._mouseMoveEvents.clearEvent();
    this._mouseUpEvents.clearEvent();
    this._mouseLeaveEvents.clearEvent();
    this._windowResizeEvents.clearEvent();
  }

  /**
   * 监听鼠标接近边缘
   */
  onMouseCloseEdge(func: (edgeSide: string) => void) {
    this._mouseCloseEdgeEvents.onEvent(func);
  }

  /**
   * 释放资源
   */
  release(): void {
    this.unbindEvents();
    this.setElementToListenMouseMove(null);
  }
}
