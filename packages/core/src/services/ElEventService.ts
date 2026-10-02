import { EDGE_SIDE } from "@/config/constant";
import { EventCallback } from "@/utils/eventCallback";

import type { DataManager } from "../managers/DataManager";

import { BaseService } from "./BaseService";

export class ElEventService extends BaseService {
  private _el: HTMLElement | null = null;
  private mouseMoveEvents = new EventCallback();
  private mouseUpEvents = new EventCallback();
  private mouseLeaveEvents = new EventCallback();
  private windowResizeEvents = new EventCallback();
  private mouseCloseEdgeEvents = new EventCallback();

  private domInfo: {
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
      this._el.removeEventListener("mousemove", this.mouseMoveEvents);
      this._el.removeEventListener("mouseup", this.mouseUpEvents);
      this._el.removeEventListener("mouseleave", this.mouseLeaveEvents);
    }

    // 保存页面元素
    this._el = el;
    this.cacheElRectInfo();

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
   * 处理鼠标接近边缘事件
   * @param event 鼠标事件
   */
  handleMouseCloseEdge(event: MouseEvent) {
    if (!this.domInfo) return;
    const { clientX: mouseX, clientY: mouseY } = event;
    const { x: domX, y: domY, width: domW, height: domH } = this.domInfo;
    const { marginLeft } = this._data.timeline.ctx;
    const { closeEdgeDistance } = this._data.system.ctx;
    if (mouseX < domX + marginLeft + closeEdgeDistance) {
      // 接近左侧边缘
      this.mouseCloseEdgeEvents.triggerEvent(EDGE_SIDE.LEFT);
    }
    if (mouseX > domX + domW - closeEdgeDistance) {
      // 接近右侧边缘
      this.mouseCloseEdgeEvents.triggerEvent(EDGE_SIDE.RIGHT);
    }
    if (mouseY < domY + closeEdgeDistance) {
      // 接近上侧边缘
      this.mouseCloseEdgeEvents.triggerEvent(EDGE_SIDE.TOP);
    }
    if (mouseY > domY + domH - closeEdgeDistance) {
      // 接近下侧边缘
      this.mouseCloseEdgeEvents.triggerEvent(EDGE_SIDE.BOTTOM);
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
      this.domInfo = {
        x: offsetLeft,
        y: offsetTop,
        width: offsetWidth,
        height: offsetHeight,
      };
    } else {
      this.domInfo = null;
    }
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    // 绑定鼠标移动事件
    this.mouseMoveEvents.onEvent(this.handleMouseMove.bind(this));
    this.mouseMoveEvents.onEvent(this.handleMouseCloseEdge.bind(this));
    // 绑定鼠标抬起事件
    this.mouseUpEvents.onEvent(this.handleMouseUp.bind(this));
    // 绑定鼠标离开事件
    this.mouseLeaveEvents.onEvent(this.handleMouseUp.bind(this));
    // 绑定窗口大小变化事件
    window.addEventListener("resize", this.windowResizeEvents);
    this.windowResizeEvents.onEvent(this._data.triggerUpdate.bind(this._data));
    this.windowResizeEvents.onEvent(this.cacheElRectInfo.bind(this));
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
   * 监听鼠标接近边缘
   */
  onMouseCloseEdge(func: (edgeSide: string) => void) {
    this.mouseCloseEdgeEvents.onEvent(func);
  }

  /**
   * 释放资源
   */
  release(): void {
    this.unbindEvents();
    this.setElementToListenMouseMove(null);
  }
}
