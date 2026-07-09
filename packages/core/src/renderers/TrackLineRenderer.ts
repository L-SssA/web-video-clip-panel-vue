import { type Application, type Container } from "pixi.js";

import type { TrackLineContext } from "@/types/trackline";

import { BaseRenderer } from "./BaseRenderer";

/**
 * 视频轨道渲染器
 * 负责视频轨道的渲染
 */
export class TrackLineRenderer extends BaseRenderer {
  init(app: Application, container?: Container): void {
    super.init(app, container);
  }

  /**
   * 执行渲染
   * @param data 渲染数据
   * @param styles 渲染样式
   */
  render(data: TrackLineContext, styles: any): void {
    console.log("TrackLineRenderer", data, styles);
  }
}
