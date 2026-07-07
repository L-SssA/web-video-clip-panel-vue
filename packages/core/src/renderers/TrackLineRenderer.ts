import { BaseRenderer } from "./BaseRenderer";

/**
 * 视频轨道渲染器
 * 负责视频轨道的渲染
 */
export class TrackLineRenderer extends BaseRenderer {
  render(data: any, styles: any): void {
    console.log("TrackLineRenderer", data, styles);
  }
}
