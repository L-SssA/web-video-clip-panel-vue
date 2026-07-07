import type { FederatedPointerEvent } from "pixi.js";

/**
 * TimelineRenderer 支持的事件类型
 */
export interface TimelineEvents {
  /** 时间线点击事件 */
  timelineClick: (event: FederatedPointerEvent) => void;
}
